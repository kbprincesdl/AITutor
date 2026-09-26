import { AppLanguage } from '../types';

let currentAudio: HTMLAudioElement | null = null;
let speakingStatus = false;
const speechListeners = new Set<(isSpeaking: boolean) => void>();

function setSpeaking(isSpeaking: boolean) {
  speakingStatus = isSpeaking;
  speechListeners.forEach((fn) => {
    try {
      fn(isSpeaking);
    } catch (e) {
      console.warn('Speech listener error:', e);
    }
  });
}

export function subscribeSpeechStatus(fn: (isSpeaking: boolean) => void): () => void {
  speechListeners.add(fn);
  fn(speakingStatus);
  return () => {
    speechListeners.delete(fn);
  };
}

export function isSpeakingNow(): boolean {
  return speakingStatus;
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  setSpeaking(false);
}

// Unlock audio on iOS/Android mobile user interaction
export function unlockMobileAudio() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      ctx.resume().then(() => ctx.close()).catch(() => {});
    }
  } catch (e) {
    // ignore
  }
}

export async function speakText(
  text: string,
  language: AppLanguage,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  stopSpeaking();
  if (!text || text.trim().length === 0) return;

  unlockMobileAudio();
  setSpeaking(true);
  onStart?.();

  const handleFinished = () => {
    setSpeaking(false);
    onEnd?.();
  };

  // Try server-side TTS first
  try {
    const res = await fetch('/api/tutor/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audioSrc = `data:audio/mp3;base64,${data.audioBase64}`;
        currentAudio = new Audio(audioSrc);
        currentAudio.onended = () => {
          currentAudio = null;
          handleFinished();
        };
        currentAudio.onerror = () => {
          fallbackSpeechSynthesis(text, language, handleFinished);
        };
        await currentAudio.play();
        return;
      }
    }
  } catch (err) {
    console.log('Using browser speech fallback:', err);
  }

  // Fallback to browser SpeechSynthesis
  fallbackSpeechSynthesis(text, language, handleFinished);
}

