import React, { useState } from 'react';
import { 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Bookmark, 
  PenTool, 
  Sparkles, 
  User, 
  Languages, 
  GraduationCap 
} from 'lucide-react';
import { AppLanguage, StudentProfile } from '../types';
import { stopSpeaking } from '../utils/speech';

interface HeaderProps {
  currentTab: 'tutor' | 'notebook' | 'scratchpad' | 'quiz';
  onSelectTab: (tab: 'tutor' | 'notebook' | 'scratchpad' | 'quiz') => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  profile: StudentProfile;
  onOpenProfileModal: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onLanguageChange,
  profile,
  onOpenProfileModal,
  savedCount,
}) => {
  const [isSpeakingActive, setIsSpeakingActive] = useState(false);

  const handleStopSpeech = () => {
    stopSpeaking();
    setIsSpeakingActive(false);
  };

  const getLangBadge = (lang: AppLanguage) => {
    switch (lang) {
      case 'Malayalam':
        return 'മലയാളം';
      case 'Hindi':
        return 'हिन्दी';
      case 'English':
        return 'English';
      case 'Manglish':
        return 'Manglish';
    }
  };

  return (
    <header className="no-print bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-amber-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Identity */}
          <div 
            onClick={() => onSelectTab('tutor')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white text-2xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              🎒
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading bg-linear-to-r from-amber-900 via-amber-700 to-orange-700 bg-clip-text text-transparent">
                  Vidyasaathi
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  വിദ്യാസാഥി AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                School Homework Tutor • {profile.grade} {profile.board}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-amber-50/70 p-1.5 rounded-2xl border border-amber-200/60">
            <button
              onClick={() => onSelectTab('tutor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all relative ${
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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

          {/* Right Controls: Language Selector & Profile */}
          <div className="flex items-center gap-2">
            
            {/* Language Switcher Dropdown */}
            <div className="relative flex items-center bg-amber-50 border border-amber-200 rounded-xl px-2 py-1 text-xs">
              <Languages className="w-3.5 h-3.5 text-amber-700 mr-1.5 shrink-0" />
              <select
                aria-label="Select explanation language"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as AppLanguage)}
                className="bg-transparent font-semibold text-amber-950 focus:outline-hidden cursor-pointer pr-1"
              >
                <option value="Malayalam">മലയാളം (Malayalam)</option>
                <option value="English">English</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Manglish">Manglish (മലയാളം in English)</option>
              </select>
            </div>

            {/* Stop Speech Button (if audio is currently speaking) */}
            <button
              onClick={handleStopSpeech}
              title="Stop voice audio"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <VolumeX className="w-4 h-4" />
            </button>

            {/* Student Profile Button */}
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-1.5 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/80 hover:border-amber-300 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer group shadow-2xs"
            >
              <span className="text-base">{profile.avatar}</span>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {profile.name}
                </p>
                <p className="text-[10px] text-amber-800 font-medium leading-none">
                  {profile.grade}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around gap-1 pt-2.5 border-t border-amber-100 mt-2">
          <button
            onClick={() => onSelectTab('tutor')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
              currentTab === 'tutor'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            ✨ Ask Doubt
          </button>
          <button
            onClick={() => onSelectTab('notebook')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all relative ${
              currentTab === 'notebook'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            📚 Notebook {savedCount > 0 && `(${savedCount})`}
          </button>
          <button
            onClick={() => onSelectTab('scratchpad')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
              currentTab === 'scratchpad'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            ✏️ Scratchpad
          </button>
          <button
            onClick={() => onSelectTab('quiz')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
              currentTab === 'quiz'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            🎯 Quiz
          </button>
        </div>

      </div>
    </header>
  );
};
