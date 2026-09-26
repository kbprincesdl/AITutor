import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { SubjectId, AppLanguage, QuizData, QuizQuestion } from '../types';
import { SUBJECTS } from '../data/subjects';

interface DailyQuizViewProps {
  selectedSubject: SubjectId;
  language: AppLanguage;
  gradeLevel: string;
}

export const DailyQuizView: React.FC<DailyQuizViewProps> = ({
  selectedSubject,
  language,
  gradeLevel,
}) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);

  const subjectInfo = SUBJECTS.find((s) => s.id === selectedSubject) || SUBJECTS[0];

  const fetchQuiz = async () => {
    setIsLoading(true);
    setSelectedAnswers({});
    setScore(null);

    try {
      const res = await fetch('/api/tutor/practice-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subjectInfo.name,
          gradeLevel,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setQuizData(data.data);
        }
      }
    } catch (err) {
      console.error('Quiz fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [selectedSubject, language, gradeLevel]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // already answered
    const nextAnswers = { ...selectedAnswers, [questionId]: optionIndex };
    setSelectedAnswers(nextAnswers);

    // If all answered, calculate score
    if (quizData && Object.keys(nextAnswers).length === quizData.questions.length) {
      let finalScore = 0;
      quizData.questions.forEach((q) => {
        if (nextAnswers[q.id] === q.correctOptionIndex) finalScore++;
      });
      setScore(finalScore);

      if (finalScore >= 2) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading">
              Daily Practice Quiz (ദിവസേനയുള്ള പരിശീലനം)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-indigo-100 font-medium">
            3 syllabus-aligned questions for {subjectInfo.name} ({subjectInfo.nameMl}) • {gradeLevel}
          </p>
        </div>

        <button
          onClick={fetchQuiz}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Generate New Questions</span>
        </button>
      </div>

      {/* Quiz Container */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-amber-200 p-12 text-center shadow-md">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Teacher is preparing your {subjectInfo.name} questions...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tailoring to {gradeLevel} in {language}
          </p>
        </div>
      ) : quizData ? (
        <div className="space-y-5">
          
          {/* Score Alert */}
          {score !== null && (
            <div className="bg-linear-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-5 text-center shadow-md animate-in zoom-in-95 duration-200">
              <span className="text-4xl mb-2 inline-block">
                {score === 3 ? '🏆' : score === 2 ? '⭐' : '💪'}
              </span>
              <h3 className="text-lg font-bold text-emerald-950">
                You scored {score} out of {quizData.questions.length}!
              </h3>
              <p className="text-xs text-emerald-800 font-medium mt-1">
                {score === 3
                  ? 'Fantastic! You mastered this subject topic completely!'
                  : score === 2
                  ? 'Great effort! Review the one explanation below.'
                  : 'Keep learning! Practice makes perfect.'}
              </p>
            </div>
          )}

          {/* Question Cards */}
          {quizData.questions.map((q, idx) => {
            const userAnswer = selectedAnswers[q.id];
            const isAnswered = userAnswer !== undefined;
            const isCorrect = isAnswered && userAnswer === q.correctOptionIndex;

            return (
              <div
                key={q.id || idx}
                className="bg-white rounded-3xl border border-amber-200 shadow-md p-5 sm:p-6 transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200">
                    Q{idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h4>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelectedOption = userAnswer === optIdx;
                    const isTheCorrectOption = q.correctOptionIndex === optIdx;

                    let btnStyle = 'bg-amber-50/40 hover:bg-amber-100/60 border-amber-200 text-slate-800';

                    if (isAnswered) {
                      if (isTheCorrectOption) {
                        btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-300';
                      } else if (isSelectedOption && !isCorrect) {
                        btnStyle = 'bg-rose-100 border-rose-300 text-rose-950 line-through';
                      } else {
                        btnStyle = 'bg-slate-50 border-slate-200 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                      >
                        <span className="flex-1 font-medium">{opt}</span>
                        {isAnswered && isTheCorrectOption && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && isSelectedOption && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Drawer */}
                {isAnswered && (
                  <div className="mt-4 p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-xs text-indigo-950 animate-in fade-in">
                    <p className="font-bold mb-0.5 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Why this is correct:</span>
                    </p>
                    <p className="font-medium text-slate-700">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-amber-200 p-8 text-center text-slate-500">
          Click generate above to start your practice session.
        </div>
      )}

    </div>
  );
};
