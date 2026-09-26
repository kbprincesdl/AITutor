import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  PenTool, 
  Sparkles, 
  User, 
  Languages, 
  Bot,
  GraduationCap 
} from 'lucide-react';
import { AppLanguage, StudentProfile } from '../types';
import { stopSpeaking, subscribeSpeechStatus, unlockMobileAudio } from '../utils/speech';

interface HeaderProps {
  currentTab: 'tutor' | 'notebook' | 'scratchpad' | 'quiz';
  onSelectTab: (tab: 'tutor' | 'notebook' | 'scratchpad' | 'quiz') => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  profile: StudentProfile;
  onOpenProfileModal: () => void;
  savedCount: number;
  onTriggerTutorSpeech?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
  profile,
  onOpenProfileModal,
  savedCount,
  onTriggerTutorSpeech,
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeSpeechStatus((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  const handleSpeakerClick = () => {
    unlockMobileAudio();
    if (isSpeaking) {
      stopSpeaking();
    } else {
      onTriggerTutorSpeech?.();
    }
  };

  return (
    <header className="no-print bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-amber-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Logo & Identity */}
          <div 
            onClick={() => onSelectTab('tutor')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white text-xl sm:text-2xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-2xl font-bold font-heading bg-linear-to-r from-amber-900 via-amber-700 to-orange-700 bg-clip-text text-transparent">
                  Vidyasaathi
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  വിദ്യാസാഥി AI
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                School Tutor for <strong>{profile.name}</strong> • {profile.grade} {profile.board}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-amber-50/70 p-1.5 rounded-2xl border border-amber-200/60">
            <button
              onClick={() => onSelectTab('tutor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'tutor'
                  ? 'bg-white text-amber-900 shadow-xs border border-amber-200/50'
                  : 'text-slate-600 hover:text-amber-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Ask Doubt</span>
              <span className="text-[11px] opacity-75 font-malayalam">(ഹോംവർക്ക്)</span>
            </button>

            <button
              onClick={() => onSelectTab('notebook')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative ${
                currentTab === 'notebook'
                  ? 'bg-white text-amber-900 shadow-xs border border-amber-200/50'
                  : 'text-slate-600 hover:text-amber-900 hover:bg-white/50'
              }`}
            >
              <Bookmark className="w-4 h-4 text-orange-600" />
              <span>Notebook</span>
              <span className="text-[11px] opacity-75 font-malayalam">(ബുക്ക്)</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('scratchpad')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'scratchpad'
                  ? 'bg-white text-amber-900 shadow-xs border border-amber-200/50'
                  : 'text-slate-600 hover:text-amber-900 hover:bg-white/50'
              }`}
            >
              <PenTool className="w-4 h-4 text-teal-600" />
              <span>Scratchpad</span>
              <span className="text-[11px] opacity-75 font-malayalam">(റഫ് വർക്ക്)</span>
            </button>

            <button
              onClick={() => onSelectTab('quiz')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                currentTab === 'quiz'
                  ? 'bg-white text-amber-900 shadow-xs border border-amber-200/50'
                  : 'text-slate-600 hover:text-amber-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Daily Quiz</span>
              <span className="text-[11px] opacity-75 font-malayalam">(ക്വിസ്)</span>
            </button>
          </nav>

          {/* Right Controls: Language Selector, Interactive Speaker & Student Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Language Switcher Dropdown */}
            <div className="relative flex items-center bg-amber-50 border border-amber-200 rounded-xl px-2 py-1 text-xs">
              <Languages className="w-3.5 h-3.5 text-amber-700 mr-1 shrink-0" />
              <select
                aria-label="Select explanation language"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as AppLanguage)}
                className="bg-transparent font-bold text-amber-950 focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="Malayalam">മലയാളം</option>
                <option value="English">English</option>
                <option value="Hindi">हिन्दी</option>
                <option value="Manglish">Manglish</option>
              </select>
            </div>

            {/* Working Speaker Button (Active Voice Toggle) */}
            <button
              onClick={handleSpeakerClick}
              title={isSpeaking ? 'Voice is speaking. Click to pause/mute' : 'Click to hear tutor speak out loud'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isSpeaking
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs animate-pulse ring-2 ring-emerald-300'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  <span className="hidden sm:inline">Speaking</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-amber-800" />
                  <span className="hidden sm:inline">Tutor Voice</span>
                </>
              )}
            </button>

            {/* Student Profile Button (Displays Andrew) */}
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-1.5 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-300 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl transition-colors cursor-pointer group shadow-2xs"
            >
              <span className="text-base">{profile.avatar}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {profile.name}
                </p>
                <p className="text-[10px] text-amber-800 font-medium leading-none hidden sm:block">
                  {profile.grade}
                </p>
              </div>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