function fallbackSpeechSynthesis(
  text: string,
  language: AppLanguage,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const cleaned = text
    .replace(/[#*`_~]/g, '')
    .replace(/\(.*?\)/g, '')
    .slice(0, 450);

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.rate = 0.92;
  utterance.pitch = 1.05;

  let targetLangCode = 'en-IN';
  if (language === 'Malayalam') {
    targetLangCode = 'ml-IN';
  } else if (language === 'Hindi') {
    targetLangCode = 'hi-IN';
  } else if (language === 'Manglish') {
    targetLangCode = 'en-IN';
  }

  utterance.lang = targetLangCode;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(targetLangCode.toLowerCase().split('-')[0]) ||
      v.lang.toLowerCase().includes(targetLangCode.toLowerCase())
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    onEnd?.();
  };
  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

// -------------------------------------------------------------
// Unified Mobile & Desktop Voice Capture (Speech-to-Text)
// -------------------------------------------------------------

export interface VoiceCaptureController {
  stop: () => void;
}

export interface VoiceCaptureOptions {
  language: AppLanguage;
  onAudioLevel?: (level: number) => void;
  onStatusChange?: (status: 'listening' | 'transcribing' | 'idle') => void;
  onResult: (transcript: string) => void;
  onError: (errorText: string) => void;
}

/**
 * Robust cross-platform voice input for mobile & desktop
 * Uses MediaRecorder with parallel Web Speech recognition,
 * ensuring speech is ALWAYS transcribed accurately via Gemini if needed.
 */
export async function startVoiceInput(options: VoiceCaptureOptions): Promise<VoiceCaptureController | null> {
  if (typeof window === 'undefined') return null;

  let isStopped = false;
  let mediaStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let animFrameId: number | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let recordedChunks: Blob[] = [];
  let recognitionInstance: any = null;
  let webSpeechTranscript = '';

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  // 1. Setup AudioContext Volume Meter for real-time visualizer
  const setupVolumeMeter = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (isStopped || !analyser) return;
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const normalized = Math.min(1, avg / 128);
        options.onAudioLevel?.(normalized);
        animFrameId = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (e) {
      console.warn('Audio meter init warning:', e);
    }
  };

  const cleanup = () => {
    isStopped = true;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    options.onAudioLevel?.(0);
    options.onStatusChange?.('idle');
  };

  // 2. Request user microphone
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    setupVolumeMeter(mediaStream);
  } catch (err: any) {
    cleanup();
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      options.onError('Microphone access was denied. Please tap the lock icon in your browser address bar and enable Microphone.');
    } else if (err.name === 'NotFoundError') {
      options.onError('No microphone found on your device. Please plug in a microphone or headset.');
    } else {
      options.onError(`Unable to access microphone: ${err.message || 'Check browser permissions'}`);
    }
    return null;
  }

  options.onStatusChange?.('listening');

  // 3. Start MediaRecorder IMMEDIATELY to capture every single word spoken
  try {
    let recorderOptions: MediaRecorderOptions | undefined = undefined;
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
    ];
    for (const cand of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(cand)) {
        recorderOptions = { mimeType: cand };
        break;
      }
    }

    mediaRecorder = new MediaRecorder(mediaStream, recorderOptions);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      // If Web Speech API already provided a clean result, use it!
      if (webSpeechTranscript.trim().length > 0) {
        options.onResult(webSpeechTranscript.trim());
        cleanup();
        return;
      }

      // Otherwise transcribe via server Gemini API
      if (recordedChunks.length === 0) {
        options.onError('No audio recorded. Please hold the mic and speak clearly.');
        cleanup();
        return;
      }

      options.onStatusChange?.('transcribing');

      try {
        const mimeType = mediaRecorder?.mimeType || recordedChunks[0]?.type || 'audio/webm';
        const blob = new Blob(recordedChunks, { type: mimeType });

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;

          try {
            const res = await fetch('/api/tutor/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audio: base64Audio,
                mimeType: blob.type || 'audio/webm',
                language: options.language,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              if (data.text && data.text.trim().length > 0) {
                options.onResult(data.text.trim());
              } else {
                options.onError('Could not hear speech clearly. Please try speaking again.');
              }
            } else {
              const errData = await res.json().catch(() => ({}));
              options.onError(errData.error || 'Speech transcription failed. Please try again.');
            }
          } catch (netErr: any) {
            options.onError('Network error while transcribing voice.');
          } finally {
            cleanup();
          }
        };

        reader.readAsDataURL(blob);
      } catch (err: any) {
        options.onError('Audio processing failed: ' + err.message);
        cleanup();
      }
    };

    // Request data every 250ms so chunks are continually buffered
    mediaRecorder.start(250);
  } catch (recorderErr) {
    console.warn('MediaRecorder init error:', recorderErr);
  }

  // 4. Concurrently run Web Speech API if supported
  if (SpeechRecognition) {
    try {
      recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      let langCode = 'en-IN';
      if (options.language === 'Malayalam') langCode = 'ml-IN';
      else if (options.language === 'Hindi') langCode = 'hi-IN';
      else if (options.language === 'Manglish') langCode = 'en-IN';

      recognitionInstance.lang = langCode;

      recognitionInstance.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            webSpeechTranscript += ' ' + transcript;
          } else {
            interim += transcript;
          }
        }
        if (webSpeechTranscript.trim()) {
          options.onResult(webSpeechTranscript.trim());
        }
      };

      recognitionInstance.onerror = (e: any) => {
        console.warn('SpeechRecognition browser error, relying on MediaRecorder:', e);
      };

      recognitionInstance.onend = () => {
        // Recognition ended; MediaRecorder will finalize on stop()
      };

      recognitionInstance.start();
    } catch (e) {
      console.warn('Web Speech API start error:', e);
    }
  }

  // 5. Controller return
  const stopCapture = () => {
    if (isStopped) return;
    
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {}
    }

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    } else {
      cleanup();
    }
  };

  return {
    stop: stopCapture,
  };
}
