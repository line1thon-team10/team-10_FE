import type { StudyDay, StudyWeek } from "@/pages/home/types";
import { formatHours, unitStateTone, weekTotals } from "@/pages/home/utils";

const BOOK_WIDTHS = [100, 92, 97, 87, 94, 100, 90];
const BOOK_HEIGHTS = [15, 13, 16, 14, 12, 15, 13];

type Props = {
  week: StudyWeek;
  selectedKey: string;
  onSelect: (key: string) => void;
  /** 기록할 때마다 1씩 늘어납니다. 오늘 칸에 책 한 권이 떨어집니다. */
  dropSignal?: number;
};

function BookStack({ day, dayIndex, dropSignal }: { day: StudyDay; dayIndex: number; dropSignal?: number }) {
  const books = day.books ?? [];
  const pending = day.today ? (day.pendingBooks ?? 0) : 0;
  const dropping = Boolean(day.today && dropSignal);
  if (day.future) return null;

  return (
    <div className="flex w-full flex-col items-center justify-end gap-[2px] px-[8%]">
      {books.map((book, i) => (
        <div
          key={`${day.key}-${i}`}
          className={`hp-book ${unitStateTone(book.state)}`}
          title={`${book.subject} · ${book.unit}`}
          style={{
            width: `${BOOK_WIDTHS[(i + dayIndex) % BOOK_WIDTHS.length]}%`,
            height: `${BOOK_HEIGHTS[(i + dayIndex * 2) % BOOK_HEIGHTS.length]}px`,
            animationDelay: `${i * 20}ms`,
          }}
        />
      ))}
      {Array.from({ length: pending }).map((_, i) => (
        <div
          key={`${day.key}-pending-${i}`}
          className="hp-book hp-book--dash"
          title="아직 기록하지 않은 태스크"
          style={{
            width: `${BOOK_WIDTHS[(books.length + i + dayIndex) % BOOK_WIDTHS.length]}%`,
            height: `${BOOK_HEIGHTS[(books.length + i + dayIndex * 2) % BOOK_HEIGHTS.length]}px`,
          }}
        />
      ))}
      {dropping ? (
        <div
          key={`drop-${dropSignal}`}
          className={`hp-book hp-book--drop ${unitStateTone(books[books.length - 1]?.state ?? "done")}`}
          style={{ width: "96%", height: "15px" }}
        />
      ) : null}
    </div>
  );
}

export default function WeekShelf({ week, selectedKey, onSelect, dropSignal }: Props) {
  const totals = weekTotals(week);
  const todayIndex = week.days.findIndex((day) => day.today);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[var(--hp-muted)]">
        <span>총 {formatHours(totals.hours)}</span>
        <span className="h-3 w-px bg-[var(--hp-line)]" aria-hidden="true" />
        <span>
          책 <strong className="font-semibold text-[var(--hp-ink)]">{totals.books}권</strong>
        </span>
        <span className="h-3 w-px bg-[var(--hp-line)]" aria-hidden="true" />
        <span>{totals.studiedDays}일 학습</span>
        <span className="h-3 w-px bg-[var(--hp-line)]" aria-hidden="true" />
        <span>예정 {totals.plannedDays}일</span>
      </div>

      <div className="mt-2 -mx-1 overflow-x-auto px-1 pb-1">
        <div className="grid min-w-[540px] grid-cols-7 gap-1 sm:gap-2">
          {week.days.map((day, index) => {
            const active = day.key === selectedKey;
            return (
              <button
                key={`${week.id}-${day.key}-books`}
                type="button"
                onClick={() => onSelect(day.key)}
                aria-label={`${day.date} ${day.label}요일 책 보기`}
                aria-pressed={active}
                className={`hp-day relative flex min-w-0 cursor-pointer flex-col justify-end rounded-t-xl pb-0 ${
                  active ? "is-selected" : ""
                }`}
              >
                {day.today ? <span className="hp-beam" aria-hidden="true" /> : null}
                <div className="relative z-10 flex h-[250px] w-full flex-col justify-end">
                  <BookStack day={day} dayIndex={index} dropSignal={day.today ? dropSignal : undefined} />
                </div>
                {day.today ? <span className="hp-beam-wash" aria-hidden="true" /> : null}
              </button>
            );
          })}

          <div className="hp-plank relative col-span-7" aria-hidden="true">
            {todayIndex >= 0 ? (
              <span className="hp-plank-light" style={{ left: `${((todayIndex + 0.5) / 7) * 100}%` }} />
            ) : null}
          </div>

          {week.days.map((day) => (
            <button
              key={`${week.id}-${day.key}-label`}
              type="button"
              onClick={() => onSelect(day.key)}
              aria-label={`${day.date} ${day.label}요일 기록 보기`}
              className={`hp-day flex h-[56px] min-w-0 cursor-pointer items-start justify-center rounded-b-xl pt-2.5 ${
                day.key === selectedKey ? "is-selected" : ""
              }`}
            >
              <span className={`hp-weekday ${day.today ? "is-today" : ""}`}>{day.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-[var(--hp-line)] pt-3.5">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-[var(--hp-muted)]">
          <li className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="hp-chip hp-chip--dash" aria-hidden="true" />
            예정
          </li>
          <li className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="hp-chip hp-bk-progress" aria-hidden="true" />
            진행 중
          </li>
          <li className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="hp-chip hp-bk-gray" aria-hidden="true" />
            완료·퀴즈 전
          </li>
          <li className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="hp-chip hp-bk-green" aria-hidden="true" />
            안정
          </li>
          <li className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="hp-chip hp-bk-yellow" aria-hidden="true" />
            흔들림
          </li>
          <li className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="hp-chip hp-bk-crisis" aria-hidden="true" />
            붕괴 위기
          </li>
          <li className="flex items-center gap-1.5 whitespace-nowrap">
            <i className="ri-book-2-line text-[13px] leading-none" />
            책 1권 = 태스크 1개
          </li>
        </ul>
        <p className="text-[11.5px] text-[var(--hp-muted)]">요일을 누르면 아래에서 그날 기록과 주간 리포트를 볼 수 있어요.</p>
      </div>
    </div>
  );
}