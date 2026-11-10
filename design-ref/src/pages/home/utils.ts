import type { DayStatus, StudyBook, StudyDay, UnitBookState } from "./types";

/** 30분 = 책 1권 */
export const BOOK_MINUTES = 30;

/** 옛 기록(시간 기반)을 볼 때만 쓰는 보조 계산 */
export const bookCount = (hours: number) => Math.round(hours * 2);

export const formatHours = (hours: number) => {
  const total = Math.round(hours * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
};

export const formatMinutes = (minutes: number) => formatHours(minutes / 60);

/** 단원 상태 6가지 → 책 색/무늬 */
export const UNIT_STATE_TONE: Record<UnitBookState, string> = {
  planned: "hp-book--dash",
  progress: "hp-bk-progress",
  done: "hp-bk-gray",
  stable: "hp-bk-green",
  wobbly: "hp-bk-yellow",
  crisis: "hp-bk-crisis",
};

export const UNIT_STATE_LABEL: Record<UnitBookState, string> = {
  planned: "예정",
  progress: "진행 중",
  done: "완료·퀴즈 전",
  stable: "안정 (80~99)",
  wobbly: "흔들림 (50~79)",
  crisis: "붕괴 위기 (50 미만)",
};

export const unitStateTone = (state: UnitBookState) => UNIT_STATE_TONE[state];

export const dayBooks = (day: StudyDay): StudyBook[] => day.books ?? [];

export const plannedPagesOf = (day: StudyDay) =>
  day.plannedPages ?? Math.max(0, Math.round(day.hours * 2) * 10);

export const donePagesOf = (day: StudyDay) => {
  if (typeof day.donePages === "number") return day.donePages;
  const planned = plannedPagesOf(day);
  if (!planned) return 0;
  return Math.min(planned, Math.round((day.hours * 60 * planned) / Math.max(day.goalMinutes, 1)));
};

export const pageRatio = (day: StudyDay) => {
  const planned = plannedPagesOf(day);
  if (!planned) return 0;
  return Math.min(1, donePagesOf(day) / planned);
};

/**
 * 그날의 대표 상태 (하루 카드 문구용)
 * - 계획한 페이지를 다 했으면 done
 * - 일부만 했으면 goal-miss, 아직 아무것도 안 했으면 none
 */
export const dayStatus = (day: StudyDay): DayStatus => {
  if (day.future) return "none";
  const planned = plannedPagesOf(day);
  const done = donePagesOf(day);
  if (!planned) return "none";
  if (done >= planned) return "done";
  if (done > 0) return "goal-miss";
  return "none";
};

export const DAY_STATUS_LABEL: Record<DayStatus, string> = {
  done: "계획한 페이지를 다 했어요",
  "quiz-miss": "계획한 페이지를 다 했어요",
  "goal-miss": "계획보다 조금 덜 했어요",
  none: "아직 기록 없음",
};

/** 하루 카드의 색 칩: 그날 마지막 책의 단원 상태를 써요 */
export const DAY_STATUS_CHIP: Record<DayStatus, string> = {
  done: "hp-bk-green",
  "quiz-miss": "hp-bk-green",
  "goal-miss": "hp-bk-yellow",
  none: "hp-bk-gray",
};

export const weekTotals = (period: { days: StudyDay[] }) => {
  const hours = period.days.reduce((sum, day) => sum + day.hours, 0);
  const books = period.days.reduce(
    (sum, day) => sum + (day.future ? 0 : dayBooks(day).length + (day.pendingBooks ?? 0)),
    0,
  );
  const plannedPages = period.days.reduce((sum, day) => sum + plannedPagesOf(day), 0);
  const donePages = period.days.reduce((sum, day) => sum + donePagesOf(day), 0);
  const studied = period.days.filter((day) => !day.future && (day.hours > 0 || dayBooks(day).length > 0));
  const goalDays = period.days.filter((day) => {
    const planned = plannedPagesOf(day);
    return !day.future && planned > 0 && donePagesOf(day) >= planned;
  }).length;
  const clearedDays = goalDays;
  const plannedDays = period.days.filter((day) => day.future && !!day.plan).length;
  const best = studied.reduce<StudyDay | null>((top, day) => (!top || day.hours > top.hours ? day : top), null);
  return { hours, books, plannedPages, donePages, studiedDays: studied.length, goalDays, clearedDays, plannedDays, best };
};

export const defaultDayKey = (period: { days: StudyDay[] }) => {
  const today = period.days.find((day) => day.today);
  if (today) return today.key;
  const studied = [...period.days].reverse().find((day) => !day.future && (day.hours > 0 || dayBooks(day).length > 0));
  return studied ? studied.key : period.days[0].key;
};

/** "p.72–95" → { start: 72, end: 95 } */
export const pageBounds = (range: string) => {
  const numbers = range.match(/\d+/g)?.map(Number) ?? [1];
  const start = numbers[0] ?? 1;
  const end = numbers.length > 1 ? numbers[numbers.length - 1] : start;
  return { start: Math.min(start, end), end: Math.max(start, end) };
};

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);