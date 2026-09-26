export type SubjectId = 
  | 'math'
  | 'science'
  | 'malayalam'
  | 'hindi'
  | 'english'
  | 'social';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  nameMl: string;
  nameHi: string;
  icon: string;
  color: string;
  bgLight: string;
  borderColor: string;
  sampleQuestions: {
    text: string;
    textMl?: string;
    textHi?: string;
  }[];
}

export type TutorMode = 'step_by_step' | 'hint' | 'check_work' | 'practice_similar';

export type AppLanguage = 'Malayalam' | 'English' | 'Hindi' | 'Manglish';

export interface StepItem {
  stepNumber: number;
  title: string;
  explanation: string;
  formulaOrNote?: string;
}

export interface PracticeQuestion {
  question: string;
  hint: string;
  answer: string;
}

export interface SolutionData {
  summary: string;
  conceptName: string;
  steps: StepItem[];
  finalAnswer: string;
  mnemonicOrTip?: string;
  encouragement: string;
  similarPracticeQuestion: PracticeQuestion;
  malayalamAudioText?: string;
}

export interface HomeworkItem {
  id: string;
  timestamp: number;
  subject: SubjectId;
  gradeLevel: string;
  language: AppLanguage;
  query: string;
  imageBase64?: string;
  mode: TutorMode;
  solution: SolutionData;
  isStarred?: boolean;
  isCompleted?: boolean;
  studentNotes?: string;
}

export interface StudentProfile {
  name: string;
  grade: string;
  board: string;
  avatar: string;
  defaultLanguage: AppLanguage;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizData {
  title: string;
  subject: string;
  questions: QuizQuestion[];
}
