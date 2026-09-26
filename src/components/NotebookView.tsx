import React, { useState } from 'react';
import { 
  Search, 
  Bookmark, 
  Check, 
  Trash2, 
  Printer, 
  Eye, 
  Filter, 
  Calendar, 
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { HomeworkItem, SubjectId, AppLanguage } from '../types';
import { SUBJECTS } from '../data/subjects';
import { SolutionCard } from './SolutionCard';

interface NotebookViewProps {
  items: HomeworkItem[];
  onToggleStar: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveNotes: (id: string, notes: string) => void;
  onOpenScratchpad: () => void;
  onTranslate: (id: string, targetLang: AppLanguage) => void;
  onSelectToView: (item: HomeworkItem) => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  items,
  onToggleStar,
  onToggleComplete,
  onDelete,
  onSaveNotes,
  onOpenScratchpad,
  onTranslate,
  onSelectToView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'starred' | 'completed' | 'pending'>('all');
  const [activeExpandedId, setActiveExpandedId] = useState<string | null>(items[0]?.id || null);

  const filteredItems = items.filter((item) => {
    // Subject filter
    if (selectedSubjectFilter !== 'all' && item.subject !== selectedSubjectFilter) {
      return false;
    }
    // Status filter
    if (statusFilter === 'starred' && !item.isStarred) return false;
    if (statusFilter === 'completed' && !item.isCompleted) return false;
    if (statusFilter === 'pending' && item.isCompleted) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQuery = item.query.toLowerCase().includes(q);
      const matchConcept = item.solution.conceptName.toLowerCase().includes(q);
      const matchSummary = item.solution.summary.toLowerCase().includes(q);
      const matchAnswer = item.solution.finalAnswer.toLowerCase().includes(q);
      return matchQuery || matchConcept || matchSummary || matchAnswer;
    }

    return true;
  });

  const activeItem = items.find((it) => it.id === activeExpandedId);

  // Subject statistics
  const completedCount = items.filter((i) => i.isCompleted).length;
  const starredCount = items.filter((i) => i.isStarred).length;

  return (
    <div className="space-y-6">
      
      {/* Header & Stats Banner */}
      <div className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading">
              My Homework Notebook (എന്റെ നോട്ട്ബുക്ക്)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-100 font-medium max-w-xl">
            All your solved doubts, teacher steps, and textbook questions are securely stored here. Revisit anytime before exams!
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="bg-white/20 backdrop-blur-xs px-3.5 py-2 rounded-2xl text-center border border-white/20">
            <p className="text-xs text-amber-100 uppercase tracking-wider font-semibold">
              Total Doubts
            </p>
            <p className="text-xl font-bold">{items.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-xs px-3.5 py-2 rounded-2xl text-center border border-white/20">
            <p className="text-xs text-amber-100 uppercase tracking-wider font-semibold">
              Completed
            </p>
            <p className="text-xl font-bold">{completedCount}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-xs px-3.5 py-2 rounded-2xl text-center border border-white/20">
            <p className="text-xs text-amber-100 uppercase tracking-wider font-semibold">
              Starred
            </p>
            <p className="text-xl font-bold">{starredCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="no-print bg-white rounded-3xl border border-amber-200/80 shadow-md p-4 space-y-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past homework doubts (e.g. perimeter, സന്ധി, fractions, photosynthesis)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-amber-50/30 border border-amber-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white text-slate-800"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedSubjectFilter === 'all'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
              }`}
            >
              All Subjects
            </button>
            {SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectFilter(sub.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  selectedSubjectFilter === sub.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-slate-700 hover:bg-amber-100'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.name}</span>
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Status:</span>
            <select
              aria-label="Filter homework by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Items</option>
              <option value="starred">⭐ Starred for Exam</option>
              <option value="completed">✅ Solved & Completed</option>
              <option value="pending">⏳ Needs Practice</option>
            </select>
            
            <button
              onClick={() => window.print()}
              title="Print homework sheets"
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Record</span>
            </button>
          </div>

        </div>

      </div>

      {/* Main Content: List & Detailed View Split */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-amber-200 p-12 text-center">
          <span className="text-4xl mb-3 inline-block">📝</span>
          <h3 className="text-base font-bold text-slate-800">
            No homework doubts found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery
              ? 'Try adjusting your search terms or filters.'
              : 'Ask a doubt in Mathematics, Science, Malayalam, Hindi, or English to save it here!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Homework Items List (Left Column) */}
          <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const sub = SUBJECTS.find((s) => s.id === item.subject) || SUBJECTS[0];
              const isSelected = activeExpandedId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveExpandedId(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-linear-to-r from-amber-50 to-orange-50/50 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-white hover:bg-amber-50/30 border-amber-100 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sub.icon}</span>
                      <div>
                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                          {sub.name} • {sub.nameMl}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                          {item.solution.conceptName}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.isStarred && (
                        <span className="text-amber-500 text-xs">⭐</span>
                      )}
                      {item.isCompleted && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Done
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-2 font-medium">
                    {item.query}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-amber-100/70 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {new Date(item.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="font-bold text-amber-800 flex items-center gap-1 group">
                      <span>View Solution</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Solution Details (Right Column) */}
          <div className="lg:col-span-7">
            {activeItem ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Full Homework Breakdown:
                  </span>
                  <button
                    onClick={() => onDelete(activeItem.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>
                </div>

                <SolutionCard
                  homework={activeItem}
                  onToggleStar={onToggleStar}
                  onToggleComplete={onToggleComplete}
                  onSaveNotes={onSaveNotes}
                  onOpenScratchpad={onOpenScratchpad}
                  onTranslate={onTranslate}
                />
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-amber-200 p-8 text-center text-slate-500">
                Select a homework doubt from the left to view its complete step-by-step solution.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
