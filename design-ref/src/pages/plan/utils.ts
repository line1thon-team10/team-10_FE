import type { PlanBlock, PlanSubject } from "./types";

export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map((part) => Number(part));
  if (Number.isNaN(hour) || Number.isNaN(minute)) return 0;
  return hour * 60 + minute;
}

export function minutesToTime(minutes: number): string {
  const clamped = Math.min(Math.max(minutes, 0), 23 * 60 + 59);
  const hour = Math.floor(clamped / 60);
  const minute = clamped % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function blockRange(block: PlanBlock): string {
  return `${block.start} – ${block.end}`;
}

export function blockDurationLabel(block: PlanBlock): string {
  const diff = timeToMinutes(block.end) - timeToMinutes(block.start);
  if (diff <= 0) return "0분";
  const hour = Math.floor(diff / 60);
  const minute = diff % 60;
  if (hour === 0) return `${minute}분`;
  if (minute === 0) return `${hour}시간`;
  return `${hour}시간 ${minute}분`;
}

/** 카톡처럼 적은 문장에서 과목·시험일·목표를 뽑아냅니다. */
export function buildSubjectFromText(text: string): PlanSubject | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const dateMatch = trimmed.match(/(\d{1,2})\s*[/월.\-]\s*(\d{1,2})/);
  const goalMatch = trimmed.match(/A\+|A0|B\+|B0|C\+|통과|패스|PASS|P\/NP/i);

  const name = trimmed
    .replace(dateMatch?.[0] ?? "", " ")
    .replace(goalMatch?.[0] ?? "", " ")
    .replace(/시험|기말|중간|목표|까지|은|는|이|가/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!name || !dateMatch) return null;

  return {
    id: `sub-${Date.now()}`,
    name,
    examDate: `${Number(dateMatch[1])}/${Number(dateMatch[2])}`,
    goal: goalMatch ? goalMatch[0].toUpperCase() : "",
    totalGoal: "",
    extraInfo: "",
    status: "ready",
  };
}

export function scrollToPageTop(): void {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/** "11/12" 같은 표기에서 오늘까지 남은 날짜를 계산합니다. */
export function daysUntil(dateLabel: string): number {
  const match = dateLabel.match(/(\d{1,2})\s*[/월.\-]\s*(\d{1,2})/);
  if (!match) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let target = new Date(today.getFullYear(), Number(match[1]) - 1, Number(match[2]));
  if (target.getTime() < today.getTime()) {
    target = new Date(today.getFullYear() + 1, Number(match[1]) - 1, Number(match[2]));
  }
  return Math.max(0, Math.round((target.getTime() - today.getTime()) / 86400000));
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return "0KB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export function unitPages(startPage: number, endPage: number): number {
  return Math.max(0, endPage - startPage + 1);
}