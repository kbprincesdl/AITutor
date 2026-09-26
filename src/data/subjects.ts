import { SubjectInfo } from '../types';

export const SUBJECTS: SubjectInfo[] = [
  {
    id: 'math',
    name: 'Mathematics',
    nameMl: 'കണക്ക്',
    nameHi: 'गणित',
    icon: '📐',
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50 text-amber-900 border-amber-200',
    borderColor: 'border-amber-400',
    sampleQuestions: [
      {
        text: 'A rectangle garden is 12 meters long and 7 meters wide. What is its perimeter and area?',
        textMl: 'ഒരു ചതുരാകൃതിയിലുള്ള തോട്ടത്തിന് 12 മീറ്റർ നീളവും 7 മീറ്റർ വീതിയുമുണ്ട്. ഇതിന്റെ ചുറ്റളവും വിസ്തീർണ്ണവും എത്രയാണ്?',
      },
      {
        text: 'How do I add fractions with different denominators? Solve: 2/3 + 3/4',
        textMl: 'വ്യത്യസ്ത ഛേദങ്ങളുള്ള ഭിന്നസംഖ്യകൾ എങ്ങനെ കൂട്ടാം? കണക്കുകൂട്ടുക: 2/3 + 3/4',
      },
      {
        text: 'Find the prime factors and LCM of 12 and 18 using step by step method.',
        textMl: '12, 18 എന്നീ സംഖ്യകളുടെ ലഘു common factor (LCM) ഘടകക്രിയ വഴി കണ്ടെത്തുക.',
      },
      {
        text: 'Convert 4.75 kilograms into grams and explain the decimal shift.',
        textMl: '4.75 കിലോഗ്രാമിനെ ഗ്രാമാക്കി മാറ്റുക.',
      },
    ],
  },
  {
    id: 'science',
    name: 'Science & EVS',
    nameMl: 'പരിസരപഠനം / ശാസ്ത്രം',
    nameHi: 'विज्ञान / पर्यावरण',
    icon: '🔬',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    borderColor: 'border-emerald-400',
    sampleQuestions: [
      {
        text: 'Explain the process of photosynthesis in green leaves with the required ingredients.',
        textMl: 'പച്ച ഇലകളിൽ പ്രകാശസംശ്ലേഷണം (Photosynthesis) എങ്ങനെ നടക്കുന്നുവെന്ന് വിശദീകരിക്കാമോ?',
      },
      {
        text: 'What is the water cycle? Name the four stages with simple examples.',
        textMl: 'ജലചക്രം (Water Cycle) എന്നാൽ എന്ത്? അതിന്റെ പ്രധാന ഘട്ടങ്ങൾ ഏവ?',
      },
      {
        text: 'Why do aquatic animals like fish breathe underwater? How do their gills work?',
        textMl: 'മത്സ്യങ്ങൾക്ക് വെള്ളത്തിനടിയിൽ എങ്ങനെ ശ്വാസമെടുക്കാൻ കഴിയുന്നു?',
      },
      {
        text: 'What are the three states of matter and what happens during condensation?',
        textMl: 'പദാർത്ഥത്തിന്റെ മൂന്ന് അവസ്ഥകൾ ഏവ? സാന്ദ്രീകരണം (Condensation) എന്നാൽ എന്ത്?',
      },
    ],
  },
  {
    id: 'malayalam',
    name: 'Malayalam',
    nameMl: 'മലയാളം',
    nameHi: 'मलयालम',
    icon: '🌴',
    color: 'from-green-600 to-emerald-700',
    bgLight: 'bg-green-50 text-green-900 border-green-200',
    borderColor: 'border-green-500',
    sampleQuestions: [
      {
        text: 'സന്ധി പിരിച്ചെഴുതുക: വിദ്യാലയം, മഹോത്സവം, പച്ചില. ഇവയിലെ സന്ധി നിയമം വിശദീകരിക്കൂ.',
        textMl: 'സന്ധി പിരിച്ചെഴുതുക: വിദ്യാലയം, മഹോത്സവം. ഇതിന്റെ സന്ധി നിയമം വ്യക്തമാക്കുക.',
      },
      {
        text: 'വിപരീത പദങ്ങൾ എഴുതുക: വെളിച്ചം, ആശ, ആദരം, സുഖം, സത്യം.',
        textMl: 'വിപരീത പദങ്ങൾ എഴുതുക: വെളിച്ചം, ആശ, ആദരം, സുഖം.',
      },
      {
        text: 'കുമാരനാശാന്റെ \'വീണപൂവ്\' അല്ലെങ്കിൽ വള്ളത്തോളിന്റെ കവിതകളിലെ പ്രധാന സന്ദേശം 5 വരിയിൽ ലളിതമായി പറയൂ.',
        textMl: 'കവിതയുടെ പ്രധാന ആശയം ലളിതമായ ഭാഷയിൽ വിശദീകരിച്ചു തരൂ.',
      },
      {
        text: 'പര്യായപദങ്ങൾ കണ്ടെത്തുക: സൂര്യൻ, ചന്ദ്രൻ, വെള്ളം, ആകാശം (ഓരോന്നിനും രണ്ട് പര്യായങ്ങൾ).',
        textMl: 'സൂര്യൻ, ചന്ദ്രൻ, വെള്ളം എന്നിവയുടെ 2 പര്യായപദങ്ങൾ വീതം എഴുതുക.',
      },
    ],
  },
  {
    id: 'hindi',
    name: 'Hindi',
    nameMl: 'ഹിന്ദി',
    nameHi: 'हिन्दी',
    icon: '🇮🇳',
    color: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50 text-rose-900 border-rose-200',
    borderColor: 'border-rose-400',
    sampleQuestions: [
      {
        text: 'विलोम शब्द लिखिए: प्रकाश, मित्र, दिन, कठिन, सत्य (Explain in Hindi & Malayalam).',
        textHi: 'विलोम शब्द लिखिए: प्रकाश, मित्र, दिन, कठिन, सत्य।',
      },
      {
        text: 'संज्ञा की परिभाषा और उसके तीन भेद उदाहरण सहित समझाइए।',
        textHi: 'संज्ञा किसे कहते हैं? इसके भेदों को सरल उदाहरण से समझाइए।',
      },
      {
        text: 'लिंग बदलिए और वाक्य बनाइए: लड़का, मोर, राजा, अध्यापक।',
        textHi: 'लिंग बदलिए: लड़का, मोर, राजा, अध्यापक।',
      },
      {
        text: 'दो दिन की छुट्टी के लिए प्रधानाचार्य को प्रार्थना पत्र कैसे लिखें?',
        textHi: 'विद्यालय में दो दिन की छुट्टी के लिए प्रधानाचार्य को प्रार्थना पत्र का प्रारूप दीजिए।',
      },
    ],
  },
  {
    id: 'english',
    name: 'English',
    nameMl: 'ഇംഗ്ലീഷ്',
    nameHi: 'अंग्रेजी',
    icon: '📖',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50 text-blue-900 border-blue-200',
    borderColor: 'border-blue-400',
    sampleQuestions: [
      {
        text: 'What is the difference between Simple Present and Present Continuous tense? Give 3 examples.',
        textMl: 'Simple Present, Present Continuous Tense എന്നിവ തമ്മിലുള്ള വ്യത്യാസം ഉദാഹരണസഹിതം വിശദീകരിക്കാമോ?',
      },
      {
        text: 'Fill in with correct prepositions: (in, on, under, at): "The cat sat ___ the mat", "He arrived ___ 5 PM".',
        textMl: 'Prepositions ഉപയോഗിച്ച് വാക്യം പൂരിപ്പിക്കുക: in, on, at, under.',
      },
      {
        text: 'How to write a formal leave application letter to the class teacher for being absent due to fever?',
        textMl: 'പനി കാരണം സ്കൂളിൽ വരാൻ കഴിയാത്തതിന് ക്ലാസ് ടീച്ചർക്ക് നൽകാനുള്ള Leave Letter എങ്ങനെ എഴുതാം?',
      },
      {
        text: 'Change into Passive Voice: "Rohan kicked the football" and "Anu draws a picture".',
        textMl: 'Active Voice-ൽ നിന്ന് Passive Voice-ലേക്ക് മാറ്റുന്ന നിയമങ്ങൾ എന്തൊക്കെയാണ്?',
      },
    ],
  },
  {
    id: 'social',
    name: 'Social Science',
    nameMl: 'സാമൂഹ്യശാസ്ത്രം',
    nameHi: 'सामाजिक विज्ञान',
    icon: '🌍',
    color: 'from-amber-600 to-yellow-700',
    bgLight: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    borderColor: 'border-yellow-500',
    sampleQuestions: [
      {
        text: 'What are latitudes and longitudes? Why is the Equator called 0 degree latitude?',
        textMl: 'അക്ഷാംശരേഖകളും രേഖാംശരേഖകളും എന്നാൽ എന്ത്? ഭൂമധ്യരേഖയുടെ പ്രത്യേകത എന്താണ്?',
      },
      {
        text: 'Name the major physical divisions of Kerala (Highland, Midland, Lowland) and their features.',
        textMl: 'കേരളത്തിന്റെ ഭൂപ്രകൃതി വിഭാഗങ്ങൾ (മലനാട്, ഇടനാട്, തീരപ്രദേശം) വിശദീകരിക്കുക.',
      },
      {
        text: 'Who were the major freedom fighters from Kerala who participated in India\'s independence movement?',
        textMl: 'ഇന്ത്യൻ സ്വാതന്ത്ര്യസമരത്തിൽ പങ്കെടുത്ത കേരളത്തിലെ പ്രധാന നേതാക്കൾ ആരെല്ലാം?',
      },
    ],
  },
];
