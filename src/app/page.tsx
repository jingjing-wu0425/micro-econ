'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { QUESTIONS, SECTIONS, TOTAL_QUESTIONS } from '@/lib/questions';
import type { Evaluation, ChatMessage } from '@/types';

const emptyEvals: Evaluation[] = [];
const emptyChatMessages: ChatMessage[] = [];

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
  const masteredCount = Object.values(mastered).filter(Boolean).length;

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between shrink-0" style={{ background: 'linear-gradient(90deg, #3d2e1f 0%, #5c4033 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden p-1 text-amber-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">☕</span>
            <h1 className="text-sm font-bold text-amber-100" style={{ fontFamily: 'Georgia, serif' }}>
              微观经济学 · 瑞幸 vs 星巴克
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: 'var(--gold)' }} />
            </div>
            <span className="text-[11px] text-amber-200/80">{masteredCount}/{TOTAL_QUESTIONS}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`${showSidebar ? 'block' : 'hidden'} lg:block w-72 overflow-y-auto shrink-0 border-r`} style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="p-5 space-y-5">
            {SECTIONS.map((sec) => {
              const secQs = QUESTIONS.filter((q) => q.sectionId === sec.id);
              return (
                <div key={sec.id}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--accent)' }}>{sec.title}</div>
                  <div className="text-xs mb-2" style={{ color: 'var(--text-light)' }}>{sec.subtitle}</div>
                  <div className="space-y-0.5">
                    {secQs.map((q) => {
                      const done = mastered[q.id];
                      const active = q.id === currentQ;
                      return (
                        <button
                          key={q.id}
                          onClick={() => { setCurrentQ(q.id); setShowSidebar(false); }}
                          className={`sidebar-link w-full text-left text-[11px] px-3 py-2 rounded-lg ${
                            active ? 'font-semibold' : ''
                          }`}
                          style={active ? { background: 'var(--accent-light)', color: 'var(--accent-dark)' } : done ? { color: 'var(--success)' } : { color: 'var(--text-light)' }}
                        >
                          {done ? '✓ ' : ''}{q.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-10">
            {/* Section label */}
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-block w-8 h-[2px] rounded" style={{ background: 'var(--accent)' }} />
              <span className="text-[11px] font-bold tracking-wider" style={{ color: 'var(--accent)' }}>{section.title} · {section.subtitle}</span>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: 'Georgia, serif', color: 'var(--text)' }}>{question.title}</h2>
            <div className="question-body text-[15px] leading-relaxed mb-4 whitespace-pre-wrap"
              style={{ color: 'var(--text)' }}
              dangerouslySetInnerHTML={{ __html: question.body.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
            <div className="flex flex-wrap gap-1.5 mb-8">
              {question.keywords.map((kw) => (
                <span key={kw} className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent-dark)' }}>{kw}</span>
              ))}
            </div>

            {/* Answer */}
            {isMastered ? (
              <div className="rounded-xl p-5" style={{ background: 'var(--success-light)', border: '1px solid var(--success)' }}>
                <div className="text-xs font-bold mb-2" style={{ color: 'var(--success)' }}>已掌握 ✓</div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{answer}</p>
              </div>
            ) : (
              <>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(currentQ, e.target.value)}
                  placeholder="写下你的思考..."
                  className="w-full h-44 text-sm p-4 rounded-xl resize-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', fontFamily: '-apple-system, sans-serif', lineHeight: '1.7' }}
                />
                <div className="mt-4">
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
                    className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--accent)' }}
                  >
                    {isLoading ? '思考中...' : '提交回答'}
                  </button>
                </div>
              </>
            )}

            {/* Evaluations */}
            {evals.length > 0 && (
              <div className="mt-8 space-y-4">
                {evals.map((ev) => (
                  <div key={ev.id} className="evaluation-card rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📖</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>导师点评</span>
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: '-apple-system, sans-serif' }}>{ev.feedback}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat */}
            {!isMastered && evals.length > 0 && <ChatPanel questionId={currentQ} />}

            {/* Action buttons */}
            {!isMastered && evals.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={() => setMastered(currentQ)}
                  className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all"
                  style={{ background: 'var(--success)' }}
                >
                  搞懂了，进入下一题
                </button>
              </div>
            )}
            {isMastered && currentQ < TOTAL_QUESTIONS && (
              <button
                onClick={() => nextQuestion()}
                className="mt-6 px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all"
                style={{ background: 'var(--accent)' }}
              >
                下一题 →
              </button>
            )}
            {isMastered && currentQ === TOTAL_QUESTIONS && (
              <div className="mt-8 p-8 rounded-2xl text-center" style={{ background: 'var(--accent-light)' }}>
                <p className="text-2xl mb-2">🎓</p>
                <p className="text-lg font-bold" style={{ color: 'var(--accent-dark)', fontFamily: 'Georgia, serif' }}>恭喜！你已完成所有题目</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>你已掌握微观经济学的核心概念</p>
                <button onClick={() => resetAll()} className="mt-4 text-xs underline" style={{ color: 'var(--text-light)' }}>重新开始</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function ChatPanel({ questionId }: { questionId: number }) {
  const messages = useStore((s) => s.chatMessages[questionId]) ?? emptyChatMessages;
  const isLoading = useStore((s) => s.isLoading);
  const addChatMessage = useStore((s) => s.addChatMessage);
  const removeChatMessage = useStore((s) => s.removeChatMessage);
  const setLoading = useStore((s) => s.setLoading);
  const answers = useStore((s) => s.answers);
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    if (!expanded) setExpanded(true);
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
          messages: [{ role: 'user', content: `当前题目：${q.title}\n关键词：${q.keywords.join('、')}\n我的回答：${answers[questionId] ?? ''}\n\n${history.map((m) => `${m.role === 'user' ? '学生' : '导师'}：${m.content}`).join('\n')}` }],
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
    <div className="mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-semibold transition-colors"
        style={{ color: 'var(--accent)' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {expanded ? '收起对话' : '和导师继续讨论'}
      </button>

      {expanded && (
        <div className="mt-3 rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div ref={scrollRef} className="max-h-64 overflow-y-auto px-4 py-3 space-y-2">
            {messages.length === 0 && <p className="text-xs text-center py-3" style={{ color: 'var(--text-light)' }}>有问题？和导师聊聊 ☕</p>}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed`} style={msg.role === 'user' ? { background: 'var(--accent-light)', color: 'var(--text)' } : { background: 'var(--bg)', color: 'var(--text)' }}>
                  <p className="whitespace-pre-wrap" style={{ fontFamily: '-apple-system, sans-serif' }}>{msg.content}</p>
                </div>
                <button onClick={() => removeChatMessage(questionId, msg.id)} className="ml-1 self-center opacity-0 group-hover:opacity-100 transition-all" style={{ color: 'var(--text-light)' }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {isLoading && <div className="flex items-center gap-2"><div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} /><span className="text-[10px]" style={{ color: 'var(--text-light)' }}>思考中...</span></div>}
          </div>
          <div className="flex gap-2 px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="继续提问..." className="flex-1 text-xs px-3 py-2 rounded-lg" style={{ border: '1px solid var(--border)', background: 'var(--bg)', fontFamily: '-apple-system, sans-serif' }} />
            <button onClick={handleSend} disabled={!input.trim() || isLoading} className="px-4 py-2 text-xs font-bold text-white rounded-lg disabled:opacity-40" style={{ background: 'var(--accent)' }}>发送</button>
          </div>
        </div>
      )}
    </div>
  );
}
