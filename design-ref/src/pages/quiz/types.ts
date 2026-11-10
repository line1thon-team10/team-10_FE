export type QuizConfidence = "sure" | "unsure";

export type QuizKind = "choice" | "written";

export type QuizQuestion = {
  id: string;
  no: number;
  label: string;
  kind: QuizKind;
  unit: string;
  level: string;
  evidence: string;
  /** 근거 원문 카드에 보여줄 인용 문장 */
  evidenceQuote?: string;
  fromYesterday: boolean;
  prompt: string;
  choices: string[];
  correctIndex: number;
  answerLabel: string;
  note: string;
  /** 서술형 예시 채점 점수 */
  sampleScore?: number;
  modelAnswer?: string;
  aiNote?: string;
};

export type QuizAnswer = {
  choiceIndex: number | null;
  text: string;
  confidence: QuizConfidence | null;
  submitted: boolean;
  score: number | null;
};

export type QuizSubject = {
  id: string;
  subject: string;
  accent: string;
  percent: number;
  locked: boolean;
  lines: string[];
  tags: string[];
  lockedNote: string;
  questions: QuizQuestion[];
};

export type QuizStats = {
  total: number;
  correct: number;
  sureCorrect: number;
  unsureCorrect: number;
  wrong: number;
};