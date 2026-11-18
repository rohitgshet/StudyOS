import React, { useState } from 'react';
import { useStudyData } from '../../context/StudyDataContext';
import { AIConversationMessage } from '../../types';
import { Button } from '../common/Button';
import { FlashcardDeck } from './FlashcardDeck';
import { AIConfigModal } from './AIConfigModal';
import { AIService, AIConfig } from '../../lib/ai';
import { MarkdownView } from '../common/MarkdownView';
import { useToast } from '../common/Toast';
import {
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle2,
  BookOpen,
  Calendar,
  Layers,
  Bot,
  User,
  RotateCcw,
  Key,
  ExternalLink,
  Settings,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AIAssistantView: React.FC = () => {
  const { subjects, notes, exams, tasks, flashcards, addFlashcard } = useStudyData();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'chat' | 'flashcards'>('chat');
  const [mode, setMode] = useState<'explain' | 'quiz' | 'flashcards' | 'plan'>('explain');
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => AIService.getConfig());

  // Selected quiz answers state { [quizIndex]: selectedOptionIndex }
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const [messages, setMessages] = useState<AIConversationMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello! I am your **StudyOS Academic AI Assistant**. 🎓

I am connected to your enrolled subjects, active notes, and upcoming examinations.

Here is what I can do for you:
- **💡 Concept Explanation**: Break down complex theories, algorithms, and formulas with intuitive analogies and exam traps.
- **📝 Practice Quizzes**: Generate exam-style multiple-choice questions with full pedagogical explanations.
- **🎴 Smart Flashcards**: Generate active-recall flashcard pairs and save them straight to your deck.
- **📅 Revision Plans**: Formulate day-by-day exam preparation schedules tailored to your deadlines.

You can connect real Google Gemini or OpenAI models using the **Connect Live AI** badge above!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const isConfigured = AIService.isConfigured();

  // Dynamic contextual prompt presets derived from actual student data
  const dynamicPresets = [
    ...(subjects.length > 0
      ? [
          {
            label: `Explain ${subjects[0].code} Core Topic`,
            mode: 'explain' as const,
            query: `Explain the fundamental concept of ${subjects[0].name} with an intuitive real-world analogy.`,
          },
          {
            label: `Quiz me on ${subjects[0].code}`,
            mode: 'quiz' as const,
            query: `Generate a challenging exam-level quiz on ${subjects[0].name}.`,
          },
        ]
      : []),
    ...(exams.length > 0
      ? [
          {
            label: `Revision Plan for ${exams[0].title}`,
            mode: 'plan' as const,
            query: `Create an intensive 7-day revision roadmap for my upcoming ${exams[0].title} on ${exams[0].date}.`,
          },
        ]
      : [
          {
            label: '7-Day High-Yield Revision Plan',
            mode: 'plan' as const,
            query: 'Create a 7-day exam revision roadmap for high retention.',
          },
        ]),
    {
      label: 'Flashcards: High-Yield Definitions',
      mode: 'flashcards' as const,
      query: subjects[1]
        ? `Generate 3 active-recall flashcards for ${subjects[1].name}.`
        : 'Generate 3 active-recall flashcards on Time Complexity and Master Theorem.',
    },
  ];

  const handleSend = async (overrideQuery?: string, overrideMode?: typeof mode) => {
    const query = overrideQuery || inputQuery;
    const currentMode = overrideMode || mode;
    if (!query.trim() || isGenerating) return;

    const userMsg: AIConversationMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsGenerating(true);

    const contextPayload = { subjects, exams, tasks, notes };

    try {
      let assistantMsg: AIConversationMessage;

      if (currentMode === 'quiz') {
        const result = await AIService.generateQuiz(query, contextPayload);
        assistantMsg = {
          id: 'msg_' + (Date.now() + 1),
          role: 'assistant',
          type: 'quiz',
          content: result.text,
          quizData: result.quizData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else if (currentMode === 'flashcards') {
        const result = await AIService.generateFlashcards(query, contextPayload);
        
        // Add the generated flashcards directly to user deck
        result.cards.forEach(card => {
          addFlashcard({
            front: card.front,
            back: card.back,
            mastery: 'good',
          });
        });

        assistantMsg = {
          id: 'msg_' + (Date.now() + 1),
          role: 'assistant',
          type: 'flashcards',
          content: `✅ Generated **${result.cards.length} new flashcards** on **${query}** and added them to your active Spaced Repetition Deck!\n\n${result.cards
            .map((c, i) => `${i + 1}. **${c.front}**`)
            .join('\n')}\n\n*${result.summary}*\n\nReview them right now in the **Flashcard Deck** tab above.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        try {
          confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
        } catch {}
      } else if (currentMode === 'plan') {
        const planText = await AIService.generateRevisionPlan(query, contextPayload);
        assistantMsg = {
          id: 'msg_' + (Date.now() + 1),
          role: 'assistant',
          type: 'plan',
          content: planText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else {
        const explanationText = await AIService.generateExplanation(query, contextPayload);
        assistantMsg = {
          id: 'msg_' + (Date.now() + 1),
          role: 'assistant',
          type: 'explanation',
          content: explanationText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errMsg = (err as Error).message || 'Failed to communicate with AI provider.';
      toast.error('AI Error: ' + errMsg);
      
      const errorMsg: AIConversationMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        type: 'explanation',
        content: `⚠️ **AI Service Connection Error**\n\n${errMsg}\n\nPlease click **Configure AI** above to check your API key, ensure quota is active, or test your connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectQuizOption = (quizIndex: number, optionIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [quizIndex]: optionIndex }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F472B6]" />
              AI Study Assistant
            </h1>

            {/* Apple AI Connection Pill */}
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all backdrop-blur-md border ${
                isConfigured
                  ? 'bg-[#10B981]/12 text-[#059669] dark:text-[#34D399] border-[#10B981]/25 hover:bg-[#10B981]/20'
                  : 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#38BDF8] border-[#0071E3]/20 hover:bg-[#0071E3]/15'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-[#10B981] animate-pulse' : 'bg-[#0071E3]'}`} />
              <span>
                {isConfigured
                  ? `Live: ${aiConfig.provider === 'gemini' ? 'Google Gemini' : aiConfig.provider === 'openai' ? 'OpenAI' : 'Custom LLM'}`
                  : 'Connect Live AI'}
              </span>
              <Settings className="w-3 h-3 ml-0.5 opacity-70" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Intelligent academic mentor for explanations, practice quizzes, and spaced-repetition flashcards.
          </p>
        </div>

        {/* Tab Toggle: Chat vs Flashcard Deck (Apple Capsule) */}
        <div className="flex items-center bg-white/60 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] p-1 rounded-full self-start sm:self-auto backdrop-blur-md shadow-2xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
              activeTab === 'chat'
                ? 'bg-[#0071E3] text-white font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Assistant Chat
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'flashcards'
                ? 'bg-[#0071E3] text-white font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Flashcard Deck ({flashcards.length})
          </button>
        </div>
      </div>

      {activeTab === 'flashcards' ? (
        <div className="py-6">
          <FlashcardDeck cards={flashcards} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Stream (8 Cols) */}
          <div className="lg:col-span-8 apple-glass-card rounded-3xl flex flex-col h-[670px] shadow-apple-glass dark:shadow-apple-glass-dark overflow-hidden">
            {/* Mode Selector Header */}
            <div className="p-3.5 border-b border-black/[0.05] dark:border-white/[0.08] bg-black/[0.015] dark:bg-white/[0.02] flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                Mode:
              </span>
              <button
                onClick={() => setMode('explain')}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  mode === 'explain'
                    ? 'bg-[#0071E3] text-white shadow-2xs font-semibold'
                    : 'bg-white/60 dark:bg-white/[0.05] border border-black/[0.06] text-muted-foreground hover:text-foreground'
                }`}
              >
                💡 Explain Concept
              </button>
              <button
                onClick={() => setMode('quiz')}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  mode === 'quiz'
                    ? 'bg-[#10B981] text-white shadow-2xs font-semibold'
                    : 'bg-white/60 dark:bg-white/[0.05] border border-black/[0.06] text-muted-foreground hover:text-foreground'
                }`}
              >
                📝 Practice Quiz
              </button>
              <button
                onClick={() => setMode('flashcards')}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  mode === 'flashcards'
                    ? 'bg-[#F472B6] text-white shadow-2xs font-semibold'
                    : 'bg-white/60 dark:bg-white/[0.05] border border-black/[0.06] text-muted-foreground hover:text-foreground'
                }`}
              >
                🎴 Flashcard Maker
              </button>
              <button
                onClick={() => setMode('plan')}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                  mode === 'plan'
                    ? 'bg-[#38BDF8] text-white shadow-2xs font-semibold'
                    : 'bg-white/60 dark:bg-white/[0.05] border border-black/[0.06] text-muted-foreground hover:text-foreground'
                }`}
              >
                📅 Study Plan
              </button>
            </div>

            {/* Live AI Banner if not yet configured */}
            {!isConfigured && (
              <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-[#0071E3]/12 via-[#F472B6]/12 to-[#38BDF8]/10 border border-[#0071E3]/20 rounded-2xl flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-[#0071E3] shrink-0" />
                  <span className="text-foreground text-[11px] truncate">
                    <strong>Connect Live AI:</strong> Plug in your free Google Gemini key or OpenAI key for live dynamic answers.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#0071E3] dark:text-[#38BDF8] hover:underline font-medium px-2 py-1"
                  >
                    <span>Free Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="px-3 py-1 bg-[#0071E3] text-white rounded-xl text-xs font-semibold hover:bg-[#005BB6] shadow-2xs"
                  >
                    Connect
                  </button>
                </div>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0071E3] to-[#F472B6] p-[1px] shrink-0 mt-0.5 shadow-2xs">
                      <div className="w-full h-full bg-white dark:bg-[#1C1917] rounded-full flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-3xl p-5 text-xs leading-relaxed space-y-2.5 ${
                      msg.role === 'user'
                        ? 'bg-[#0071E3] text-white font-medium shadow-sm'
                        : 'apple-glass text-foreground border border-black/[0.06] dark:border-white/[0.08]'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap font-sans text-white">{msg.content}</div>
                    ) : (
                      <MarkdownView content={msg.content} />
                    )}

                    {/* Interactive Quiz Component if present */}
                    {msg.quizData && (
                      <div className="space-y-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                        {msg.quizData.map((q, qIdx) => {
                          const userSelected = quizAnswers[qIdx];
                          const hasAnswered = userSelected !== undefined;

                          return (
                            <div key={qIdx} className="bg-white/60 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] p-4 rounded-2xl space-y-2.5 backdrop-blur-md">
                              <p className="font-semibold text-foreground">
                                Q{qIdx + 1}: {q.question}
                              </p>

                              <div className="space-y-2">
                                {q.options.map((opt, optIdx) => {
                                  let optionStyle = 'border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] hover:bg-white text-foreground';

                                  if (hasAnswered) {
                                    if (optIdx === q.correctIndex) {
                                      optionStyle = 'border-[#10B981] bg-[#10B981]/15 text-[#059669] dark:text-[#34D399] font-semibold';
                                    } else if (optIdx === userSelected) {
                                      optionStyle = 'border-[#FB7185] bg-[#FB7185]/15 text-[#E11D48] dark:text-[#FDA4AF]';
                                    }
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                                      disabled={hasAnswered}
                                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-colors flex items-center justify-between ${optionStyle}`}
                                    >
                                      <span>{opt}</span>
                                      {hasAnswered && optIdx === q.correctIndex && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {hasAnswered && (
                                <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] text-[11px] text-muted-foreground border border-black/[0.04]">
                                  <span className="font-semibold text-foreground block mb-0.5">Pedagogical Explanation:</span>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="text-[10px] text-muted-foreground/60 text-right font-mono">
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-[#0071E3]/20 border border-[#0071E3]/30 flex items-center justify-center text-[#0071E3] shrink-0 mt-0.5 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0071E3] to-[#F472B6] p-[1px] shrink-0 animate-spin">
                    <div className="w-full h-full bg-white dark:bg-[#1C1917] rounded-full flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                    </div>
                  </div>
                  <div className="p-3.5 apple-glass rounded-2xl border border-black/[0.06] dark:border-white/[0.08] text-xs text-muted-foreground flex items-center gap-2">
                    <span className="animate-pulse">
                      {isConfigured ? `Querying ${aiConfig.model} with course context...` : 'Analyzing concepts & syllabus...'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3.5 border-t border-black/[0.05] dark:border-white/[0.08] apple-glass flex gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                placeholder={
                  mode === 'explain'
                    ? 'Ask to explain any concept, formula, or algorithm...'
                    : mode === 'quiz'
                    ? 'Enter topic for quiz (e.g. Graph Algorithms)...'
                    : mode === 'flashcards'
                    ? 'Topic to turn into flashcards...'
                    : 'Exam or subject for revision plan...'
                }
                className="flex-1 bg-white/70 dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] text-xs text-foreground rounded-2xl px-4 py-2.5 outline-none focus:border-[#0071E3] placeholder:text-muted-foreground/50 backdrop-blur-md"
              />
              <Button
                type="submit"
                size="sm"
                icon={<Send className="w-3.5 h-3.5" />}
                disabled={isGenerating}
                className="bg-[#0071E3] hover:bg-[#005BB6] text-white rounded-2xl"
              >
                Ask
              </Button>
            </form>
          </div>

          {/* Right Presets Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Context-Aware Prompts */}
            <div className="apple-glass-card rounded-3xl p-6 shadow-apple-glass dark:shadow-apple-glass-dark space-y-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
                  Context-Aware Prompts
                </span>
                <span className="text-[10px] text-[#0071E3] dark:text-[#38BDF8] font-normal">Active Courses</span>
              </h3>

              <div className="space-y-2">
                {dynamicPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMode(preset.mode);
                      handleSend(preset.query, preset.mode);
                    }}
                    className="w-full text-left p-3 rounded-2xl border border-black/[0.05] dark:border-white/[0.06] bg-white/40 dark:bg-white/[0.03] hover:bg-white/80 dark:hover:bg-white/[0.06] hover:border-[#0071E3]/40 text-xs transition-colors group"
                  >
                    <span className="font-semibold text-foreground group-hover:text-[#0071E3] transition-colors block">
                      {preset.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                      {preset.query}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Academic Context Badge */}
            <div className="apple-glass rounded-3xl p-5 space-y-2 text-xs text-muted-foreground border border-black/[0.05] dark:border-white/[0.08]">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B]" />
                Enrolled Academic Context:
              </span>
              <p className="text-[11px] leading-relaxed">
                Connected to your {subjects.length} subjects ({subjects.map(s => s.code).join(', ')}), {exams.length} scheduled exams, and your notes library.
              </p>
            </div>

            {/* Live Model Config Card */}
            <div className="apple-glass-card rounded-3xl p-5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#0071E3]" />
                  Active Model Engine
                </span>
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="text-[11px] text-[#0071E3] dark:text-[#38BDF8] hover:underline font-medium"
                >
                  Configure
                </button>
              </div>

              <div className="p-3 bg-white/50 dark:bg-white/[0.03] rounded-2xl border border-black/[0.05] dark:border-white/[0.08] text-xs space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Provider:</span>
                  <span className="font-semibold text-foreground capitalize">{aiConfig.provider}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Model:</span>
                  <span className="font-mono text-[11px] text-foreground">{aiConfig.model}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Status:</span>
                  <span className={`font-semibold ${isConfigured ? 'text-[#10B981]' : 'text-amber-500'}`}>
                    {isConfigured ? 'Live Connected' : 'Default Heuristic'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Key Configuration Modal */}
      <AIConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSaved={newConfig => setAiConfig(newConfig)}
      />
    </div>
  );
};
