import React, { useState } from 'react';
import { X, Check, Sparkles, User, GraduationCap, School } from 'lucide-react';
import { StudentProfile, AppLanguage } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => void;
}

const AVATARS = ['🦉', '🐘', '🐯', '🦚', '🤖', '🚀', '🦁', '🐬', '🌸', '⭐'];

const GRADES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
];

const BOARDS = [
  'CBSE (Kerala)',
  'Kerala State Syllabus (SCERT)',
  'CBSE (National)',
  'ICSE',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [grade, setGrade] = useState(profile.grade);
  const [board, setBoard] = useState(profile.board);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [defaultLanguage, setDefaultLanguage] = useState<AppLanguage>(profile.defaultLanguage);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || 'Student',
      grade,
      board,
      avatar,
      defaultLanguage,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-amber-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{avatar}</span>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Student Profile & Syllabus
              </h3>
              <p className="text-xs text-amber-900 font-medium">
                Customize for your niece or student
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                    avatar === av
                      ? 'bg-amber-100 border-2 border-amber-500 scale-110 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Student Name (വിദ്യാർത്ഥിയുടെ പേര്)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ananya, Rohan, Devi"
              className="w-full px-3.5 py-2.5 text-sm bg-amber-50/30 border border-amber-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-slate-800 font-medium"
              required
            />
          </div>

          {/* Class / Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Class / Grade (ക്ലാസ്)
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-amber-50/30 border border-amber-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-slate-800 font-medium cursor-pointer"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Syllabus / Board
              </label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-amber-50/30 border border-amber-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-slate-800 font-medium cursor-pointer"
              >
                {BOARDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Default Language (സ്ഥിരം ഭാഷ)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Malayalam', 'English', 'Hindi', 'Manglish'] as AppLanguage[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setDefaultLanguage(l)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-left ${
                    defaultLanguage === l
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-white border-amber-100 text-slate-700 hover:bg-amber-50'
                  }`}
                >
                  {l === 'Malayalam' && 'മലയാളം (Malayalam)'}
                  {l === 'Hindi' && 'हिन्दी (Hindi)'}
                  {l === 'English' && 'English'}
                  {l === 'Manglish' && 'Manglish (English letters)'}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-2xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              Save Profile & Start Learning
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
