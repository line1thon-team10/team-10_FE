export type ReviewNoteKind = "객관식" | "단답형" | "서술형" | "OX";

export type ReviewAccent = "ds" | "os" | "net";

export type ReviewNote = {
  id: string;
  subject: string;
  accent: ReviewAccent;
  unit: string;
  concept: string;
  prompt: string;
  page: string;
  kind: ReviewNoteKind;
  /** 오답으로 처리된 횟수 */
  wrongCount: number;
  /** 애매하게 맞힌 횟수 */
  unsureCount: number;
  /** 화면에 그대로 보여줄 풀이 이력 */
  history: string;
  /** 다음 복습 시점 안내 */
  schedule: string;
  /** 마지막으로 틀린 날 (정렬용) */
  lastAt: string;
  options: string[];
  answerIndex: number;
  answerText: string;
  explain: string;
};

export type ReviewUnit = {
  id: string;
  label: string;
  /** 몇 회독 완료한 범위인지 */
  reads: number;
  range: string;
};

export type ReviewSubject = {
  id: string;
  label: string;
  accent: ReviewAccent;
  units: ReviewUnit[];
};

export type NoteTab = "date" | "unit" | "count";

export type NoteGroup = {
  key: string;
  label: string;
  sub: string;
  items: ReviewNote[];
};

export type WeakGroup = {
  subject: string;
  accent: ReviewAccent;
  concepts: { name: string; count: number }[];
};