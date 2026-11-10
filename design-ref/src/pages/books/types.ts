export type BlockState = "stable" | "wobble" | "risk" | "progress" | "planned" | "supplement";

/** 블록 1개 = 태스크 1개 */
export type BookBlock = {
  id: string;
  state: BlockState;
  task: string;
  pages: string;
};

export type BookUnit = {
  id: string;
  /** "1" ~ "5" */
  no: string;
  name: string;
  /** 단원 이해도. 아직 쌓지 않은 단원은 null */
  score: number | null;
  level: string;
  signal: string;
  blocks: BookBlock[];
};

export type SubjectReadiness = {
  value: number;
  progress: number;
  pages: string;
  mastery: number;
  target: number;
  grade: string;
  gap: number;
};

export type BookSubject = {
  id: string;
  name: string;
  /** 책 색 계열 (홈의 hp-bk-* 톤) */
  tone: string;
  examLabel: string;
  readiness: SubjectReadiness;
  units: BookUnit[];
};

export type PickedBlock = { unitId: string; blockId: string };