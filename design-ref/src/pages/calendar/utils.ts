import type { CalBlock } from "@/pages/calendar/types";

export const CAL_START_HOUR = 8;
export const CAL_END_HOUR = 22;
export const CAL_HOUR_HEIGHT = 46;

export const CAL_HOURS = Array.from(
  { length: CAL_END_HOUR - CAL_START_HOUR },
  (_, index) => CAL_START_HOUR + index,
);

export const timeToMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map((part) => Number.parseInt(part, 10));
  return (Number.isNaN(hour) ? 0 : hour) * 60 + (Number.isNaN(minute) ? 0 : minute);
};

export const minutesToTime = (value: number) => {
  const clamped = Math.min(Math.max(value, 0), 24 * 60 - 1);
  const hour = Math.floor(clamped / 60);
  const minute = clamped % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

export const blockRange = (block: CalBlock) => `${block.start}–${block.end}`;

export const blockTop = (block: CalBlock) => {
  const minutes = timeToMinutes(block.start) - CAL_START_HOUR * 60;
  return (minutes / 60) * CAL_HOUR_HEIGHT;
};

export const blockHeight = (block: CalBlock) => {
  const minutes = Math.max(20, timeToMinutes(block.end) - timeToMinutes(block.start));
  return (minutes / 60) * CAL_HOUR_HEIGHT - 3;
};

export const subjectTone = (subject?: string) => {
  if (subject === "자료구조") return "cl-sub-data";
  if (subject === "운영체제") return "cl-sub-os";
  if (subject === "컴퓨터네트워크") return "cl-sub-net";
  return "cl-sub-etc";
};

export const kindClass = (block: CalBlock) => {
  if (block.kind === "study") return subjectTone(block.subject);
  if (block.kind === "custom") return "cl-custom";
  if (block.kind === "class") return "cl-class";
  if (block.kind === "appointment") return "cl-appointment";
  return "cl-fixed";
};

export const subjectChipClass = (subject?: string) => {
  if (subject === "자료구조") return "cl-dot-data";
  if (subject === "운영체제") return "cl-dot-os";
  if (subject === "컴퓨터네트워크") return "cl-dot-net";
  return "cl-dot-etc";
};