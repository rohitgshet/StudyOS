// StudyOS Live AI Engine (Google Gemini, OpenAI, OpenRouter, Groq, Ollama)
import { Subject, Exam, Task, Note } from '../types';

export type AIProvider = 'gemini' | 'openai' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customBaseUrl?: string;
  apiVersion?: 'v1' | 'v1beta';
}

const AI_CONFIG_KEY = 'studyos_ai_config';

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-3.8-flash',
  apiVersion: 'v1beta',
};

export class AIService {
  static getConfig(): AIConfig {
    try {
      const stored = localStorage.getItem(AI_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Auto-upgrade legacy models to Google's required gemini-3.8-flash
        if (
          !parsed.model ||
          parsed.model.startsWith('gemini-1.') ||
          parsed.model.startsWith('gemini-2.') ||
          parsed.model === 'gemini-2.5-flash'
        ) {
          parsed.model = 'gemini-3.8-flash';
          parsed.apiVersion = 'v1beta';
        }
        return { ...DEFAULT_AI_CONFIG, ...parsed };
      }
    } catch {}
    return DEFAULT_AI_CONFIG;
  }

  static saveConfig(config: AIConfig): void {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  }

  static isConfigured(): boolean {
    const config = this.getConfig();
    return Boolean(config.apiKey && config.apiKey.trim().length > 5);
  }

