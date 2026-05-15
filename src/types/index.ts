export interface Section {
  id: string;
  title: string;
  subtitle: string;
}

export interface Question {
  id: number;
  sectionId: string;
  title: string;
  body: string;
  keywords: string[];
}

export interface Evaluation {
  id: string;
  questionId: number;
  score: number;
  feedback: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  questionId: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
