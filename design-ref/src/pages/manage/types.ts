export type ManageAccent = "green" | "amber" | "blue";

/** 과목·계획 관리에서 다루는 과목 한 줄 */
export type ManageSubject = {
  id: string;
  name: string;
  /** "11/12 (목)" 형태 */
  examDate: string;
  /** "D-3" 형태 */
  dDay: string;
  goal: string;
  range: string;
  progressPages: number;
  totalPages: number;
  accent: ManageAccent;
};

export type SubjectField = "range" | "examDate" | "goal" | "progress";

/** 미리보기 패널에 담아 둔 변경 한 건 */
export type PendingChange = {
  subjectId: string;
  field: SubjectField;
  label: string;
  before: string;
  after: string;
};

/** 계획 추가 팝업으로 새로 넣은 계획 */
export type AddedPlan = {
  id: string;
  subject: string;
  range: string;
  minutes: number;
  days: string;
};

export type OptionItem = {
  id: string;
  title: string;
  note: string;
  bullets?: string[];
  chip?: string;
  disabled?: boolean;
};

export type PaceRow = {
  id: string;
  task: string;
  now: string;
  after: string;
};

export type RescheduleMove = {
  id: string;
  subject: string;
  task: string;
  from: string;
  to: string;
};

export type PlanPreviewBlock = {
  id: string;
  date: string;
  time: string;
  range: string;
  pages: string;
  minutes: string;
};