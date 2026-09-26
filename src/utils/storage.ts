import { HomeworkItem, StudentProfile } from '../types';

const HOMEWORK_STORAGE_KEY = 'vidyasaathi_homework_history_v1';
const PROFILE_STORAGE_KEY = 'vidyasaathi_student_profile_v1';

export const DEFAULT_PROFILE: StudentProfile = {
  name: 'Ananya',
  grade: 'Class 5',
  board: 'CBSE (Kerala)',
  avatar: '🦉',
  defaultLanguage: 'Malayalam',
};

const SEED_HOMEWORK: HomeworkItem[] = [
  {
    id: 'sample-math-1',
    timestamp: Date.now() - 3600000 * 2,
    subject: 'math',
    gradeLevel: 'Class 5 CBSE (Kerala)',
    language: 'Malayalam',
    query: 'ഒരു ചതുരാകൃതിയിലുള്ള തോട്ടത്തിന് 14 മീറ്റർ നീളവും 8 മീറ്റർ വീതിയുമുണ്ട്. ഇതിന്റെ ചുറ്റളവും (Perimeter) വിസ്തീർണ്ണവും (Area) കണ്ടെത്തുക.',
    mode: 'step_by_step',
    isStarred: true,
    isCompleted: true,
    studentNotes: 'പരീക്ഷയ്ക്ക് പ്രധാനപ്പെട്ട ചോദ്യം! ഫോർമുല ഓർത്തുവെക്കുക.',
    solution: {
      summary: 'തോട്ടത്തിന്റെ ചുറ്റളവും വിസ്തീർണ്ണവും സൂത്രവാക്യം (Formula) ഉപയോഗിച്ച് ഘട്ടം ഘട്ടമായി കണ്ടെത്താം.',
      conceptName: 'ചുറ്റളവും വിസ്തീർണ്ണവും (Perimeter & Area of Rectangle)',
      steps: [
        {
          stepNumber: 1,
          title: 'നൽകിയിരിക്കുന്ന വിവരങ്ങൾ രേഖപ്പെടുത്തുക',
          explanation: 'ചതുരത്തിന്റെ നീളം (Length, l) = 14 മീറ്റർ, വീതി (Breadth, b) = 8 മീറ്റർ.',
          formulaOrNote: 'നീളം l = 14 m, വീതി b = 8 m',
        },
        {
          stepNumber: 2,
          title: 'ചുറ്റളവ് (Perimeter) കണക്കാക്കുക',
          explanation: 'ഒരു ചതുരത്തിന്റെ ചുറ്റളവ് കാണാനുള്ള സൂത്രവാക്യം = 2 × (നീളം + വീതി) ആണ്.',
          formulaOrNote: 'Perimeter = 2 × (14 + 8) = 2 × 22 = 44 മീറ്റർ',
        },
        {
          stepNumber: 3,
          title: 'വിസ്തീർണ്ണം (Area) കണക്കാക്കുക',
          explanation: 'ചതുരത്തിന്റെ വിസ്തീർണ്ണം കാണാൻ നീളത്തെ വീതികൊണ്ട് ഗുണിക്കുക.',
          formulaOrNote: 'Area = നീളം × വീതി = 14 × 8 = 112 ചതുരശ്ര മീറ്റർ (sq.m)',
        },
      ],
      finalAnswer: 'ചുറ്റളവ് = 44 മീറ്റർ, വിസ്തീർണ്ണം = 112 ചതുരശ്ര മീറ്റർ (112 m²).',
      mnemonicOrTip: 'ഓർക്കുക: ചുറ്റളവ് എന്നാൽ വേലി കെട്ടുന്ന ദൂരം (മീറ്റർ), വിസ്തീർണ്ണം എന്നാൽ പുല്ല് നടുന്ന സ്ഥലം (ചതുരശ്ര മീറ്റർ / sq.m)!',
      encouragement: 'മിടുക്കി! വളരെ ലളിതമായി ഈ രണ്ട് സൂത്രവാക്യങ്ങളും നീ പഠിച്ചുകഴിഞ്ഞു! 🌟',
      similarPracticeQuestion: {
        question: 'ഒരു കളിക്കളത്തിന് 20 മീറ്റർ നീളവും 10 മീറ്റർ വീതിയുമുണ്ട്. ഇതിന്റെ ചുറ്റളവും വിസ്തീർണ്ണവും എത്ര?',
        hint: 'Perimeter = 2 × (20 + 10), Area = 20 × 10',
        answer: 'ചുറ്റളവ് = 60 മീറ്റർ, വിസ്തീർണ്ണം = 200 ചതുരശ്ര മീറ്റർ.',
      },
      malayalamAudioText: 'ചതുരത്തിന്റെ ചുറ്റളവ് കാണാൻ രണ്ട് ഗുണം നീളവും വീതിയും കൂട്ടിയ തുക എടുക്കുക. വിസ്തീർണ്ണം കാണാൻ നീളത്തെ വീതികൊണ്ട് ഗുണിക്കുക. ചുറ്റളവ് 44 മീറ്ററും വിസ്തീർണ്ണം 112 ചതുരശ്ര മീറ്ററുമാണ്.',
    },
  },
  {
    id: 'sample-malayalam-1',
    timestamp: Date.now() - 3600000 * 24,
    subject: 'malayalam',
    gradeLevel: 'Class 5 CBSE (Kerala)',
    language: 'Malayalam',
    query: 'വിദ്യാലയം, മഹോത്സവം എന്നിവ സന്ധി പിരിച്ചെഴുതി സന്ധി നിയമം വിശദീകരിക്കൂ.',
    mode: 'step_by_step',
    isStarred: true,
    isCompleted: false,
    solution: {
      summary: 'സംസ്കൃത സന്ധി നിയമങ്ങൾ അനുസരിച്ച് ഈ പദങ്ങൾ പിരിച്ചെഴുതുന്നത് എങ്ങനെയെന്ന് പഠിക്കാം.',
      conceptName: 'സന്ധി വിഭജനം (സവർണ്ണദീർഘസന്ധി, ഗുണസന്ധി)',
      steps: [
        {
          stepNumber: 1,
          title: 'വിദ്യാലയം പിരിച്ചെഴുതൽ',
          explanation: 'വിദ്യ + ആലയം = വിദ്യാലയം. ഇവിടെ \'വിദ്യ\' എന്നതിലെ അവസാനത്തെ \'അ\' കാരവും \'ആലയം\' എന്നതിലെ ആദ്യത്തെ \'ആ\' കാരവും ചേർന്ന് ദീർഘസ്വരമായ \'ആ\' ആയി മാറുന്നു.',
          formulaOrNote: 'വിദ്യ + ആലയം = വിദ്യാലയം (സവർണ്ണദീർഘസന്ധി)',
        },
        {
          stepNumber: 2,
          title: 'മഹോത്സവം പിരിച്ചെഴുതൽ',
          explanation: 'മഹാ + ഉത്സവം = മഹോത്സവം. ഇവിടെ \'മഹാ\' എന്നതിലെ \'ആ\' കാരവും \'ഉത്സവം\' എന്നതിലെ \'ഉ\' കാരവും ചേർന്ന് \'ഓ\' കാരമായി മാറുന്നു.',
          formulaOrNote: 'മഹാ + ഉത്സവം = മഹോത്സവം (ഗുണസന്ധി)',
        },
      ],
      finalAnswer: '1. വിദ്യ + ആലയം = വിദ്യാലയം\n2. മഹാ + ഉത്സവം = മഹോത്സവം',
      mnemonicOrTip: 'ടിപ്പ്: ഒരേ വർഗ്ഗത്തിലുള്ള സ്വരങ്ങൾ ചേരുമ്പോൾ ദീർഘം വരും (അ + ആ = ആ). \'അ\' കാരത്തിന് ശേഷം \'ഉ\' വന്നാൽ \'ഓ\' ആയി മാറും!',
      encouragement: 'നന്നായി മനസ്സിലാക്കി! മലയാളം വ്യാകരണം വളരെ രസകരമാണ്! 📚',
      similarPracticeQuestion: {
        question: 'സൂര്യോദയം, ദേവാലയം എന്നിവ സന്ധി പിരിച്ചെഴുതുക.',
        hint: 'സൂര്യ + ഉദയം, ദേവ + ആലയം',
        answer: 'സൂര്യ + ഉദയം = സൂര്യോദയം, ദേവ + ആലയം = ദേവാലയം',
      },
    },
  },
];

export function getStoredHomework(): HomeworkItem[] {
  if (typeof window === 'undefined') return SEED_HOMEWORK;
  try {
    const raw = localStorage.getItem(HOMEWORK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(SEED_HOMEWORK));
      return SEED_HOMEWORK;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load homework from storage:', e);
    return SEED_HOMEWORK;
  }
}

export function saveHomeworkItem(item: HomeworkItem): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredHomework();
    const existingIndex = list.findIndex((h) => h.id === item.id);
    if (existingIndex >= 0) {
      list[existingIndex] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save homework:', e);
  }
}

export function deleteHomeworkItem(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredHomework().filter((h) => h.id !== id);
    localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete homework:', e);
  }
}

export function getStudentProfile(): StudentProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_PROFILE;
  }
}

export function saveStudentProfile(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}
