'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { QUESTIONS, SECTIONS, TOTAL_QUESTIONS } from '@/lib/questions';
import type { Evaluation, ChatMessage } from '@/types';

const emptyEvals: Evaluation[] = [];

export default function Home() {
  const currentQ = useStore((s) => s.currentQ);
  const answers = useStore((s) => s.answers);
  const mastered = useStore((s) => s.mastered);
  const isLoading = useStore((s) => s.isLoading);
  const getProgress = useStore((s) => s.getProgress);
  const setAnswer = useStore((s) => s.setAnswer);
  const setCurrentQ = useStore((s) => s.setCurrentQ);
  const addEvaluation = useStore((s) => s.addEvaluation);
  const setMastered = useStore((s) => s.setMastered);
  const nextQuestion = useStore((s) => s.nextQuestion);
  const setLoading = useStore((s) => s.setLoading);
  const resetAll = useStore((s) => s.resetAll);

  const [showSidebar, setShowSidebar] = useState(false);
  const progress = getProgress();
  const question = QUESTIONS.find((q) => q.id === currentQ)!;
  const section = SECTIONS.find((s) => s.id === question.sectionId)!;
  const answer = answers[currentQ] ?? '';
  const evals = useStore((s) => s.evaluations[currentQ]) ?? emptyEvals;
  const isMastered = mastered[currentQ] ?? false;

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-[var(--border)] px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-bold">微观经济学 · 瑞幸 vs 星巴克</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-[var(--text-light)]">{progress}%</span>
          </div>
          <span className="text-xs text-[var(--text-light)]">{Object.values(mastered).filter(Boolean).length}/{TOTAL_QUESTIONS}</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`${showSidebar ? 'block' : 'hidden'} lg:block w-64 border-r border-[var(--border)] bg-white overflow-y-auto shrink-0`}>
          <nav className="p-4 space-y-4">
            {SECTIONS.map((sec) => {
              const secQs = QUESTIONS.filter((q) => q.sectionId === sec.id);
              return (
                <div key={sec.id}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-light)] mb-1">{sec.title}</div>
                  <div className="text-xs text-[var(--text-light)] mb-2">{sec.subtitle}</div>
                  <div className="space-y-0.5">
                    {secQs.map((q) => {
                      const done = mastered[q.id];
                      const active = q.id === currentQ;
                      return (
                        <button
                          key={q.id}
                          onClick={() => { setCurrentQ(q.id); setShowSidebar(false); }}
                          className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors ${
                            active ? 'bg-[var(--accent-light)] text-[var(--accent)] font-semibold' :
                            done ? 'text-[var(--success)]' : 'text-[var(--text-light)] hover:bg-gray-100'
                          }`}
                        >
                          {done ? '✓ ' : ''}{q.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Section tag */}
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
              {section.title} · {section.subtitle}
            </div>

            {/* Question */}
            <h2 className="text-xl font-bold mb-4">{question.title}</h2>
            <div className="question-body text-sm leading-relaxed text-[var(--text)] mb-4 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: question.body.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
            <div className="flex flex-wrap gap-1.5 mb-6">
              {question.keywords.map((kw) => (
                <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)]">{kw}</span>
              ))}
            </div>

            {/* Answer area */}
            {isMastered ? (
              <div className="border border-[var(--success)] bg-green-50 rounded-lg p-4">
                <div className="text-xs font-bold text-[var(--success)] mb-2">已掌握 ✓</div>
                <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{answer}</p>
              </div>
            ) : (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(currentQ, e.target.value)}
                  placeholder="写下你的回答..."
                  className="w-full h-40 text-sm p-4 border border-[var(--border)] rounded-lg resize-none bg-white"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={async () => {
                      if (!answer.trim() || isLoading) return;
                      setLoading(true);
                      try {
                        const res = await fetch('/api/ai', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            mode: 'evaluate',
                            messages: [
                              { role: 'user', content: `## 题目：${question.title}\n${question.body}\n\n## 核心概念：${question.keywords.join('、')}\n\n## 学生回答：\n${answer}` },
                            ],
                          }),
                        });
                        const data = await res.json();
                        addEvaluation(currentQ, {
                          id: `e-${Date.now()}`,
                          questionId: currentQ,
                          score: 0,
                          feedback: data.response,
                          timestamp: new Date().toISOString(),
                        });
                      } catch {
                        addEvaluation(currentQ, {
                          id: `e-err-${Date.now()}`,
                          questionId: currentQ,
                          score: 0,
                          feedback: '⚠ 评估暂时不可用，请稍后重试。',
                          timestamp: new Date().toISOString(),
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={!answer.trim() || isLoading}
                    className="px-5 py-2 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isLoading ? '评估中...' : '提交评估'}
                  </button>
                </div>
              </>
            )}

            {/* Evaluations */}
            {evals.length > 0 && (
              <div className="mt-6 space-y-3">
                {evals.map((ev) => (
                  <EvaluationCard key={ev.id} evaluation={ev} />
                ))}
              </div>
            )}

            {/* Chat */}
            {!isMastered && evals.length > 0 && <ChatPanel questionId={currentQ} />}

            {/* Next / Master button */}
            {!isMastered && evals.length > 0 && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setMastered(currentQ)}
                  className="px-5 py-2 bg-[var(--success)] text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  我搞懂了，下一题
                </button>
              </div>
            )}
            {isMastered && currentQ < TOTAL_QUESTIONS && (
              <button
                onClick={() => nextQuestion()}
                className="mt-4 px-5 py-2 bg-[var(--accent)] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                下一题 →
              </button>
            )}
            {isMastered && currentQ === TOTAL_QUESTIONS && (
              <div className="mt-6 p-6 bg-[var(--accent-light)] rounded-lg text-center">
                <p className="text-lg font-bold text-[var(--accent)]">恭喜！你已完成所有题目 🎉</p>
                <p className="text-sm text-[var(--text-light)] mt-1">你已掌握微观经济学的核心概念</p>
                <button onClick={() => resetAll()} className="mt-3 text-xs text-[var(--text-light)] underline">重新开始</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function EvaluationCard({ evaluation: ev }: { evaluation: Evaluation }) {
  return (
    <div className="border border-[var(--border)] bg-white rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">AI 评估</span>
        <span className="text-[10px] text-[var(--text-light)]">{new Date(ev.timestamp).toLocaleTimeString('zh-CN')}</span>
      </div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">{ev.feedback}</div>
    </div>
  );
}

const emptyChatMessages: ChatMessage[] = [];

function ChatPanel({ questionId }: { questionId: number }) {
  const messages = useStore((s) => s.chatMessages[questionId]) ?? emptyChatMessages;
  const isLoading = useStore((s) => s.isLoading);
  const addChatMessage = useStore((s) => s.addChatMessage);
  const removeChatMessage = useStore((s) => s.removeChatMessage);
  const setLoading = useStore((s) => s.setLoading);
  const answers = useStore((s) => s.answers);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, questionId, role: 'user', content: text, timestamp: new Date().toISOString() };
    addChatMessage(questionId, userMsg);
    setInput('');
    setLoading(true);
    try {
      const q = QUESTIONS.find((q) => q.id === questionId)!;
      const history = [...messages, userMsg].map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          messages: [{ role: 'user', content: `当前题目上下文：${q.title}\n关键词：${q.keywords.join('、')}\n我的回答：${answers[questionId] ?? ''}\n\n${history.map((m) => `${m.role === 'user' ? '学生' : '导师'}：${m.content}`).join('\n')}` }],
        }),
      });
      const data = await res.json();
      addChatMessage(questionId, { id: `a-${Date.now()}`, questionId, role: 'assistant', content: data.response, timestamp: new Date().toISOString() });
    } catch {
      addChatMessage(questionId, { id: `a-err-${Date.now()}`, questionId, role: 'assistant', content: '⚠ 对话暂时不可用', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="mt-6 border border-[var(--border)] bg-white rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b border-[var(--border)] bg-gray-50">
        <span className="text-xs font-bold text-[var(--text-light)]">与 AI 导师对话</span>
      </div>
      <div ref={scrollRef} className="max-h-64 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && <p className="text-xs text-[var(--text-light)] text-center py-2">有问题？和 AI 导师讨论</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
            <div className={`max-w-[80%] px-3 py-1.5 rounded-lg text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[var(--accent-light)] text-[var(--text)]' : 'bg-gray-100 text-[var(--text)]'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            <button onClick={() => removeChatMessage(questionId, msg.id)} className="ml-1 self-center opacity-0 group-hover:opacity-100 text-[var(--text-light)] hover:text-red-400 transition-all">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        {isLoading && <div className="flex items-center gap-1.5"><div className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /><span className="text-[10px] text-[var(--text-light)]">思考中...</span></div>}
      </div>
      <div className="flex gap-2 px-4 py-2 border-t border-[var(--border)]">
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="继续提问..." className="flex-1 text-xs px-3 py-1.5 border border-[var(--border)] rounded-md" />
        <button onClick={handleSend} disabled={!input.trim() || isLoading} className="px-3 py-1.5 text-xs font-bold bg-[var(--accent)] text-white rounded-md hover:bg-blue-700 disabled:opacity-40">发送</button>
      </div>
    </div>
  );
}
