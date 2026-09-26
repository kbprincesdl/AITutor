import React from 'react';
import { Sparkles, Bookmark, PenTool, BookOpen, Bot } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'tutor' | 'notebook' | 'scratchpad' | 'quiz';
  onSelectTab: (tab: 'tutor' | 'notebook' | 'scratchpad' | 'quiz') => void;
  savedCount: number;
  onOpenTalkingAgent: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  savedCount,
  onOpenTalkingAgent,
}) => {
  return (
    <nav className="no-print md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-amber-200 z-40 px-2 py-1.5 shadow-lg shadow-amber-900/10 safe-area-bottom">
      <div className="flex items-center justify-around gap-1">
        
        {/* Tab 1: Ask Doubts */}
        <button
          onClick={() => onSelectTab('tutor')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[58px] ${
            currentTab === 'tutor'
              ? 'text-amber-600 font-bold bg-amber-50 scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Ask Doubt</span>
        </button>

        {/* Tab 2: Talking Tutor Avatar Center Highlight */}
        <button
          onClick={onOpenTalkingAgent}
          className="flex flex-col items-center justify-center -mt-4 py-1.5 px-3 rounded-2xl bg-linear-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/30 transition-transform active:scale-95 cursor-pointer min-w-[62px]"
        >
          <span className="text-xl">🧑‍🏫</span>
          <span className="text-[10px] font-bold leading-tight mt-0.5">Talk Tutor</span>
        </button>

        {/* Tab 3: Notebook with count badge */}
        <button
          onClick={() => onSelectTab('notebook')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative min-w-[58px] ${
            currentTab === 'notebook'
              ? 'text-amber-600 font-bold bg-amber-50 scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Bookmark className="w-5 h-5 mb-0.5" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight font-medium">Notebook</span>
        </button>

        {/* Tab 4: Scratchpad */}
        <button
          onClick={() => onSelectTab('scratchpad')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[58px] ${
            currentTab === 'scratchpad'
              ? 'text-amber-600 font-bold bg-amber-50 scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PenTool className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Scratchpad</span>
        </button>

        {/* Tab 5: Practice Quiz */}
        <button
          onClick={() => onSelectTab('quiz')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[58px] ${
            currentTab === 'quiz'
              ? 'text-amber-600 font-bold bg-amber-50 scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-medium">Quiz</span>
        </button>

      </div>
    </nav>
  );
};
