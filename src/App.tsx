/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  History, 
  Award, 
  School,
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';

import { 
  SubjectId, 
  AppLanguage, 
  TutorMode, 
  HomeworkItem, 
  StudentProfile, 
  SolutionData 
} from './types';
import { SUBJECTS } from './data/subjects';
import { 
  getStoredHomework, 
  saveHomeworkItem, 
  deleteHomeworkItem, 
  getStudentProfile, 
  saveStudentProfile, 
  DEFAULT_PROFILE 
} from './utils/storage';

import { Header } from './components/Header';
import { SubjectBar } from './components/SubjectBar';
import { HomeworkInput } from './components/HomeworkInput';
import { SolutionCard } from './components/SolutionCard';
import { NotebookView } from './components/NotebookView';
import { ScratchpadModal } from './components/ScratchpadModal';
import { DailyQuizView } from './components/DailyQuizView';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'tutor' | 'notebook' | 'scratchpad' | 'quiz'>('tutor');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('math');
  const [language, setLanguage] = useState<AppLanguage>('Malayalam');
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [activeSolution, setActiveSolution] = useState<HomeworkItem | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [externalImagePayload, setExternalImagePayload] = useState<string | null>(null);

  // Initialize data on client
  useEffect(() => {
    const loadedProfile = getStudentProfile();
    setProfile(loadedProfile);
    setLanguage(loadedProfile.defaultLanguage || 'Malayalam');

    const loadedHomework = getStoredHomework();
    setHomeworkList(loadedHomework);
    if (loadedHomework.length > 0) {
      setActiveSolution(loadedHomework[0]);
    }
  }, []);

  // Update profile
  const handleSaveProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    setLanguage(newProfile.defaultLanguage);
    saveStudentProfile(newProfile);
  };

  // Submit Homework Doubt
  const handleSubmitHomework = async (params: {
    query: string;
    image?: { data: string; mimeType: string };
    mode: TutorMode;
    studentAttempt?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tutor/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: params.query,
          image: params.image,
          subject: SUBJECTS.find((s) => s.id === selectedSubject)?.name || 'General',
          gradeLevel: `${profile.grade} ${profile.board}`,
          language,
          mode: params.mode,
          studentAttempt: params.studentAttempt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get solution');
      }

      const resData = await response.json();
      if (!resData.data) {
        throw new Error('Received invalid data from tutor engine.');
      }

      const newHomeworkItem: HomeworkItem = {
        id: `hw-${Date.now()}`,
        timestamp: Date.now(),
        subject: selectedSubject,
        gradeLevel: `${profile.grade} ${profile.board}`,
        language,
        query: params.query || 'Homework image uploaded',
        imageBase64: params.image?.data,
        mode: params.mode,
        solution: resData.data as SolutionData,
        isStarred: false,
        isCompleted: false,
      };

      // Save to storage
      saveHomeworkItem(newHomeworkItem);
      setHomeworkList((prev) => [newHomeworkItem, ...prev]);
      setActiveSolution(newHomeworkItem);

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err: any) {
      console.error('Homework submit error:', err);
      setErrorMessage(err.message || 'Something went wrong while solving the homework doubt.');
    } finally {
      setIsLoading(false);
    }
  };

  // Translate existing solution
  const handleTranslateSolution = async (id: string, targetLang: AppLanguage) => {
    const item = homeworkList.find((h) => h.id === id);
    if (!item) return;

    setIsTranslating(true);
    try {
      const res = await fetch('/api/tutor/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solutionData: item.solution,
          targetLanguage: targetLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const updatedItem: HomeworkItem = {
            ...item,
            language: targetLang,
            solution: data.data,
          };
          saveHomeworkItem(updatedItem);
          setHomeworkList((prev) => prev.map((h) => (h.id === id ? updatedItem : h)));
          if (activeSolution?.id === id) {
            setActiveSolution(updatedItem);
          }
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Toggle Star
  const handleToggleStar = (id: string) => {
    const updated = homeworkList.map((item) => {
      if (item.id === id) {
        const next = { ...item, isStarred: !item.isStarred };
        saveHomeworkItem(next);
        return next;
      }
      return item;
    });
    setHomeworkList(updated);
    if (activeSolution?.id === id) {
      setActiveSolution((prev) => (prev ? { ...prev, isStarred: !prev.isStarred } : null));
    }
  };

  // Toggle Complete
  const handleToggleComplete = (id: string) => {
    const updated = homeworkList.map((item) => {
      if (item.id === id) {
        const next = { ...item, isCompleted: !item.isCompleted };
        saveHomeworkItem(next);
        if (!item.isCompleted) {
          confetti({
            particleCount: 70,
            spread: 50,
            origin: { y: 0.6 },
          });
        }
        return next;
      }
      return item;
    });
    setHomeworkList(updated);
    if (activeSolution?.id === id) {
      setActiveSolution((prev) => (prev ? { ...prev, isCompleted: !prev.isCompleted } : null));
    }
  };

  // Save Notes
  const handleSaveNotes = (id: string, notes: string) => {
    const updated = homeworkList.map((item) => {
      if (item.id === id) {
        const next = { ...item, studentNotes: notes };
        saveHomeworkItem(next);
        return next;
      }
      return item;
    });
    setHomeworkList(updated);
    if (activeSolution?.id === id) {
      setActiveSolution((prev) => (prev ? { ...prev, studentNotes: notes } : null));
    }
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    deleteHomeworkItem(id);
    const updated = homeworkList.filter((h) => h.id !== id);
    setHomeworkList(updated);
    if (activeSolution?.id === id) {
      setActiveSolution(updated[0] || null);
    }
  };

  // Scratchpad send payload handler
  const handleScratchpadSend = (dataUrl: string) => {
    setExternalImagePayload(dataUrl);
    setCurrentTab('tutor');
  };

  const currentSubjectObj = SUBJECTS.find((s) => s.id === selectedSubject) || SUBJECTS[0];

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-amber-50/50 via-white to-amber-50/30">
      
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onLanguageChange={setLanguage}
        profile={profile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        savedCount={homeworkList.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Welcome & Curriculum Banner */}
        <section className="no-print bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-8 -bottom-10 opacity-15 text-9xl pointer-events-none select-none">
            📚
          </div>

          <div className="max-w-2xl relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold border border-white/30">
              <span>{profile.avatar}</span>
              <span>Namaskaram, {profile.name}! (നമസ്കാരം)</span>
              <span className="opacity-75">• {profile.grade} {profile.board}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-heading tracking-tight leading-tight">
              Ask your homework doubts in Malayalam, English & Hindi!
            </h2>

            <p className="text-sm sm:text-base text-amber-50 font-medium leading-relaxed">
              Upload textbook photos or type questions in Mathematics, Science, Malayalam, Hindi & English. Get step-by-step guidance and listen to voice explanations!
            </p>

            {/* Quick stats / prompts */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <button
                onClick={() => setCurrentTab('tutor')}
                className="bg-white text-amber-900 px-4 py-2 rounded-2xl shadow-md hover:bg-amber-50 transition-all font-bold cursor-pointer"
              >
                ✨ Solve Doubt Now
              </button>
              <button
                onClick={() => setCurrentTab('quiz')}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-2xl border border-white/30 transition-all cursor-pointer"
              >
                🎯 3-Min Daily Practice
              </button>
              <button
                onClick={() => setIsScratchpadOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-2xl border border-white/30 transition-all cursor-pointer"
              >
                ✏️ Rough Scratchpad
              </button>
            </div>
          </div>
        </section>

        {/* Tab Content Rendering */}
        {currentTab === 'tutor' && (
          <div className="space-y-6">
            
            {/* Subject Selector Bar */}
            <section className="no-print">
              <SubjectBar
                selectedSubject={selectedSubject}
                onSelectSubject={setSelectedSubject}
                language={language}
              />
            </section>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-800 flex items-start gap-3 shadow-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Error solving homework doubt:</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Homework Input Card */}
            <section className="no-print">
              <HomeworkInput
                selectedSubject={selectedSubject}
                language={language}
                gradeLevel={`${profile.grade} ${profile.board}`}
                isLoading={isLoading}
                onSubmit={handleSubmitHomework}
                onOpenScratchpad={() => setIsScratchpadOpen(true)}
                externalImagePayload={externalImagePayload}
                onClearExternalImage={() => setExternalImagePayload(null)}
              />
            </section>

            {/* Active Solution Display Card */}
            {activeSolution && (
              <section className="pt-2">
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Tutor Solution & Step-by-Step Guide</span>
                  </h3>
                  <button
                    onClick={() => setCurrentTab('notebook')}
                    className="text-xs text-amber-800 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View all in Notebook ({homeworkList.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <SolutionCard
                  homework={activeSolution}
                  onToggleStar={handleToggleStar}
                  onToggleComplete={handleToggleComplete}
                  onSaveNotes={handleSaveNotes}
                  onOpenScratchpad={() => setIsScratchpadOpen(true)}
                  onTranslate={handleTranslateSolution}
                  isTranslating={isTranslating}
                />
              </section>
            )}

            {/* Recent Homework Queries (Quick History) */}
            {homeworkList.length > 1 && (
              <section className="no-print pt-6">
                <div className="flex items-center justify-between mb-3 px-2">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-slate-400" />
                    <span>Recent Doubts Solved (സമീപകാല ചോദ്യങ്ങൾ)</span>
                  </h3>
                  <button
                    onClick={() => setCurrentTab('notebook')}
                    className="text-xs text-amber-800 font-bold hover:underline"
                  >
                    View All in Notebook →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {homeworkList.slice(0, 3).map((item) => {
                    const sub = SUBJECTS.find((s) => s.id === item.subject) || SUBJECTS[0];
                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveSolution(item)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          activeSolution?.id === item.id
                            ? 'bg-amber-100/60 border-amber-400 shadow-xs'
                            : 'bg-white hover:bg-amber-50/50 border-amber-100 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span>{sub.icon}</span>
                          <span className="text-xs font-bold text-amber-900">
                            {sub.name}
                          </span>
                          {item.isStarred && <span className="text-xs ml-auto">⭐</span>}
                        </div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">
                          {item.solution.conceptName}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {item.query}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Notebook Tab */}
        {currentTab === 'notebook' && (
          <NotebookView
            items={homeworkList}
            onToggleStar={handleToggleStar}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteItem}
            onSaveNotes={handleSaveNotes}
            onOpenScratchpad={() => setIsScratchpadOpen(true)}
            onTranslate={handleTranslateSolution}
            onSelectToView={(item) => {
              setActiveSolution(item);
              setCurrentTab('tutor');
            }}
          />
        )}

        {/* Scratchpad Tab (Embedded View) */}
        {currentTab === 'scratchpad' && (
          <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-md text-center space-y-4">
            <span className="text-4xl">🎨</span>
            <h3 className="text-lg font-bold text-slate-900">
              Interactive Rough Scratchpad & Malayalam/Hindi Writing Board
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Use the digital chalkboard to calculate steps, draw geometry shapes, or practice writing Malayalam and Hindi letters.
            </p>
            <button
              onClick={() => setIsScratchpadOpen(true)}
              className="px-6 py-3 bg-linear-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-md hover:from-amber-600 hover:to-orange-600 cursor-pointer"
            >
              Open Fullscreen Scratchpad
            </button>
          </div>
        )}

        {/* Daily Quiz Tab */}
        {currentTab === 'quiz' && (
          <DailyQuizView
            selectedSubject={selectedSubject}
            language={language}
            gradeLevel={`${profile.grade} ${profile.board}`}
          />
        )}

      </main>

      {/* Scratchpad Modal */}
      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        onSendToHomework={handleScratchpadSend}
      />

      {/* Profile & Board Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Footer */}
      <footer className="no-print mt-12 py-6 border-t border-amber-100 bg-white/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            Vidyasaathi AI (വിദ്യാസാഥി) • School Homework Tutor for {profile.grade} {profile.board}
          </p>
          <p className="text-slate-400">
            Supports Malayalam (മലയാളം), English, and Hindi (हिन्दी)
          </p>
        </div>
      </footer>

    </div>
  );
}
