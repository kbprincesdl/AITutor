import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Mic, 
  MessageCircle, 
  ChevronUp, 
  ChevronDown, 
  HelpCircle,
  Play,
  Pause,
  Smile,
  X
} from 'lucide-react';
import { AppLanguage, HomeworkItem, StudentProfile } from '../types';
import { speakText, stopSpeaking, subscribeSpeechStatus, unlockMobileAudio } from '../utils/speech';

interface TalkingAgentProps {
  profile: StudentProfile;
  language: AppLanguage;
  activeHomework?: HomeworkItem | null;
  onOpenVoiceMic: () => void;
  onAskDoubtPrompt: (promptText: string) => void;
}

export const TalkingAgent: React.FC<TalkingAgentProps> = ({
  profile,
  language,
  activeHomework,
  onOpenVoiceMic,
  onAskDoubtPrompt,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [currentSpeechText, setCurrentSpeechText] = useState<string>('');
  const [mouthFrame, setMouthFrame] = useState<number>(0);

  // Subscribe to speech status
  useEffect(() => {
    const unsub = subscribeSpeechStatus((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  // Animate mouth when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setMouthFrame((prev) => (prev + 1) % 4);
    }, 140);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  const getGreetingText = () => {
    if (language === 'Malayalam') {
      return `നമസ്കാരം ${profile.name}! ഞാൻ നിങ്ങളുടെ പഠന സഹായിയായ മിത്രയാണ്. ഹോംവർക്കിൽ എന്തെങ്കിലും സംശയമുണ്ടോ? ചോദിക്കൂ, നമുക്ക് ഒരുമിച്ച് പഠിക്കാം!`;
    } else if (language === 'Hindi') {
      return `नमस्ते ${profile.name}! मैं आपका विद्यासाथी ट्यूटर मित्रा हूँ। क्या आपको गृहकार्य में कोई संदेह है? पूछिए, हम साथ मिलकर सीखेंगे!`;
    }
    return `Hello ${profile.name}! I am your AI tutor Mitra. Do you have any classroom homework doubts? Ask me or upload a photo, and let's solve it together!`;
  };

  const handleSpeakGreeting = () => {
    unlockMobileAudio();
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const text = getGreetingText();
    setCurrentSpeechText(text);
    speakText(text, language, () => {}, () => setCurrentSpeechText(''));
  };

  const handleSpeakCurrentSolution = () => {
    unlockMobileAudio();
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    if (!activeHomework) {
      handleSpeakGreeting();
      return;
    }

    const { solution } = activeHomework;
    let textToSpeak = '';
    if (solution.malayalamAudioText && language === 'Malayalam') {
      textToSpeak = solution.malayalamAudioText;
    } else {
      textToSpeak = `${profile.name}, here is the step-by-step solution for ${solution.conceptName}. ${solution.summary}. Final answer: ${solution.finalAnswer}. ${solution.encouragement}`;
    }

    setCurrentSpeechText(textToSpeak);
    speakText(textToSpeak, activeHomework.language || language, () => {}, () => setCurrentSpeechText(''));
  };

  return (
    <div className="no-print bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden transition-all border border-amber-300/40">
      
      {/* Background Decorative Rings */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Avatar and Identity */}
          <div className="flex items-center gap-3">
            
            {/* Animated Talking Tutor Mascot */}
            <div 
              onClick={handleSpeakCurrentSolution}
              className="relative cursor-pointer group shrink-0"
              title="Click to talk / listen"
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-lg border-2 transition-transform ${
                isSpeaking 
                  ? 'border-emerald-400 scale-105 ring-4 ring-emerald-300/40 animate-pulse' 
                  : 'border-amber-200 group-hover:scale-105'
              }`}>
                {/* Dynamic Facial Expression / Mouth Movement */}
                {isSpeaking ? (
                  mouthFrame === 0 ? '🗣️' : mouthFrame === 1 ? '😃' : mouthFrame === 2 ? '😮' : '😊'
                ) : (
                  '🧑‍🏫'
                )}
              </div>

              {/* Soundwaves badge if speaking */}
              {isSpeaking && (
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-[10px] shadow-sm animate-bounce">
                  <Volume2 className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* Name & Title */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-heading">
                  Mitra AI Tutor (മിത്ര)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-amber-100 border border-white/30">
                  Talking Agent
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                Personal tutor for <strong>{profile.name}</strong> • {profile.grade}
              </p>
            </div>
          </div>

          {/* Quick Voice Speaker Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakCurrentSolution}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                  : 'bg-white text-amber-950 hover:bg-amber-50 active:scale-95'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Stop Voice</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>{activeHomework ? 'Read Solution Aloud' : 'Talk to Mitra'}</span>
                </>
              )}
            </button>

            {/* Minimize / Expand Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Expanded Body: Live Speech Captions & Interactive Prompts */}
        {isExpanded && (
          <div className="mt-3.5 pt-3 border-t border-white/20 space-y-3">
            
            {/* Live Talking Speech Bubble */}
            <div className="bg-white/95 text-slate-800 p-3 sm:p-3.5 rounded-2xl shadow-inner flex items-start gap-2.5">
              <span className="text-xl shrink-0">💬</span>
              <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                {isSpeaking ? (
                  <p className="text-amber-950 font-semibold italic">
                    "{currentSpeechText || (language === 'Malayalam' ? 'മിത്ര സംസാരിക്കുന്നു...' : 'Mitra is speaking to you...')}"
                  </p>
                ) : (
                  <p className="text-slate-700">
                    {language === 'Malayalam' ? (
                      <>നമസ്കാരം <strong>{profile.name}</strong>! ഞാൻ നിങ്ങളുടെ ഹോംവർക്ക് സഹായിയാണ്. കണക്ക്, ശാസ്ത്രം, മലയാളം, ഹിന്ദി എന്നിവയിലെ ഏത് ചോദ്യവും എന്നോട് ചോദിക്കാം. താഴെയുള്ള ബട്ടണുകൾ ഉപയോഗിക്കൂ!</>
                    ) : (
                      <>Hello <strong>{profile.name}</strong>! I am your AI homework tutor. Ask me any doubt in Maths, Science, Malayalam, Hindi or English, and I will explain it step-by-step!</>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Interactive Agent Quick Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              
              {/* Talk via Mic */}
              <button
                onClick={onOpenVoiceMic}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 transition-all cursor-pointer active:scale-95"
              >
                <Mic className="w-3.5 h-3.5 text-amber-200" />
                <span>Ask Doubt by Voice (സംസാരിക്കാം)</span>
              </button>

              {/* Explain current solution simply */}
              {activeHomework && (
                <button
                  onClick={handleSpeakCurrentSolution}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Explain: {activeHomework.solution.conceptName}</span>
                </button>
              )}

              {/* Greet Andrew */}
              <button
                onClick={handleSpeakGreeting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl border border-white/30 transition-all cursor-pointer active:scale-95"
              >
                <Smile className="w-3.5 h-3.5 text-amber-200" />
                <span>Greet {profile.name} (നമസ്കാരം)</span>
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
