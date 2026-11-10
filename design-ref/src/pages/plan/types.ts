export type SubjectStatus = "ready" | "asking" | "pending";

export type PlanSubject = {
  id: string;
  name: string;
  /** "11/12" 형태로 표시합니다. */
  examDate: string;
  goal: string;
  /** 시험 총 목표: 커트라인·합격 기준 */
  totalGoal: string;
  /** 기타 정보: 반영 비율·교수님 강조 범위 */
  extraInfo: string;
  status: SubjectStatus;
};

export type BlockKind = "fixed" | "class" | "appointment" | "custom";

export type PlanBlock = {
  id: string;
  /** 0 = 월요일 ... 6 = 일요일 */
  day: number;
  start: string;
  end: string;
  title: string;
  kind: BlockKind;
  /** 말로 방금 추가한 일정처럼 점선으로 보여줄지 여부 */
  dashed?: boolean;
};

export type PlanWeek = {
  label: string;
  range: string;
  blocks: PlanBlock[];
};

export type RepeatItem = {
  id: string;
  label: string;
  time: string;
};

export type PlanDraft = {
  subjects: PlanSubject[];
  weeks: PlanWeek[];
  repeats: RepeatItem[];
  materials?: PlanMaterial[];
  units?: PlanUnit[];
  allocations?: PlanAllocation[];
  updatedAt: string;
};

export type MaterialStatus = "reading" | "ready" | "scan-low" | "failed";

/** AI가 자료를 읽는 세 단계 */
export type MaterialReadStage = "text" | "toc" | "concept";

export type PlanMaterial = {
  id: string;
  subjectId: string;
  name: string;
  /** AI가 읽어낸 쪽수 */
  pages: number;
  sizeLabel: string;
  status: MaterialStatus;
  /** 읽는 중일 때 지금 단계 */
  readStage?: MaterialReadStage;
  /** 스캔본(이미지·필기) 여부 */
  scanned?: boolean;
  /** 목차를 직접 입력해 단원을 만든 경우 */
  manualToc?: boolean;
};

export type PlanUnit = {
  id: string;
  subjectId: string;
  title: string;
  startPage: number;
  endPage: number;
  confirmed: boolean;
  /** 목차를 직접 입력해 만든 단원은 퀴즈를 만들지 않습니다. */
  quizDisabled?: boolean;
};

export type PlanAllocation = {
  subjectId: string;
  /** 하루에 학습할 쪽수 */
  perDay: number;
};

export type ChatExample = {
  role: "assistant" | "user";
  text: string;
};

/** 5단계: 단원이 태스크 블록으로 쪼개진 모습 */
export type TaskGroup = {
  id: string;
  title: string;
  pages: number;
  tasks: number;
  /** 교수님 강조처럼 눈에 띄게 표시할 메모 */
  note?: string;
  /** 위에서부터 쌓이는 점선 블록 높이(px) */
  heights: number[];
};

export type TaskSubject = {
  id: string;
  label: string;
  pages: number;
  tasks: number;
};

/** 5-2: 기존 안과 새 안을 비교하는 하루 칸 */
export type CompareDay = {
  id: string;
  label: string;
  hours: number;
  changed: boolean;
};

export type CompareWeek = {
  id: string;
  label: string;
  range: string;
  days: CompareDay[];
};

export type CompareStat = {
  id: string;
  label: string;
  before: string;
  after: string;
};