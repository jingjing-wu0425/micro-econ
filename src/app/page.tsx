'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { QUESTIONS, SECTIONS, TOTAL_QUESTIONS } from '@/lib/questions';
import { InlinePlot, parseResponse, type ContentBlock } from '@/components/EconChart';
import type { ChatMessage } from '@/types';

const emptyChatMessages: ChatMessage[] = [];

export default function Home() {
  const currentQ = useStore((s) => s.currentQ);
  const answers = useStore((s) => s.answers);
  const mastered = useStore((s) => s.mastered);
  const isLoading = useStore((s) => s.isLoading);
  const getProgress = useStore((s) => s.getProgress);
  const setAnswer = useStore((s) => s.setAnswer);
  const setCurrentQ = useStore((s) => s.setCurrentQ);
  const addChatMessage = useStore((s) => s.addChatMessage);
  const setMastered = useStore((s) => s.setMastered);
  const nextQuestion = useStore((s) => s.nextQuestion);
  const setLoading = useStore((s) => s.setLoading);
  const resetAll = useStore((s) => s.resetAll);

  const [showSidebar, setShowSidebar] = useState(false);
  const progress = getProgress();
  const question = QUESTIONS.find((q) => q.id === currentQ)!;
  const section = SECTIONS.find((s) => s.id === question.sectionId)!;
  const answer = answers[currentQ] ?? '';
  const messages = useStore((s) => s.chatMessages[currentQ]) ?? emptyChatMessages;
  const isMastered = mastered[currentQ] ?? false;
  const masteredCount = Object.values(mastered).filter(Boolean).length;
  const hasSubmitted = messages.length > 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!answer.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, questionId: currentQ, role: 'user', content: answer, timestamp: new Date().toISOString() };
    addChatMessage(currentQ, userMsg);
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `## 题目：${question.title}\n${question.body}\n\n## 核心概念：${question.keywords.join('、')}\n\n## 我的回答：\n${answer}` }],
        }),
      });
      const data = await res.json();
      addChatMessage(currentQ, { id: `a-${Date.now()}`, questionId: currentQ, role: 'assistant', content: data.response, timestamp: new Date().toISOString() });
    } catch {
      addChatMessage(currentQ, { id: `a-err-${Date.now()}`, questionId: currentQ, role: 'assistant', content: '⚠ 暂时不可用，请稍后重试。', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, questionId: currentQ, role: 'user', content: text, timestamp: new Date().toISOString() };
    addChatMessage(currentQ, userMsg);
    setLoading(true);
    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `当前题目：${question.title}\n关键词：${question.keywords.join('、')}\n我的回答：${answer}\n\n${history.map((m) => `${m.role === 'user' ? '我' : '你'}：${m.content}`).join('\n')}` }],
        }),
      });
      const data = await res.json();
      addChatMessage(currentQ, { id: `a-${Date.now()}`, questionId: currentQ, role: 'assistant', content: data.response, timestamp: new Date().toISOString() });
    } catch {
      addChatMessage(currentQ, { id: `a-err-${Date.now()}`, questionId: currentQ, role: 'assistant', content: '⚠ 暂时不可用', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

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
                          className={`sidebar-link w-full text-left text-[11px] px-3 py-2 rounded-lg ${active ? 'font-semibold' : ''}`}
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
          <div className="max-w-2xl mx-auto px-6 py-10" ref={scrollRef}>
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

            {/* Mastered state */}
            {isMastered ? (
              <div className="rounded-xl p-5" style={{ background: 'var(--success-light)', border: '1px solid var(--success)' }}>
                <div className="text-xs font-bold mb-2" style={{ color: 'var(--success)' }}>已掌握 ✓</div>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{answer}</p>
              </div>
            ) : (
              <>
                {/* Answer textarea */}
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(currentQ, e.target.value)}
                  placeholder="写下你的思考..."
                  className="w-full h-44 text-sm p-4 rounded-xl resize-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', fontFamily: '-apple-system, sans-serif', lineHeight: '1.7' }}
                />
                <div className="mt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isLoading}
                    className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--accent)' }}
                  >
                    {isLoading && !hasSubmitted ? 'AI 分析中...' : '提交回答'}
                  </button>
                </div>
              </>
            )}

            {/* Unified message thread */}
            {messages.length > 0 && !isMastered && (
              <div className="mt-8 space-y-5">
                {messages.map((msg, idx) => (
                  <MessageBubble key={msg.id} message={msg} animate={idx === messages.length - 1 && msg.role === 'assistant'} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                    <span className="text-[11px]" style={{ color: 'var(--text-light)' }}>AI 分析中...</span>
                  </div>
                )}
              </div>
            )}

            {/* Follow-up input */}
            {hasSubmitted && !isMastered && (
              <div className="mt-6 flex gap-3">
                <input
                  ref={inputRef}
                  onKeyDown={(e) => { if (e.key === 'Enter') { const v = (e.target as HTMLInputElement).value; handleFollowUp(v); (e.target as HTMLInputElement).value = ''; } }}
                  placeholder="继续追问或补充你的想法..."
                  className="flex-1 text-sm px-4 py-2.5 rounded-xl"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface)', fontFamily: '-apple-system, sans-serif' }}
                />
                <button
                  onClick={() => { const v = inputRef.current?.value ?? ''; if (v.trim()) { handleFollowUp(v); if (inputRef.current) inputRef.current.value = ''; } }}
                  disabled={isLoading}
                  className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-40"
                  style={{ background: 'var(--accent)' }}
                >
                  追问
                </button>
              </div>
            )}

            {/* Master button */}
            {hasSubmitted && !isMastered && (
              <div className="mt-6">
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

function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.type === 'plotly' && block.chartData ? (
          <InlinePlot key={i} data={block.chartData.data} layout={block.chartData.layout} />
        ) : (
          <div key={i} className="text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: '-apple-system, sans-serif', color: 'var(--text)' }}>
            <RichText text={block.content} />
          </div>
        )
      )}
    </>
  );
}

function RichText({ text }: { text: string }) {
  const html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function MessageBubble({ message: msg, animate }: { message: ChatMessage; animate: boolean }) {
  const [displayed, setDisplayed] = useState(animate ? '' : msg.content);
  const [isTyping, setIsTyping] = useState(animate);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (msg.role === 'user' || hasAnimated.current) { setDisplayed(msg.content); return; }
    hasAnimated.current = true;
    setIsTyping(true);
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      if (i < msg.content.length) { setDisplayed(msg.content.slice(0, i + 1)); i++; }
      else { setIsTyping(false); clearInterval(interval); }
    }, 12);
    return () => clearInterval(interval);
  }, [msg.content, msg.role]);

  const blocks = useMemo(() => isTyping ? [{ type: 'text' as const, content: displayed }] : parseResponse(displayed), [displayed, isTyping]);

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap" style={{ background: 'var(--accent-light)', color: 'var(--text)', fontFamily: '-apple-system, sans-serif' }}>
          {displayed}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] evaluation-card rounded-2xl px-5 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">☕</span>
          <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>AI 分析</span>
        </div>
        <div className={isTyping ? 'typing-cursor' : ''}>
          <ContentRenderer blocks={blocks} />
        </div>
      </div>
    </div>
  );
}
