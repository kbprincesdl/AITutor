import React from 'react';
import { SubjectId, AppLanguage } from '../types';
import { SUBJECTS } from '../data/subjects';

interface SubjectBarProps {
  selectedSubject: SubjectId;
  onSelectSubject: (id: SubjectId) => void;
  language: AppLanguage;
}

export const SubjectBar: React.FC<SubjectBarProps> = ({
  selectedSubject,
  onSelectSubject,
  language,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <span>📚</span>
          <span>Select Subject (വിഷയം തിരഞ്ഞെടുക്കൂ)</span>
        </span>
        <span className="text-xs text-amber-800 font-medium">
          Class 5 Syllabus Guide
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {SUBJECTS.map((sub) => {
          const isSelected = selectedSubject === sub.id;
          
          let displaySubName = sub.name;
          let subSecondary = sub.nameMl;
          if (language === 'Malayalam') {
            displaySubName = sub.nameMl;
            subSecondary = sub.name;
          } else if (language === 'Hindi') {
            displaySubName = sub.nameHi;
            subSecondary = sub.name;
          }

          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center group cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-linear-to-b from-white to-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-white/80 hover:bg-white border-amber-100 hover:border-amber-300 shadow-2xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-amber-500 to-orange-500" />
              )}
              <span className="text-2xl sm:text-3xl mb-1.5 group-hover:scale-110 transition-transform">
                {sub.icon}
              </span>
              <span className={`text-xs sm:text-sm font-bold leading-tight ${
                isSelected ? 'text-amber-950' : 'text-slate-700'
              }`}>
                {displaySubName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-full">
                {subSecondary}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
