import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Mic, 
  MicOff, 
  X, 
  Send, 
  Lightbulb, 
  HelpCircle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  Radio,
  Volume2
} from 'lucide-react';
import { SubjectId, TutorMode, AppLanguage } from '../types';
import { SUBJECTS } from '../data/subjects';
import { startVoiceInput, VoiceCaptureController } from '../utils/speech';

interface HomeworkInputProps {
  selectedSubject: SubjectId;
  language: AppLanguage;
  gradeLevel: string;
  isLoading: boolean;
  onSubmit: (params: {
    query: string;
    image?: { data: string; mimeType: string };
    mode: TutorMode;
    studentAttempt?: string;
  }) => void;
  onOpenScratchpad: () => void;
  externalImagePayload?: string | null;
  onClearExternalImage?: () => void;
}

export const HomeworkInput: React.FC<HomeworkInputProps> = ({
  selectedSubject,
  language,
  gradeLevel,
  isLoading,
  onSubmit,
  onOpenScratchpad,
  externalImagePayload,
  onClearExternalImage,
}) => {
  const [query, setQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [mode, setMode] = useState<TutorMode>('step_by_step');
  const [studentAttempt, setStudentAttempt] = useState('');
  const [showAttemptInput, setShowAttemptInput] = useState(false);
  
  // Voice capture state
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'transcribing'>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceControllerRef = useRef<VoiceCaptureController | null>(null);

  // Sync external image from scratchpad if passed
  useEffect(() => {
    if (externalImagePayload) {
      setImagePreview(externalImagePayload);
      setImageMimeType('image/png');
      onClearExternalImage?.();
    }
  }, [externalImagePayload, onClearExternalImage]);

  const currentSubjectObj = SUBJECTS.find((s) => s.id === selectedSubject) || SUBJECTS[0];

  // Voice speech capture
  const handleToggleVoiceInput = async () => {
    if (voiceStatus !== 'idle') {
      voiceControllerRef.current?.stop();
      voiceControllerRef.current = null;
      setVoiceStatus('idle');
      setAudioLevel(0);
      return;
    }

    setSpeechError(null);

    const controller = await startVoiceInput({
      language,
      onAudioLevel: (lvl) => {
        setAudioLevel(lvl);
      },
      onStatusChange: (status) => {
        setVoiceStatus(status);
        if (status === 'idle') {
          setAudioLevel(0);
        }
      },
      onResult: (transcript) => {
        setQuery((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setVoiceStatus('idle');
        setAudioLevel(0);
        voiceControllerRef.current = null;
      },
      onError: (errMsg) => {
        setSpeechError(errMsg);
        setVoiceStatus('idle');
        setAudioLevel(0);
        voiceControllerRef.current = null;
      },
    });

    if (controller) {
      voiceControllerRef.current = controller;
    }
  };

  const handleImageFile = (file: File) => {
    if (!file) return;
    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  // Paste image support
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleImageFile(file);
      }
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!query.trim() && !imagePreview) || isLoading) return;

    onSubmit({
      query: query.trim(),
      image: imagePreview
        ? {
            data: imagePreview,
            mimeType: imageMimeType,
          }
        : undefined,
      mode,
      studentAttempt: showAttemptInput ? studentAttempt.trim() : undefined,
    });
  };

  const getPlaceholder = () => {
    if (language === 'Malayalam') {
      return `നിങ്ങളുടെ ${currentSubjectObj.nameMl} സംശയം ഇവിടെ ചോദിക്കൂ... അല്ലെങ്കിൽ മൈക്കിൽ സംസാരിക്കാം 🎙️ പുസ്തകത്തിന്റെ ഫോട്ടോ എടുക്കാം 📸`;
    } else if (language === 'Hindi') {
      return `अपना गृहकार्य प्रश्न यहाँ लिखें... या माइक से बोलें 🎙️ या किताब की फ़ोटो अपलोड करें 📸`;
    }
    return `Type your ${currentSubjectObj.name} homework doubt here, speak using microphone 🎙️, or upload a photo 📸`;
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md p-4 sm:p-6 transition-all">
      <form onSubmit={handleSubmit} onPaste={handlePaste}>
        
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 bg-amber-50/60 p-1.5 rounded-2xl border border-amber-100">
          <button
            type="button"
            onClick={() => {
              setMode('step_by_step');
              setShowAttemptInput(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'step_by_step'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-900 hover:bg-white/60'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Step-by-Step Guide</span>
            <span className="hidden sm:inline font-malayalam opacity-80">(പഠിക്കാം)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('hint');
              setShowAttemptInput(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'hint'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-900 hover:bg-white/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Give me a Hint</span>
            <span className="hidden sm:inline font-malayalam opacity-80">(സൂചന)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('check_work');
              setShowAttemptInput(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'check_work'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-900 hover:bg-white/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Check My Answer</span>
            <span className="hidden sm:inline font-malayalam opacity-80">(പരിശോധിക്കാം)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('practice_similar');
              setShowAttemptInput(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'practice_similar'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-900 hover:bg-white/60'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Practice Similar</span>
            <span className="hidden sm:inline font-malayalam opacity-80">(സമാനം)</span>
          </button>
        </div>

        {/* Text Area Input */}
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder()}
            rows={3}
            className="w-full p-3.5 sm:p-4 text-sm sm:text-base rounded-2xl bg-amber-50/20 border border-amber-200/80 focus:border-amber-500 focus:bg-white focus:ring-3 focus:ring-amber-400/20 focus:outline-hidden transition-all text-slate-800 placeholder:text-slate-400 resize-none font-medium"
          />

          {/* Voice Microphone Button in Text Area */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            title={voiceStatus === 'listening' ? 'Click to stop listening' : `Speak homework doubt in ${language}`}
            className={`absolute right-3 bottom-3.5 p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
              voiceStatus === 'listening'
                ? 'bg-rose-500 text-white shadow-md animate-pulse'
                : voiceStatus === 'transcribing'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300/80'
            }`}
          >
            {voiceStatus === 'listening' ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop</span>
              </>
            ) : voiceStatus === 'transcribing' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Transcribing...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline">Speak ({language})</span>
              </>
            )}
          </button>
        </div>

        {/* Active Microphone Soundwave & Visualizer Box */}
        {voiceStatus === 'listening' && (
          <div className="mt-3 p-3.5 bg-linear-to-r from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-300 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 animate-pulse shadow-md">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>
                    Listening in {language}... Speak your doubt now!
                  </span>
                </p>
                <p className="text-[11px] text-slate-600">
                  {language === 'Malayalam'
                    ? 'മൈക്കിൽ സംശയം ചോദിക്കൂ, വിദ്യാസാഥി കേൾക്കുന്നുണ്ട്...'
                    : language === 'Hindi'
                    ? 'अपना प्रश्न बोलें, विद्यासाथी सुन रहा है...'
                    : 'Speak your classroom homework question clearly...'}
                </p>
              </div>
            </div>

            {/* Dynamic Soundwave Bars */}
            <div className="flex items-center gap-1 h-6 shrink-0">
              {[0.4, 0.8, 0.3, 0.9, 0.6, 1.0, 0.5, 0.7].map((factor, i) => {
                const heightPercent = Math.max(20, Math.min(100, (audioLevel * 100 * factor) + (Math.sin(Date.now() / 200 + i) * 15)));
                return (
                  <span
                    key={i}
                    className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                    style={{ height: `${heightPercent}%` }}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer shrink-0"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Transcribing State Box */}
        {voiceStatus === 'transcribing' && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3 animate-in fade-in">
            <RefreshCw className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-950">
                Converting your voice into homework text...
              </p>
              <p className="text-[11px] text-amber-800">
                AI Speech Engine is preparing your question
              </p>
            </div>
          </div>
        )}

        {/* Microphone Error Alert & Permission Guidance */}
        {speechError && (
          <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
            <MicOff className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Microphone Note:</p>
              <p>{speechError}</p>
              <p className="text-[11px] text-rose-600 mt-1">
                Tip: Click the padlock or camera/mic icon in your browser's address bar and set Microphone to <strong>"Allow"</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-rose-400 hover:text-rose-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Student Attempt Input (If mode is 'check_work') */}
        {showAttemptInput && (
          <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <label className="block text-xs font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
              <span>✍️</span>
              <span>Your Attempt / Answer to Check (നിങ്ങൾ കണ്ടെത്തിയ ഉത്തരം):</span>
            </label>
            <input
              type="text"
              value={studentAttempt}
              onChange={(e) => setStudentAttempt(e.target.value)}
              placeholder="e.g. My answer is 44 meters, or I got step 2 as 22..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-emerald-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-400 text-slate-800"
            />
          </div>
        )}

        {/* Image Preview Box */}
        {imagePreview && (
          <div className="mt-3 p-3 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-300 bg-white shrink-0 shadow-2xs">
                <img
                  src={imagePreview}
                  alt="Homework upload preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Homework Image Attached</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Ready for AI tutor photo analysis • Click ask when ready!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Bar (Upload Photo, Mic, Scratchpad, Submit) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-amber-100">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Homework Photo Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-amber-600" />
              <span>Upload Photo (ഫോട്ടോ)</span>
            </button>

            {/* Mic Button on Action Bar */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                voiceStatus === 'listening'
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
              }`}
            >
              <Mic className="w-4 h-4 text-amber-700" />
              <span>{voiceStatus === 'listening' ? 'Listening...' : 'Speak (സംസാരിക്കാം)'}</span>
            </button>

            {/* Open Scratchpad / Draw Rough Work */}
            <button
              type="button"
              onClick={onOpenScratchpad}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100/80 text-teal-900 border border-teal-200 transition-all cursor-pointer"
            >
              <span>✏️</span>
              <span className="hidden sm:inline">Draw / Doodle Work</span>
              <span className="sm:hidden">Draw</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={(!query.trim() && !imagePreview) || isLoading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md transition-all ${
              (!query.trim() && !imagePreview) || isLoading
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 shadow-orange-500/20 active:scale-95 cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Tutor is thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Ask Vidyasaathi</span>
                <span className="font-malayalam opacity-90 hidden sm:inline">(ചോദിക്കൂ)</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Questions for Active Subject */}
        <div className="mt-4 pt-3 border-t border-amber-50">
          <p className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
            <span>💡</span>
            <span>Quick practice questions ({currentSubjectObj.name} - Class 5):</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {currentSubjectObj.sampleQuestions.map((sq, idx) => {
              const displayText = language === 'Malayalam' && sq.textMl ? sq.textMl : sq.text;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(displayText)}
                  className="text-left text-xs bg-amber-50/60 hover:bg-amber-100 text-slate-700 hover:text-amber-950 px-2.5 py-1 rounded-lg border border-amber-200/50 transition-colors max-w-full truncate cursor-pointer"
                >
                  "{displayText.length > 55 ? displayText.slice(0, 55) + '...' : displayText}"
                </button>
              );
            })}
          </div>
        </div>

      </form>
    </div>
  );
};
