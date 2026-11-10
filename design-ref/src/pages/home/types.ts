export type StudySession = {
  subject: string;
  minutes: number;
  /** 그 세션에서 읽은 페이지 수 (과목 비율 막대 기준) */
  pages?: number;
};

/** 단원 상태 6가지 */
export type UnitBookState = "planned" | "progress" | "done" | "stable" | "wobbly" | "crisis";

/** 책 한 권 = 태스크 하나. 색은 그 태스크가 속한 단원의 지금 상태 */
export type StudyBook = {
  subject: string;
  unit: string;
  state: UnitBookState;
};

export type DayStatus = "done" | "quiz-miss" | "goal-miss" | "none";

export type QuizResult = {
  total: number;
  correct: number;
};

export type StudyDay = {
  key: string;
  label: string;
  date: string;
  hours: number;
  goalMinutes: number;
  quiz: QuizResult;
  future: boolean;
  today: boolean;
  sessions: StudySession[];
  /** 그날 계획한 페이지 수 */
  plannedPages?: number;
  /** 그날 한 페이지 수 */
  donePages?: number;
  /** 그날 기록한 태스크 수만큼의 책 (색 = 단원 상태) */
  books?: StudyBook[];
  /** 오늘 아직 기록하지 않은 태스크 수 (점선 책) */
  pendingBooks?: number;
  /** 월간 보기용: 0(일) ~ 6(토) */
  weekday?: number;
  /** 월간 보기용: 날짜 숫자 */
  dateNumber?: number;
  /** 아직 오지 않은 날의 학습 예정 내용 */
  plan?: string;
  /** 시험·총복습처럼 달력 칸에 함께 적는 짧은 메모 */
  memo?: string;
};

export type StudyWeek = {
  id: string;
  label: string;
  range: string;
  days: StudyDay[];
};

export type StudyMonth = {
  id: string;
  label: string;
  range: string;
  days: StudyDay[];
};

export type TodayTaskStatus = "done" | "active" | "pending" | "partial";

/** 공부 기록 방식: 완료 / 부분 완료 / 못 함 */
export type TodayTaskRecordMode = "done" | "partial" | "missed";

/** 오늘 하기로 계획된 공부 태스크 (과목 · 범위 단위) */
export type TodayTask = {
  id: string;
  subject: string;
  unit: string;
  pageRange: string;
  pages: number;
  /** 처음 계획했던 페이지 수 (진행률 계산 기준) */
  plannedPages: number;
  /** 부분 완료로 범위가 줄기 전의 원래 범위 */
  plannedRange?: string;
  expectedMinutes: number;
  status: TodayTaskStatus;
  /** 이미 공부한 시간(분) */
  studiedMinutes: number;
  /** 기록으로 완료 처리된 페이지 수 */
  donePages: number;
  icon: string;
  note?: string;
  /** 같은 단원에 계획된 전체 태스크 수 (단원 완료 판단) */
  unitTaskCount?: number;
  /** 오늘 이전에 이미 끝낸 같은 단원 태스크 수 */
  unitTaskDone?: number;
  /** 마지막으로 남긴 기록 방식 */
  recordMode?: TodayTaskRecordMode;
  /** 기록으로 생긴 메모 (남은 페이지를 옮긴 내용 등) */
  recordNote?: string;
};

export type TodayOverview = {
  date: string;
  goalMinutes: number;
  studiedMinutes: number;
  books: number;
  streakNote?: string;
};