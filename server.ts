import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Support large payload for homework image uploads
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize base64 strings from data URLs
function parseBase64(dataUrlOrRaw: string, defaultMime = 'image/jpeg'): { data: string; mimeType: string } {
  if (dataUrlOrRaw.startsWith('data:')) {
    const commaIndex = dataUrlOrRaw.indexOf(',');
    if (commaIndex !== -1) {
      const meta = dataUrlOrRaw.slice(5, commaIndex); // e.g. "audio/webm;codecs=opus;base64" or "image/png;base64"
      const rawData = dataUrlOrRaw.slice(commaIndex + 1);
      const semicolonIndex = meta.indexOf(';');
      let mimeType = semicolonIndex !== -1 ? meta.slice(0, semicolonIndex).trim() : meta.trim();
      // Normalize common audio mimes
      if (mimeType.includes('audio/webm')) mimeType = 'audio/webm';
      else if (mimeType.includes('audio/mp4')) mimeType = 'audio/mp4';
      else if (mimeType.includes('audio/aac')) mimeType = 'audio/aac';
      else if (mimeType.includes('audio/wav')) mimeType = 'audio/wav';
      else if (mimeType.includes('audio/ogg')) mimeType = 'audio/ogg';

      return {
        mimeType: mimeType || defaultMime,
        data: rawData.trim(),
      };
    }
  }
  return {
    mimeType: defaultMime,
    data: dataUrlOrRaw.trim(),
  };
}

// Resilient wrapper for Gemini calls with retry on transient 503/429 and fallback model
async function generateWithRetry(params: any, maxRetries = 3) {
  const primaryModel = params.model || 'gemini-3.8-flash';
  const modelsToTry = [primaryModel, 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await ai.models.generateContent({
          ...params,
          model: modelName,
        });
      } catch (err: any) {
        attempt++;
        lastError = err;
        const isTransient =
          err?.status === 'UNAVAILABLE' ||
          err?.message?.includes('503') ||
          err?.message?.includes('high demand') ||
          err?.message?.includes('429');
        if (isTransient && attempt < maxRetries) {
          const delay = attempt * 1200;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // If transient failed on primary model, move to fallback model
        break;
      }
    }
  }
  throw lastError || new Error('Max retries exceeded');
}

