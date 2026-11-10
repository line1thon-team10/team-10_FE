import { Fragment } from "react";
import type { StudyDay, StudyMonth } from "@/pages/home/types";
import { formatHours, pageRatio, unitStateTone, weekTotals } from "@/pages/home/utils";

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

const SUBJECT_TONES: Record<string, string> = {
  자료구조: "hp-sub-data",
  운영체제: "hp-sub-os",
  컴퓨터네트워크: "hp-sub-net",
};
const FALLBACK_TONES = ["hp-sub-data", "hp-sub-os", "hp-sub-net"];

type Props = {
  month: StudyMonth;
  selectedKey: string;
  onSelect: (key: string) => void;
};

function DayCell({
  day,
  selected,
  onSelect,
}: {
  day: StudyDay;
  selected: boolean;
  onSelect: (key: string) => void;
}) {
  const ratio = pageRatio(day);
  const height = Math.max(7, Math.round(ratio * 46));
  const lastBook = day.books?.[day.books.length - 1];
  const tone = unitStateTone(lastBook?.state ?? "done");
  const totalPages = day.sessions.reduce((sum, session) => sum + (session.pages ?? 0), 0);
  const totalMinutes = day.sessions.reduce((sum, session) => sum + session.minutes, 0);
  const hasPlan = (day.plannedPages ?? 0) > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(day.key)}
      aria-label={`${day.date} ${day.label}요일 ${day.future ? "예정된 학습 보기" : "책 보기"}`}
      aria-pressed={selected}
      className={`hp-month-cell ${selected ? "is-selected" : ""} ${day.today ? "is-today" : ""}`}
    >
      <span className="flex items-start justify-between gap-1 px-1.5 pt-1.5">
        <span
          className={`text-[10px] tabular-nums ${
            day.today ? "font-bold text-[var(--hp-brand-deep)]" : "text-[var(--hp-muted)]"
          }`}
        >
          {day.dateNumber}
        </span>
        {day.memo ? (
          <span className="hidden max-w-[74%] truncate text-[9px] leading-tight text-[var(--hp-muted)] sm:inline-block">
            {day.memo}
          </span>
        ) : null}
      </span>

      {day.today ? <span className="hp-beam hp-beam--sm" aria-hidden="true" /> : null}

      <div className="relative z-10 mt-auto flex w-full flex-col items-center justify-end px-[18%] pb-1">
        {day.future ? (
          <div className="hp-vbook-track">
            <span className="hp-vbook hp-vbook--dash" style={{ height: 34 }} aria-hidden="true" />
          </div>
        ) : hasPlan ? (
          <div className="hp-vbook-track" title={`${day.donePages ?? 0}p / ${day.plannedPages}p`}>
            <div className={`hp-vbook ${tone}`} style={{ height }} />
          </div>
        ) : (
          <div className="hp-vbook-track" aria-hidden="true" />
        )}
      </div>

      <span className="relative z-10 flex h-[4px] w-full items-stretch gap-[1px] overflow-hidden px-1.5 pb-1.5">
        {day.future || totalPages + totalMinutes === 0
          ? null
          : day.sessions.slice(0, 4).map((session, index) => (
              <span
                key={`${day.key}-${session.subject}-${index}`}
                className={`hp-swatch ${SUBJECT_TONES[session.subject] ?? FALLBACK_TONES[index % 3]}`}
                style={{
                  width: `${Math.max(
                    6,
                    Math.round(
                      ((session.pages ?? session.minutes) / (totalPages || totalMinutes || 1)) * 100,
                    ),
                  )}%`,
                }}
                aria-hidden="true"
              />
            ))}
      </span>
    </button>
  );
}

export default function MonthShelf({ month, selectedKey, onSelect }: Props) {
  const totals = weekTotals(month);
  const slots: (StudyDay | null)[] = [];
  const firstWeekday = month.days[0]?.weekday ?? 0;
  // 월요일 시작: 일요일(0)은 마지막 칸에 들어갑니다.
  const leading = (firstWeekday + 6) % 7;

  for (let i = 0; i < leading; i += 1) slots.push(null);
  month.days.forEach((day) => slots.push(day));
  while (slots.length % 7 !== 0) slots.push(null);

  const rows: (StudyDay | null)[][] = [];
  for (let i = 0; i < slots.length; i += 7) rows.push(slots.slice(i, i + 7));

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--hp-muted)]">
        <span>이번 달 {formatHours(totals.hours)}</span>
        <span className="h-3 w-px bg-[var(--hp-line)]" aria-hidden="true" />
        <span>
          책 <strong className="font-semibold text-[var(--hp-ink)]">{totals.books}권</strong>
        </span>
        <span className="h-3 w-px bg-[var(--hp-line)]" aria-hidden="true" />
        <span>{totals.studiedDays}일 학습</span>
        <span className="h-3 w-px bg-[var(--hp-line)]" aria-hidden="true" />
        <span>
          예정 {totals.plannedDays}일 · 계획 {month.days.filter((day) => day.memo).length}개 일정
        </span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-x-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={`weekday-${label}`}
            className="pb-1.5 text-center text-[10.5px] font-medium text-[var(--hp-muted)]"
          >
            {label}
          </div>
        ))}

        {rows.map((row, rowIndex) => (
          <Fragment key={`month-row-${rowIndex}`}>
            {row.map((day, cellIndex) =>
              day ? (
                <DayCell key={day.key} day={day} selected={day.key === selectedKey} onSelect={onSelect} />
              ) : (
                <div key={`empty-${rowIndex}-${cellIndex}`} className="hp-month-cell is-empty" aria-hidden="true" />
              ),
            )}
            <div className="hp-plank hp-plank--thin col-span-7 mb-1.5" aria-hidden="true" />
          </Fragment>
        ))}
      </div>
    </div>
  );
}