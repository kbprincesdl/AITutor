import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Bookmark, 
  Check, 
  Printer, 
  Share2, 
  HelpCircle, 
  Languages, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Copy,
  PenTool,
  Lightbulb
} from 'lucide-react';
import { HomeworkItem, SolutionData, AppLanguage, SubjectId } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';
import { SUBJECTS } from '../data/subjects';

interface SolutionCardProps {
  homework: HomeworkItem;
  onToggleStar: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onOpenScratchpad: () => void;
  onTranslate: (id: string, targetLang: AppLanguage) => void;
  isTranslating?: boolean;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  homework,
  onToggleStar,
  onToggleComplete,
  onSaveNotes,
  onOpenScratchpad,
  onTranslate,
  isTranslating = false,
}) => {
  const { solution } = homework;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [showPracticeHint, setShowPracticeHint] = useState(false);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);
  const [solvedSelf, setSolvedSelf] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [studentNotes, setStudentNotes] = useState(homework.studentNotes || '');

  const subjectInfo = SUBJECTS.find((s) => s.id === homework.subject) || SUBJECTS[0];

  const handleAudioNarration = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    // Build audio text
    const narrationText =
      solution.malayalamAudioText ||
      `${solution.summary}. ${solution.steps.map((s) => `Step ${s.stepNumber}: ${s.explanation}`).join('. ')}. Final answer: ${solution.finalAnswer}`;

    speakText(
      narrationText,
      homework.language,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(solution.finalAnswer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const handleSolvedSelfSuccess = () => {
    setSolvedSelf(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
    });
  };

  const handleSaveNotes = () => {
    onSaveNotes(homework.id, studentNotes);
    setNotesOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="homework-card bg-white rounded-3xl border border-amber-200/90 shadow-lg p-5 sm:p-7 relative transition-all">
      
      {/* Top Banner: Subject, Grade, Timestamp, Audio & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-amber-100">
        
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{subjectInfo.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {subjectInfo.name} • {subjectInfo.nameMl}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {homework.gradeLevel}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {solution.conceptName}
            </h2>
          </div>
        </div>

        {/* Audio Player & Quick Tools */}
        <div className="no-print flex items-center gap-1.5 sm:gap-2">
          
          {/* Read Aloud Button */}
          <button
            onClick={handleAudioNarration}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isPlayingAudio
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
            <span>{isPlayingAudio ? 'Stop Voice' : `Listen (${homework.language})`}</span>
          </button>

          {/* Star / Bookmark */}
          <button
            onClick={() => onToggleStar(homework.id)}
            title={homework.isStarred ? 'Remove from favorites' : 'Star for exam revision'}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              homework.isStarred
                ? 'bg-amber-100 text-amber-600'
                : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${homework.isStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>

          {/* Mark Completed Checkbox */}
          <button
            onClick={() => onToggleComplete(homework.id)}
            title={homework.isCompleted ? 'Mark as incomplete' : 'Mark homework as completed'}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              homework.isCompleted
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Check className="w-4 h-4" />
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            title="Print worksheet solution"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Original Student Query Banner */}
      <div className="mt-4 p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
            Student Homework Doubt (ചോദ്യം):
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {homework.query || 'Homework image uploaded for analysis'}
          </p>
        </div>

        {homework.imageBase64 && (
          <div className="shrink-0">
            <img
              src={homework.imageBase64}
              alt="Homework notebook page"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-amber-300 shadow-2xs"
            />
          </div>
        )}
      </div>

      {/* Summary Highlight Box */}
      <div className="mt-4 p-3.5 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <span className="text-xl">💡</span>
        <p className="text-sm font-semibold text-amber-950 leading-relaxed">
          {solution.summary}
        </p>
      </div>

      {/* Step-by-Step Breakdown */}
      <div className="mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
          <span>📝</span>
          <span>Step-by-Step Explanation (ഘട്ടം ഘട്ടമായുള്ള വിവരണം)</span>
        </h3>

        <div className="space-y-3.5">
          {solution.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-300 p-4 transition-all shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                    {step.explanation}
                  </p>

                  {step.formulaOrNote && (
                    <div className="mt-2.5 px-3 py-2 bg-amber-50/70 border border-amber-200/70 rounded-xl font-mono text-xs font-semibold text-amber-900 inline-block max-w-full overflow-x-auto">
                      {step.formulaOrNote}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final Answer Banner */}
      <div className="mt-6 bg-linear-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-xl shrink-0">
            <Award className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-emerald-100">
              Final Answer (അവസാന ഉത്തരം):
            </p>
            <p className="text-base sm:text-lg font-bold whitespace-pre-line mt-0.5 font-mono">
              {solution.finalAnswer}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopyAnswer}
          className="no-print self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          {copiedAnswer ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedAnswer ? 'Copied!' : 'Copy Answer'}</span>
        </button>
      </div>

      {/* Memory Trick / Tip Box */}
      {solution.mnemonicOrTip && (
        <div className="mt-4 p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-start gap-3">
          <span className="text-xl">🧠</span>
          <div>
            <p className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Memory Tip / ഓർമ്മക്കുറിപ്പ്:
            </p>
            <p className="text-xs sm:text-sm font-medium text-indigo-900 mt-0.5">
              {solution.mnemonicOrTip}
            </p>
          </div>
        </div>
      )}

      {/* Teacher's Encouragement */}
      <div className="mt-4 p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl flex items-center gap-3">
        <span className="text-2xl">🌟</span>
        <p className="text-xs sm:text-sm font-bold text-rose-950 italic">
          "{solution.encouragement}"
        </p>
      </div>

      {/* Interactive Similar Practice Question ("ഇതൊന്നു സ്വയം ചെയ്തു നോക്കൂ!") */}
      {solution.similarPracticeQuestion && (
        <div className="no-print mt-6 bg-amber-50/60 border-2 border-dashed border-amber-300 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span>🎯</span>
              <span>Try a Similar Question (സ്വയം ചെയ്തു നോക്കൂ!):</span>
            </span>
            <button
              onClick={onOpenScratchpad}
              className="text-xs text-teal-800 font-bold hover:underline flex items-center gap-1"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Open Scratchpad</span>
            </button>
          </div>

          <p className="text-sm font-bold text-slate-800 mb-3 bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
            {solution.similarPracticeQuestion.question}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPracticeHint(!showPracticeHint)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors"
            >
              {showPracticeHint ? 'Hide Hint' : '💡 Show Hint (സൂചന)'}
            </button>

            <button
              onClick={() => setShowPracticeAnswer(!showPracticeAnswer)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors"
            >
              {showPracticeAnswer ? 'Hide Answer' : '👁️ Show Answer (ഉത്തരം കാണുക)'}
            </button>

            {!solvedSelf ? (
              <button
                onClick={handleSolvedSelfSuccess}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer ml-auto"
              >
                🎉 I Solved It Myself!
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 ml-auto">
                🌟 Super Job! Keep it up!
              </span>
            )}
          </div>

          {showPracticeHint && (
            <div className="mt-3 p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-950 font-medium">
              <strong>Hint:</strong> {solution.similarPracticeQuestion.hint}
            </div>
          )}

          {showPracticeAnswer && (
            <div className="mt-3 p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-semibold font-mono">
              <strong>Answer:</strong> {solution.similarPracticeQuestion.answer}
            </div>
          )}
        </div>
      )}

      {/* Multilingual Switch Bar */}
      <div className="no-print mt-6 pt-4 border-t border-amber-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Languages className="w-4 h-4 text-amber-600" />
          <span>Translate this answer into:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(['Malayalam', 'English', 'Hindi', 'Manglish'] as AppLanguage[]).map((lang) => (
            <button
              key={lang}
              disabled={homework.language === lang || isTranslating}
              onClick={() => onTranslate(homework.id, lang)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                homework.language === lang
                  ? 'bg-amber-500 text-white shadow-xs cursor-default'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200'
              }`}
            >
              {lang === 'Malayalam' && 'മലയാളം'}
              {lang === 'Hindi' && 'हिन्दी'}
              {lang === 'English' && 'English'}
              {lang === 'Manglish' && 'Manglish'}
            </button>
          ))}
        </div>
      </div>

      {/* Personal Notes Drawer */}
      <div className="no-print mt-4 pt-3 border-t border-amber-50">
        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="text-xs font-bold text-slate-600 hover:text-amber-800 flex items-center gap-1.5"
        >
          <span>📝</span>
          <span>{homework.studentNotes ? 'Edit My Homework Notes' : '+ Add Personal Note for Exams'}</span>
          {notesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {notesOpen && (
          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="text"
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="e.g. Remember to double check the decimal shift for tomorrow's test!"
              className="flex-1 px-3 py-1.5 text-xs bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-slate-800"
            />
            <button
              onClick={handleSaveNotes}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Save Note
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
