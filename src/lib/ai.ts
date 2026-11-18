// StudyOS Live AI Engine (Google Gemini, OpenAI, OpenRouter, Groq, Ollama)
import { Subject, Exam, Task, Note } from '../types';

export type AIProvider = 'gemini' | 'openai' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customBaseUrl?: string;
}

const AI_CONFIG_KEY = 'studyos_ai_config';

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-2.0-flash',
};

export class AIService {
  static getConfig(): AIConfig {
    try {
      const stored = localStorage.getItem(AI_CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_AI_CONFIG, ...JSON.parse(stored) };
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

  // Fetch all models supported by this specific Gemini API Key
  static async fetchAvailableGeminiModels(apiKey: string): Promise<string[]> {
    if (!apiKey || apiKey.trim().length < 5) {
      return ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    }

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          const supported = data.models
            .filter((m: { supportedGenerationMethods?: string[] }) =>
              m.supportedGenerationMethods?.includes('generateContent')
            )
            .map((m: { name: string }) => m.name.replace(/^models\//, ''));
          
          if (supported.length > 0) {
            return supported;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to query Gemini ListModels', e);
    }

    return ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  }

  // Construct academic context awareness prompt
  static buildAcademicContext(
    subjects: Subject[],
    exams: Exam[],
    tasks: Task[],
    notes: Note[]
  ): string {
    const subjectList = subjects.map(s => `${s.code}: ${s.name} (Faculty: ${s.faculty || 'N/A'}, Room: ${s.room || 'N/A'})`).join('\n');
    const examList = exams.map(e => `${e.title} on ${e.date} (Weightage: ${e.weightagePercent || 20}%)`).join('\n');
    const taskList = tasks.filter(t => t.status !== 'completed').slice(0, 5).map(t => `- ${t.title} (Due: ${t.dueDate}, Priority: ${t.priority})`).join('\n');
    const noteTitles = notes.slice(0, 6).map(n => `- ${n.title}`).join('\n');

    return `You are StudyOS AI, a world-class academic tutor and personal university mentor designed for high-performing students.
The student is currently enrolled in:
${subjectList || 'Standard undergraduate curriculum'}

Their upcoming exams:
${examList || 'None scheduled'}

Their top pending assignments:
${taskList || 'No open tasks'}

Their recent lecture notes:
${noteTitles || 'None'}

Guidelines:
- Give rigorous, pedagogically sound, crystal-clear answers.
- Use markdown formatting with clear headings, bullet points, and code blocks where applicable.
- For math formulas, use standard notation (e.g. $E=mc^2$ or $$A = U \\Sigma V^T$$).
- Be concise yet thorough, encouraging, and academically precise.`;
  }

  // Live test connection with auto-detection of working model
  static async testConnection(config: AIConfig): Promise<{ success: boolean; message: string; updatedModel?: string }> {
    if (!config.apiKey.trim()) {
      return { success: false, message: 'Please provide an API key.' };
    }

    try {
      if (config.provider === 'gemini') {
        const candidateModels = Array.from(
          new Set([
            config.model || 'gemini-2.0-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash-latest',
            'gemini-2.0-flash-exp',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
          ])
        );

        let lastErr = '';
        for (const candidate of candidateModels) {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${config.apiKey.trim()}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: 'Hello, confirm you are working in 5 words.' }] }],
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            // If the working model is different from what was configured, update it automatically
            if (candidate !== config.model) {
              config.model = candidate;
              this.saveConfig(config);
            }

            return {
              success: true,
              message: `Connected to Google Gemini! Model: ${candidate} ("${text?.trim() || 'Ready'}")`,
              updatedModel: candidate,
            };
          } else {
            const errData = await res.json().catch(() => ({}));
            lastErr = errData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          }
        }

        // If candidate list failed, try querying ListModels directly
        const dynamicModels = await this.fetchAvailableGeminiModels(config.apiKey);
        for (const dynModel of dynamicModels) {
          if (candidateModels.includes(dynModel)) continue;
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${dynModel}:generateContent?key=${config.apiKey.trim()}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
            }),
          });

          if (res.ok) {
            config.model = dynModel;
            this.saveConfig(config);
            return {
              success: true,
              message: `Connected to Google Gemini! Auto-selected model: ${dynModel}`,
              updatedModel: dynModel,
            };
          }
        }

        throw new Error(lastErr || 'Could not find a supported Gemini model for this API key.');
      } else {
        // OpenAI or Custom
        const baseUrl = config.customBaseUrl?.trim() || 'https://api.openai.com/v1';
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: config.model || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
            max_tokens: 30,
          }),
        });

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
      return this.callLLM(systemPrompt, `Please provide a thorough, structured academic explanation of the following topic:\n\n${prompt}\n\nInclude: 1. Core Intuition / Mental Model, 2. Key Mechanics & Formal Concepts, 3. Common Exam Traps or Misconceptions.`, config);
    } else {
      // Offline fallback heuristic
      await new Promise(r => setTimeout(r, 600));
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
      const prompt = `Generate 2 high-yield, exam-caliber multiple choice practice questions on: "${topic}".
You MUST respond with VALID JSON in this EXACT structure (do not wrap in anything else except raw JSON or markdown code block):
{
  "summary": "Brief encouraging introduction about this quiz",
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed pedagogical explanation of why this answer is correct and why other options are wrong."
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
    await new Promise(r => setTimeout(r, 600));
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
      const prompt = `Generate 2-3 high-yield active-recall flashcards for spaced repetition on: "${topic}".
You MUST respond with VALID JSON in this EXACT structure:
{
  "summary": "Summary of generated cards",
  "cards": [
    {
      "front": "Clear, concise prompt or question",
      "back": "High-yield concise answer or formula with key definition"
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
    await new Promise(r => setTimeout(r, 600));
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
Include a markdown table with columns: Day, Focus Area, High-Yield Activity, Target Hours.
Also include 2-3 actionable pro-tips tailored to their upcoming exams and assignments.`,
        config
      );
    } else {
      await new Promise(r => setTimeout(r, 600));
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

  // Direct LLM invoker with resilient auto-fallback for Gemini models
  private static async callLLM(systemPrompt: string, userPrompt: string, config: AIConfig): Promise<string> {
    if (config.provider === 'gemini') {
      const candidateModels = Array.from(
        new Set([
          config.model || 'gemini-2.0-flash',
          'gemini-2.0-flash',
          'gemini-1.5-flash-latest',
          'gemini-2.0-flash-exp',
          'gemini-1.5-pro',
          'gemini-1.5-flash',
        ])
      );

      let lastError = '';

      for (const modelCandidate of candidateModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelCandidate}:generateContent?key=${config.apiKey.trim()}`;

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              contents: [
                {
                  role: 'user',
                  parts: [{ text: userPrompt }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              // If we succeeded with a fallback model, persist it so future requests are instant
              if (modelCandidate !== config.model) {
                config.model = modelCandidate;
                this.saveConfig(config);
              }
              return text;
            }
          } else {
            const err = await res.json().catch(() => ({}));
            lastError = err?.error?.message || `Gemini API error (HTTP ${res.status})`;
            // If the error is not a 404 (e.g. invalid key or quota exhausted), break and throw
            if (res.status !== 404 && !lastError.includes('not found') && !lastError.includes('not supported')) {
              throw new Error(lastError);
            }
          }
        } catch (fetchErr) {
          if ((fetchErr as Error).message && !(fetchErr as Error).message.includes('not found')) {
            throw fetchErr;
          }
        }
      }

      // If static candidates failed, query ListModels dynamically
      try {
        const dynamicModels = await this.fetchAvailableGeminiModels(config.apiKey);
        for (const dynModel of dynamicModels) {
          if (candidateModels.includes(dynModel)) continue;
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${dynModel}:generateContent?key=${config.apiKey.trim()}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              config.model = dynModel;
              this.saveConfig(config);
              return text;
            }
          }
        }
      } catch {}

      throw new Error(lastError || 'Could not find an active Gemini model supporting generateContent for this API key.');
    } else {
      // OpenAI or Custom base URL
      const baseUrl = config.customBaseUrl?.trim() || 'https://api.openai.com/v1';
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `AI API error (HTTP ${res.status})`);
      }

      const data = await res.json();
      return data?.choices?.[0]?.message?.content || 'No response returned from model.';
    }
  }
}