// Homework Solver Endpoint
app.post('/api/tutor/solve', async (req: Request, res: Response) => {
  try {
    const {
      query,
      image,
      subject = 'General',
      gradeLevel = 'Class 5 CBSE (Kerala)',
      language = 'Malayalam', // 'Malayalam', 'English', 'Hindi', 'Manglish'
      mode = 'step_by_step', // 'step_by_step', 'hint', 'check_work', 'practice_similar'
      studentAttempt = '',
      conversationHistory = [],
    } = req.body;

    if (!query && !image) {
      return res.status(400).json({ error: 'Please provide either a homework question or an image.' });
    }

    let languageDirective = '';
    if (language === 'Malayalam') {
      languageDirective = `Explain primarily in clear, natural, warm Malayalam (മലയാളം). You can use English for technical terms or math notation where helpful, but the explanation and guidance must be in Malayalam script so Kerala students understand thoroughly.`;
    } else if (language === 'Hindi') {
      languageDirective = `Explain primarily in simple, encouraging Hindi (हिन्दी) in Devanagari script, suitable for CBSE Class 5 and school students.`;
    } else if (language === 'Manglish') {
      languageDirective = `Explain in conversational Malayalam written in Latin/English alphabets (Manglish) so students who speak Malayalam at home but find reading English letters easier can follow naturally. Also provide Malayalam script key terms where beneficial.`;
    } else {
      languageDirective = `Explain in simple, encouraging, crystal-clear English appropriate for school students. You may provide Malayalam or Hindi equivalents for tricky concepts when helpful.`;
    }

    let modeDirective = '';
    if (mode === 'hint') {
      modeDirective = `The student asked for a HINT (സൂചന / संकेत). Do NOT give the final direct solution immediately. Guide them with a gentle clue, ask them a guiding question, point out the formula or first step, and encourage them to try the next step.`;
    } else if (mode === 'check_work') {
      modeDirective = `The student wants to CHECK THEIR WORK (എന്റെ ഉത്തരം പരിശോധിക്കൂ). Their attempt is: "${studentAttempt}". Check their working carefully. Point out what they did correctly, gently identify any calculation or grammatical mistakes, and show how to fix it with positive encouragement.`;
    } else if (mode === 'practice_similar') {
      modeDirective = `Provide a SIMILAR PRACTICE PROBLEM (ഇതുപോലെയുള്ള മറ്റൊരു പരിശീലന ചോദ്യം) matching the same difficulty and concept as the doubt, with step-by-step guidance on how to solve it and answer key.`;
    } else {
      modeDirective = `Provide a thorough, child-friendly, STEP-BY-STEP GUIDANCE (ഘട്ടം ഘട്ടമായുള്ള വിവരണം). Break the problem into simple numbered steps (Step 1, Step 2, Step 3...). Use everyday relatable examples (like Kerala coconuts, mangoes, school lunch boxes, football, cricket, boat races, or classroom situations). Never make it overwhelming.`;
    }

    const systemInstruction = `You are 'Vidyasaathi' (വിദ്യാസാഥി), a beloved, patient, and brilliant school homework tutor and mentor designed for school students in Kerala and across India (specifically optimized for CBSE/State syllabi such as Class 5 CBSE Kerala, covering Mathematics, Science/EVS, Malayalam, Hindi, English, and Social Science).

Pedagogical Principles:
1. Target Audience: School student studying in ${gradeLevel}. Keep language friendly, polite, respectful, and free of unnecessary technical jargon.
2. Subject Expertise:
   - For Mathematics: Show formulas clearly, show working steps with intermediate numbers, explain *why* we carry over or divide or simplify fractions.
   - For Malayalam: Address grammar (സന്ധി, സമാസം, നാമം, ക്രിയ, വിപരീത പദങ്ങൾ, പര്യായങ്ങൾ), poetry meaning (കവിതാ താത്പര്യം), question answers, essay/letter hints.
   - For Hindi: Address grammar (विलोम शब्द, पर्यायवाची, लिंग, वचन, काल), lesson meanings, sentence making.
   - For Science/EVS: Explain natural phenomena with everyday observations, diagrams in text/emojis, and cause-effect reasoning.
   - For English: Grammar rules (tenses, parts of speech, active/passive, punctuation) with clear before/after examples.
3. Tone: Very encouraging, enthusiastic, celebratory! Use warm praise like "നന്നായി ചോദിച്ചു!", "Great thinking!", "शाबाश!".
4. Language Requirement: ${languageDirective}
5. Mode Requirement: ${modeDirective}
6. Always return JSON adhering to the specified schema so the UI can render rich interactive cards, steps, and scratchpad hints.`;

    const contentsParts: any[] = [];

    // Attach homework image if present
    if (image && image.data) {
      const parsed = parseBase64(image.data);
      contentsParts.push({
        inlineData: {
          mimeType: parsed.mimeType || 'image/jpeg',
          data: parsed.data,
        },
      });
    }

    // Build context with conversation history if available
    let promptText = `Subject: ${subject}
Grade/Class: ${gradeLevel}
Selected Language: ${language}
Student Mode: ${mode}
Student Homework Question / Doubt: ${query || 'Please examine the homework image provided.'}
${studentAttempt ? `Student Attempt / Rough Work: ${studentAttempt}` : ''}`;

    if (conversationHistory && conversationHistory.length > 0) {
      const formattedHistory = conversationHistory
        .slice(-4)
        .map((h: any) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.text}`)
        .join('\n');
      promptText += `\n\nRecent context:\n${formattedHistory}`;
    }

    contentsParts.push({ text: promptText });

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: { parts: contentsParts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'One sentence friendly summary of what the problem is asking in the chosen language.',
            },
            conceptName: {
              type: Type.STRING,
              description: 'The core topic or concept name (e.g. Fraction Addition, സന്ധി, Photosynthesis, Tenses).',
            },
            steps: {
              type: Type.ARRAY,
              description: 'Step-by-step explanation broken down clearly.',
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING, description: 'Short title for this step.' },
                  explanation: { type: Type.STRING, description: 'Clear explanation of this step.' },
                  formulaOrNote: { type: Type.STRING, description: 'Formula, calculation, rule, or example if applicable.' },
                },
                required: ['stepNumber', 'title', 'explanation'],
              },
            },
            finalAnswer: {
              type: Type.STRING,
              description: 'The clear final answer or key conclusion.',
            },
            mnemonicOrTip: {
              type: Type.STRING,
              description: 'A handy memory tip, fun trick, or golden rule for remembering this concept.',
            },
            encouragement: {
              type: Type.STRING,
              description: 'Enthusiastic congratulatory or motivating words in the chosen language.',
            },
            similarPracticeQuestion: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: 'A similar practice question for the student to try.' },
                hint: { type: Type.STRING, description: 'A clue if they get stuck.' },
                answer: { type: Type.STRING, description: 'The solution to this practice question.' },
              },
              required: ['question', 'hint', 'answer'],
            },
            malayalamAudioText: {
              type: Type.STRING,
              description: 'A 2-3 sentence natural audio narration summary in Malayalam or student language suitable for speech read-aloud.',
            },
          },
          required: ['summary', 'conceptName', 'steps', 'finalAnswer', 'encouragement', 'similarPracticeQuestion'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: 'Empty response received from tutor engine.' });
    }

    const parsedJson = JSON.parse(text);
    res.json({
      success: true,
      data: parsedJson,
    });
  } catch (err: any) {
    console.error('Error solving homework doubt:', err);
    res.status(500).json({
      error: 'Failed to solve homework doubt. Please try again.',
      details: err?.message || String(err),
    });
  }
});

// Translation / Language Switcher Endpoint
app.post('/api/tutor/translate', async (req: Request, res: Response) => {
  try {
    const { solutionData, targetLanguage } = req.body;
    if (!solutionData || !targetLanguage) {
      return res.status(400).json({ error: 'Missing solutionData or targetLanguage' });
    }

    const prompt = `Translate and adapt this school homework explanation into ${targetLanguage} (Malayalam / English / Hindi / Manglish). 
Ensure the pedagogical clarity, child-friendly tone, and educational quality are preserved.
Original JSON:
${JSON.stringify(solutionData)}`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are Vidyasaathi homework translator. Translate the JSON fields accurately into ${targetLanguage}. Maintain identical JSON structure.`,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error translating solution:', err);
    res.status(500).json({ error: 'Translation failed', details: err?.message });
  }
});

// Daily Subject Practice Quiz Generator
app.post('/api/tutor/practice-quiz', async (req: Request, res: Response) => {
  try {
    const {
      subject = 'Mathematics',
      gradeLevel = 'Class 5 CBSE (Kerala)',
      language = 'Malayalam',
    } = req.body;

    const systemInstruction = `You are a school teacher for ${gradeLevel} in Kerala/CBSE. Generate 3 engaging, syllabus-aligned practice questions for ${subject}.
Language requested: ${language}.
Each question should be practical, fun, and test fundamental concepts.`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: `Generate 3 interactive practice questions for ${subject} for ${gradeLevel} in ${language}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '4 multiple choice options',
                  },
                  correctOptionIndex: { type: Type.INTEGER, description: '0, 1, 2, or 3' },
                  explanation: { type: Type.STRING, description: 'Explanation why the answer is correct.' },
                },
                required: ['id', 'question', 'options', 'correctOptionIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'subject', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error generating quiz:', err);
    res.status(500).json({ error: 'Failed to generate practice quiz', details: err?.message });
  }
});

// Speech Synthesis Endpoint (TTS) using gemini-3.8-flash-lite-tts
app.post('/api/tutor/tts', async (req: Request, res: Response) => {
  try {
    const { text, language = 'Malayalam' } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Limit text to 300 characters for snappy voice synthesis
    const trimmedText = text.slice(0, 350);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: 'Gentle, friendly, patient school teacher explaining to a child',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ success: true, audioBase64: base64Audio });
    }

    res.status(404).json({ error: 'No audio generated' });
  } catch (err: any) {
    console.warn('TTS server fallback:', err?.message);
    // Don't crash; frontend will fall back to browser SpeechSynthesis API
    res.status(500).json({ error: 'TTS unavailable, client will fallback', details: err?.message });
  }
});

// Speech Transcription Endpoint (Audio to text via Gemini)
app.post('/api/tutor/transcribe', async (req: Request, res: Response) => {
  try {
    const { audio, mimeType = 'audio/webm', language = 'Malayalam' } = req.body;
    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const parsed = parseBase64(audio);

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: parsed.mimeType || mimeType || 'audio/webm',
              data: parsed.data,
            },
          },
          {
            text: `Transcribe this school student's spoken homework question or doubt accurately into text.
The student might speak in ${language} (Malayalam, English, Hindi, or Manglish).
Do NOT answer the question. Only output the exact spoken question/doubt in the student's spoken language.
Return ONLY the transcribed text. Do not add quotes or explanations.`,
          },
        ],
      },
    });

    const transcribedText = response.text?.trim() || '';
    res.json({ success: true, text: transcribedText });
  } catch (err: any) {
    console.error('Audio transcription error:', err);
    res.status(500).json({ error: 'Failed to transcribe audio', details: err?.message });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Vidyasaathi AI Tutor server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
