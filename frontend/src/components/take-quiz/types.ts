export interface Opt {
  id: string;
  text: string;
}

export interface Q {
  id: string;
  questionText: string;
  questionType: string;
  options?: Opt[];
  difficulty?: string;
  imageUrl?: string | null;
}

export interface TakeState {
  participantId: string;
  questions: Q[];
  quizTitle: string;
  subject?: string | null;
  difficulty?: string | null;
  scheduledAt?: string | null;
  durationMins?: number;
  participants?: number;
  completed?: boolean;
  savedAnswers?: Record<string, string>;
}

export interface Presence {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

export interface ParsedQuestion {
  text: string;
  formula: string;
  code: string;
  codeLang: string;
  diagram: string;
}