  // Fetch all models supported by this specific Gemini API Key across v1 and v1beta
  static async fetchAvailableGeminiModels(apiKey: string): Promise<{ name: string; version: 'v1' | 'v1beta' }[]> {
    if (!apiKey || apiKey.trim().length < 5) {
      return [
        { name: 'gemini-3.8-flash', version: 'v1beta' },
        { name: 'gemini-3.7-flash', version: 'v1beta' },
        { name: 'gemma-4-31b-it', version: 'v1' },
      ];
    }

    const discovered: { name: string; version: 'v1' | 'v1beta' }[] = [];

    // Try v1beta first
    try {
      const resBeta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
      if (resBeta.ok) {
        const data = await resBeta.json();
        if (data.models && Array.isArray(data.models)) {
          data.models
            .filter((m: { supportedGenerationMethods?: string[] }) =>
              m.supportedGenerationMethods?.includes('generateContent')
            )
            .forEach((m: { name: string }) => {
              const clean = m.name.replace(/^models\//, '');
              discovered.push({ name: clean, version: 'v1beta' });
            });
        }
      }
    } catch {}

    // Try v1
    try {
      const resV1 = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey.trim()}`);
      if (resV1.ok) {
        const data = await resV1.json();
        if (data.models && Array.isArray(data.models)) {
          data.models
            .filter((m: { supportedGenerationMethods?: string[] }) =>
              m.supportedGenerationMethods?.includes('generateContent')
            )
            .forEach((m: { name: string }) => {
              const clean = m.name.replace(/^models\//, '');
              if (!discovered.some(d => d.name === clean)) {
                discovered.push({ name: clean, version: 'v1' });
              }
            });
        }
      }
    } catch {}

    if (discovered.length > 0) return discovered;

    return [
      { name: 'gemini-3.8-flash', version: 'v1beta' },
      { name: 'gemini-3.7-flash', version: 'v1beta' },
      { name: 'gemma-4-31b-it', version: 'v1' },
    ];
  }

  // Clean any model output that echoes internal prompt meta
  private static cleanText(text: string): string {
    if (!text) return '';
    return text.replace(/^(?:[•\-\*]\s*(?:Persona|Context|Goal|Structure|Instructions|Guidelines):[^\n]*\n*)+/gi, '').trim() || text;
  }

  // Construct academic context prompt
  static buildAcademicContext(
    subjects: Subject[],
    exams: Exam[],
    tasks: Task[],
    notes: Note[]
  ): string {
    const subjectList = subjects.map(s => s.code).join(', ');
    const examList = exams.map(e => `${e.title} (${e.date})`).join(', ');

    return `You are StudyOS AI, an intelligent, ultra-fast university tutor.
Student's courses: ${subjectList || 'Undergraduate'}.
Upcoming exams: ${examList || 'None'}.

Instructions:
- Answer directly, concisely, and accurately.
- Do NOT repeat instructions, goals, or personas.
- Use clean markdown, bold terms, and bullet points.`;
  }

  // Live test connection with auto-detection of working endpoint and model
  static async testConnection(config: AIConfig): Promise<{ success: boolean; message: string; updatedModel?: string }> {
    if (!config.apiKey.trim()) {
      return { success: false, message: 'Please provide an API key.' };
    }

    try {
      if (config.provider === 'gemini') {
        const candidates: { model: string; version: 'v1' | 'v1beta' }[] = [
          { model: config.model || 'gemini-3.8-flash', version: config.apiVersion || 'v1beta' },
          { model: 'gemini-3.8-flash', version: 'v1beta' },
          { model: 'gemini-3.7-flash', version: 'v1beta' },
          { model: 'gemma-4-31b-it', version: 'v1' },
          { model: 'gemini-3-flash-preview', version: 'v1beta' },
        ];

        let lastErr = '';
        for (const candidate of candidates) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const url = `https://generativelanguage.googleapis.com/${candidate.version}/models/${candidate.model}:generateContent?key=${config.apiKey.trim()}`;
            
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello! Respond with "Connected" in one word.' }] }],
              }),
            });
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              
              config.model = candidate.model;
              config.apiVersion = candidate.version;
              this.saveConfig(config);

              return {
                success: true,
                message: `Connected to Google Gemini! Model: ${candidate.model} (${candidate.version}) — "${text?.trim() || 'Ready'}"`,
                updatedModel: candidate.model,
              };
            } else {
              const errData = await res.json().catch(() => ({}));
              lastErr = errData?.error?.message || `HTTP ${res.status}`;
            }
          } catch (e) {
            lastErr = (e as Error).message || 'Timeout connecting to model';
          }
        }

        // If candidates failed, try dynamically fetching models
        const dynamicModels = await this.fetchAvailableGeminiModels(config.apiKey);
        for (const dyn of dynamicModels) {
          try {
            const url = `https://generativelanguage.googleapis.com/${dyn.version}/models/${dyn.name}:generateContent?key=${config.apiKey.trim()}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hi' }] }],
              }),
            });

            if (res.ok) {
              config.model = dyn.name;
              config.apiVersion = dyn.version;
              this.saveConfig(config);
              return {
                success: true,
                message: `Connected to Google Gemini! Auto-selected: ${dyn.name} (${dyn.version})`,
                updatedModel: dyn.name,
              };
            }
          } catch {}
        }

        throw new Error(lastErr || 'Could not connect to Gemini with this key.');
      } else {
        // OpenAI or Custom
        const baseUrl = config.customBaseUrl?.trim() || 'https://api.openai.com/v1';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey.trim()}`,
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: config.model || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say Ready in one word.' }],
            max_tokens: 10,
          }),
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        return { success: true, message: `Connected successfully! Response: "${text?.trim()}"` };
      }
    } catch (e: unknown) {
      return { success: false, message: (e as Error).message || 'Failed to connect.' };
    }
  }

  // Generate general study response / concept explanation
  static async generateExplanation(
    prompt: string,
    context: { subjects: Subject[]; exams: Exam[]; tasks: Task[]; notes: Note[] }
  ): Promise<string> {
    const config = this.getConfig();
    const systemPrompt = this.buildAcademicContext(context.subjects, context.exams, context.tasks, context.notes);

    if (this.isConfigured()) {
      return this.callLLM(
        systemPrompt,
        `Explain the following topic clearly and directly for a student:\n\n${prompt}\n\nBreak it down into: 1. Core Intuition, 2. Key Mechanics & Principles, 3. Common Pitfalls or Exam Tips. Be concise and high-yield.`,
        config
      );
    } else {
      // Offline fallback heuristic
      await new Promise(r => setTimeout(r, 400));
      return `### 🧠 Conceptual Breakdown: ${prompt}

*(Note: Connect your free Google Gemini API Key in the top-right banner for live dynamic cloud generation!)*

#### 1. Core Intuition & Mental Model
To master **${prompt}**, think of it through fundamental building blocks. In complex systems, break down state variables, invariants, and edge cases. 

#### 2. Key Mechanics & Principles
- **State Transition / Dynamics**: Understand how inputs are mapped to outputs with minimal overhead.
- **Complexity Analysis**: Look for optimal substructure and redundant operations that can be cached.

#### 3. Common Exam Pitfalls
- Overlooking base cases or boundary bounds (e.g. empty inputs, zero division, off-by-one indices).
- Confusing worst-case time complexity with average-case performance.`;
    }
  }

  // Generate Interactive Practice Quiz
  static async generateQuiz(
    topic: string,
    context: { subjects: Subject[]; exams: Exam[]; tasks: Task[]; notes: Note[] }
  ): Promise<{
    text: string;
    quizData: { question: string; options: string[]; correctIndex: number; explanation: string }[];
  }> {
    const config = this.getConfig();
    const systemPrompt = this.buildAcademicContext(context.subjects, context.exams, context.tasks, context.notes);

    if (this.isConfigured()) {
      const prompt = `Generate 2 quick, exam-caliber multiple choice practice questions on: "${topic}".
Respond with ONLY valid JSON in this exact schema (no markdown wrap or extra commentary):
{
  "summary": "Brief encouraging introduction",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Concise explanation of the correct choice"
    }
  ]
}`;

      try {
        const raw = await this.callLLM(systemPrompt, prompt, config);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            return {
              text: parsed.summary || `Here is a practice quiz on **${topic}** to test your exam readiness:`,
              quizData: parsed.questions,
            };
          }
        }
      } catch (e) {
        console.warn('Failed to parse quiz JSON from LLM, falling back', e);
      }
    }

    // Default high-yield practice quiz
    await new Promise(r => setTimeout(r, 400));
    return {
      text: `Here is a practice quiz on **${topic}** to test your knowledge:`,
      quizData: [
        {
          question: `In the study of ${topic}, what is the primary consideration when optimizing performance?`,
          options: [
            'Minimizing time complexity and memory overhead under peak load',
            'Maximizing redundant allocations across distributed nodes',
            'Disabling compiler optimizations to ensure deterministic trace ordering',
            'Restricting algorithm execution exclusively to single-threaded processors',
          ],
          correctIndex: 0,
          explanation: `Optimal systems and algorithms focus on minimizing asymptotic resource consumption (both time and space) while preserving correctness invariants.`,
        },
        {
          question: `Which fundamental principle guarantees correctness in iterative state transitions?`,
          options: [
            'Arbitrary branching heuristics without convergence proofs',
            'Loop invariants: properties that hold before, during, and after each iteration',
            'Heuristic execution timeout bounds',
            'Ignoring intermediate state verification',
          ],
          correctIndex: 1,
          explanation: `Loop invariants are mathematical invariants proven by induction: initialization, maintenance, and termination.`,
        },
      ],
    };
  }

  // Generate Flashcards
  static async generateFlashcards(
    topic: string,
    context: { subjects: Subject[]; exams: Exam[]; tasks: Task[]; notes: Note[] }
  ): Promise<{ cards: { front: string; back: string }[]; summary: string }> {
    const config = this.getConfig();
    const systemPrompt = this.buildAcademicContext(context.subjects, context.exams, context.tasks, context.notes);

    if (this.isConfigured()) {
      const prompt = `Generate 2 high-yield active-recall flashcards on: "${topic}".
Respond with ONLY valid JSON in this exact structure:
{
  "summary": "Summary of generated cards",
  "cards": [
    {
      "front": "Concise prompt or definition question",
      "back": "Key formula or concise explanation"
    }
  ]
}`;

      try {
        const raw = await this.callLLM(systemPrompt, prompt, config);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.cards && Array.isArray(parsed.cards)) {
            return {
              cards: parsed.cards,
              summary: parsed.summary || `Generated ${parsed.cards.length} new flashcards on ${topic}`,
            };
          }
        }
      } catch (e) {
        console.warn('Failed to parse flashcard JSON from LLM', e);
      }
    }

    // Default flashcard generation
    await new Promise(r => setTimeout(r, 400));
    return {
      cards: [
        {
          front: `What is the core definition and mathematical formulation of ${topic}?`,
          back: `It establishes the fundamental relationship governing system state, evaluated through rigorous definition and algorithmic analysis.`,
        },
        {
          front: `What is a common edge case or constraint when working with ${topic}?`,
          back: `Always check boundary conditions, null/empty states, and invariant conditions before state updates.`,
        },
      ],
      summary: `Generated 2 new active recall flashcards for ${topic}`,
    };
  }

  // Generate Revision Study Plan
  static async generateRevisionPlan(
    topic: string,
    context: { subjects: Subject[]; exams: Exam[]; tasks: Task[]; notes: Note[] }
  ): Promise<string> {
    const config = this.getConfig();
    const systemPrompt = this.buildAcademicContext(context.subjects, context.exams, context.tasks, context.notes);

    if (this.isConfigured()) {
      return this.callLLM(
        systemPrompt,
        `Generate a customized, day-by-day 7-day study revision plan for: "${topic}".
Include a clean markdown table with columns: Day, Focus Area, High-Yield Activity, Target Hours.
Keep it punchy, practical, and fast to read.`,
        config
      );
    } else {
      await new Promise(r => setTimeout(r, 400));
      return `### 📅 7-Day High-Yield Revision Plan for ${topic}

| Day | Focus Area | High-Yield Activity | Target Hours |
|---|---|---|---|
| **Day 1** | Fundamentals & State | Review core lecture slides & write concise definitions | 2.0 hrs |
| **Day 2** | Theorem Derivations | Work through primary proofs and mathematical formulas | 2.5 hrs |
| **Day 3** | Problem Sets | Solve medium-difficulty exercises without checking solutions | 3.0 hrs |
| **Day 4** | Edge Cases & Debugging | Practice past paper problems with counterexamples | 2.5 hrs |
| **Day 5** | Mock Exam Simulation | Complete a timed 90-minute practice exam under test conditions | 3.0 hrs |
| **Day 6** | Error Log & Active Recall | Review mistakes from Day 5 mock and flip flashcards | 2.0 hrs |
| **Day 7** | Final Review | Quick formula sheet revision and rest early before exam day! | 1.5 hrs |

💡 **Pro-Tip**: Use **Focus Mode** with 25-minute Pomodoro sprints and 5-minute ambient rain breaks to maximize memory retention.`;
    }
  }

  // Direct LLM invoker with v1 and v1beta dual routing
  private static async callLLM(systemPrompt: string, userPrompt: string, config: AIConfig): Promise<string> {
    if (config.provider === 'gemini') {
      const activeModel =
        config.model && !config.model.includes('1.5') && !config.model.includes('2.0') && !config.model.includes('2.5')
          ? config.model
          : 'gemini-3.8-flash';

      const candidates: { model: string; version: 'v1' | 'v1beta' }[] = [
        { model: activeModel, version: 'v1beta' },
        { model: 'gemini-3.8-flash', version: 'v1beta' },
        { model: 'gemini-3.7-flash', version: 'v1beta' },
        { model: 'gemma-4-31b-it', version: 'v1' },
      ];

      // Remove duplicates
      const uniqueCandidates = candidates.filter(
        (c, idx, arr) => arr.findIndex(x => x.model === c.model && x.version === c.version) === idx
      );

      let lastError = '';

      for (const candidate of uniqueCandidates) {
        const url = `https://generativelanguage.googleapis.com/${candidate.version}/models/${candidate.model}:generateContent?key=${config.apiKey.trim()}`;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${systemPrompt}\n\n[STUDENT QUERY]\n${userPrompt}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 500, // Ultra-fast generation
              },
            }),
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              if (candidate.model !== config.model || candidate.version !== config.apiVersion) {
                config.model = candidate.model;
                config.apiVersion = candidate.version;
                this.saveConfig(config);
              }
              return this.cleanText(text);
            }
          } else {
            const err = await res.json().catch(() => ({}));
            lastError = err?.error?.message || `Gemini API error (HTTP ${res.status})`;
            if (res.status !== 404 && !lastError.includes('not found') && !lastError.includes('not supported') && !lastError.includes('no longer available')) {
              throw new Error(lastError);
            }
          }
        } catch (fetchErr) {
          if ((fetchErr as Error).name === 'AbortError') {
            lastError = 'Request timed out after 8 seconds';
          } else if ((fetchErr as Error).message && !(fetchErr as Error).message.includes('not found')) {
            throw fetchErr;
          }
        }
      }

      throw new Error(lastError || 'Could not complete request with Gemini.');
    } else {
      // OpenAI or Custom base URL
      const baseUrl = config.customBaseUrl?.trim() || 'https://api.openai.com/v1';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.4,
          max_tokens: 800,
        }),
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `AI API error (HTTP ${res.status})`);
      }

      const data = await res.json();
      return this.cleanText(data?.choices?.[0]?.message?.content || 'No response returned from model.');
    }
  }
}
