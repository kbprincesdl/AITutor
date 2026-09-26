import { AppLanguage } from '../types';

let currentAudio: HTMLAudioElement | null = null;

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
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

  onStart?.();

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
          onEnd?.();
        };
        currentAudio.onerror = () => {
          fallbackSpeechSynthesis(text, language, onEnd);
        };
        await currentAudio.play();
        return;
      }
    }
  } catch (err) {
    console.log('Using browser speech fallback:', err);
  }

  // Fallback to browser SpeechSynthesis
  fallbackSpeechSynthesis(text, language, onEnd);
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
    .slice(0, 400);

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
// Unified Microphone Audio Capture & Speech-to-Text Controller
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
 * Checks and requests microphone permission
 */
export async function testMicrophonePermission(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks after checking
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    console.warn('Microphone permission check error:', err);
    return false;
  }
}

/**
 * Starts microphone capture using Web Speech API with automatic
 * MediaRecorder fallback to Gemini Speech-to-Text API.
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

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  // Function to monitor microphone volume level for UI visualizer
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
      console.warn('Audio meter init error:', e);
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

  // Request user media stream to guarantee microphone prompt & check permissions
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
      options.onError('Microphone access was denied. Please allow microphone access in your browser address bar to speak your doubt.');
    } else if (err.name === 'NotFoundError') {
      options.onError('No microphone detected on your device. Please plug in a microphone or type your question.');
    } else {
      options.onError(`Unable to access microphone: ${err.message || 'Check permissions'}`);
    }
    return null;
  }

  options.onStatusChange?.('listening');

  // Strategy 1: Use Web Speech API if supported by browser
  if (SpeechRecognition) {
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      let langCode = 'en-IN';
      if (options.language === 'Malayalam') langCode = 'ml-IN';
      else if (options.language === 'Hindi') langCode = 'hi-IN';
      else if (options.language === 'Manglish') langCode = 'en-IN';

      recognition.lang = langCode;

      let gotResult = false;

      recognition.onresult = (event: any) => {
        gotResult = true;
        const transcript = event.results[0]?.[0]?.transcript || '';
        if (transcript.trim()) {
          options.onResult(transcript.trim());
        }
        cleanup();
      };

      recognition.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e);
        // If recognition failed or aborted without result, fall back to MediaRecorder
        if (!gotResult && !isStopped && mediaStream) {
          console.log('Falling back to Gemini audio recording transcribe...');
          fallbackToMediaRecorder();
        } else {
          cleanup();
        }
      };

      recognition.onend = () => {
        if (!gotResult && !isStopped && mediaRecorder?.state === 'recording') {
          // MediaRecorder is handling fallback
        } else if (!gotResult && !isStopped) {
          cleanup();
        }
      };

      recognition.start();

      return {
        stop: () => {
          recognition.stop();
          cleanup();
        },
      };
    } catch (e) {
      console.warn('Failed to start SpeechRecognition, using MediaRecorder:', e);
      fallbackToMediaRecorder();
    }
  } else {
    // Strategy 2: MediaRecorder with Gemini Transcribe
    fallbackToMediaRecorder();
  }

  function fallbackToMediaRecorder() {
    if (!mediaStream) return;
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
      recordedChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (isStopped || recordedChunks.length === 0) {
          cleanup();
          return;
        }

        options.onStatusChange?.('transcribing');

        try {
          const blob = new Blob(recordedChunks, { type: mediaRecorder?.mimeType || 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
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
              if (data.text) {
                options.onResult(data.text);
              } else {
                options.onError('Could not hear clearly. Please try speaking again.');
              }
            } else {
              options.onError('Transcription service busy. Please try again or type your question.');
            }
            cleanup();
          };
        } catch (err: any) {
          options.onError('Audio processing failed: ' + err.message);
          cleanup();
        }
      };

      mediaRecorder.start();
    } catch (e: any) {
      options.onError('Media recording not supported: ' + e.message);
      cleanup();
    }
  }

  return {
    stop: () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      } else {
        cleanup();
      }
    },
  };
}
