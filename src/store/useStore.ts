import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Evaluation, ChatMessage } from '@/types';
import { TOTAL_QUESTIONS } from '@/lib/questions';

interface Store {
  currentQ: number;
  answers: Record<number, string>;
  mastered: Record<number, boolean>;
  evaluations: Record<number, Evaluation[]>;
  chatMessages: Record<number, ChatMessage[]>;
  isLoading: boolean;

  setCurrentQ: (q: number) => void;
  setAnswer: (q: number, text: string) => void;
  setMastered: (q: number) => void;
  addEvaluation: (q: number, e: Evaluation) => void;
  addChatMessage: (q: number, m: ChatMessage) => void;
  removeChatMessage: (q: number, id: string) => void;
  setLoading: (v: boolean) => void;
  nextQuestion: () => void;
  getProgress: () => number;
  resetAll: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      currentQ: 1,
      answers: {},
      mastered: {},
      evaluations: {},
      chatMessages: {},
      isLoading: false,

      setCurrentQ: (q) => set({ currentQ: q }),
      setAnswer: (q, text) => set((s) => ({ answers: { ...s.answers, [q]: text } })),
      setMastered: (q) => set((s) => ({ mastered: { ...s.mastered, [q]: true } })),

      addEvaluation: (q, e) =>
        set((s) => ({
          evaluations: { ...s.evaluations, [q]: [...(s.evaluations[q] ?? []), e] },
        })),

      addChatMessage: (q, m) =>
        set((s) => ({
          chatMessages: { ...s.chatMessages, [q]: [...(s.chatMessages[q] ?? []), m] },
        })),

      removeChatMessage: (q, id) =>
        set((s) => ({
          chatMessages: {
            ...s.chatMessages,
            [q]: (s.chatMessages[q] ?? []).filter((m) => m.id !== id),
          },
        })),

      setLoading: (v) => set({ isLoading: v }),

      nextQuestion: () =>
        set((s) => {
          const next = s.currentQ + 1;
          return next > TOTAL_QUESTIONS ? s : { currentQ: next };
        }),

      getProgress: () => {
        const count = Object.values(get().mastered).filter(Boolean).length;
        return Math.round((count / TOTAL_QUESTIONS) * 100);
      },

      resetAll: () =>
        set({
          currentQ: 1,
          answers: {},
          mastered: {},
          evaluations: {},
          chatMessages: {},
          isLoading: false,
        }),
    }),
    {
      name: 'micro-econ-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        currentQ: s.currentQ,
        answers: s.answers,
        mastered: s.mastered,
        evaluations: s.evaluations,
        chatMessages: s.chatMessages,
      }),
    }
  )
);
