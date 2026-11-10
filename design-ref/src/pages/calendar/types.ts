export type CalBlockKind = "fixed" | "class" | "appointment" | "study" | "custom";

export type CalBlock = {
  id: string;
  /** 0 = 월요일 ... 6 = 일요일 */
  day: number;
  start: string;
  end: string;
  title: string;
  kind: CalBlockKind;
  subject?: string;
  unit?: string;
  pageRange?: string;
  /** 계획한 공부 시간(분) */
  minutes?: number;
  /** 이 시간에 배치한 이유 */
  reason?: string;
  dashed?: boolean;
};

export type CalDay = {
  label: string;
  date: string;
  today?: boolean;
  exam?: string;
  memo?: string;
};

export type CalStudyLine = {
  subject: string;
  count: string;
  note: string;
};

export type CalWeek = {
  id: string;
  label: string;
  range: string;
  rangeShort: string;
  days: CalDay[];
  blocks: CalBlock[];
  study: CalStudyLine[];
};