import type { StudyDay } from "@/pages/home/types";
import {
  DAY_STATUS_CHIP,
  DAY_STATUS_LABEL,
  dayStatus,
  donePagesOf,
  formatHours,
  formatMinutes,
  pageRatio,
  plannedPagesOf,
} from "@/pages/home/utils";

const SUBJECT_TONES: Record<string, string> = {
  자료구조: "hp-sub-data",
  운영체제: "hp-sub-os",
  컴퓨터네트워크: "hp-sub-net",
};

type Props = {
  day: StudyDay;
  weekRange: string;
};

const DAY_NAMES: Record<string, string> = {
  mon: "월요일",
  tue: "화요일",
  wed: "수요일",
  thu: "목요일",
  fri: "금요일",
  sat: "토요일",
  sun: "일요일",
};

export default function DayDetail({ day, weekRange }: Props) {
  const maxMinutes = Math.max(...day.sessions.map((session) => session.minutes), 1);
  const status = dayStatus(day);

  return (
    <section className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--hp-muted)]">
            하루 기록 · {weekRange}
          </p>
          <h3 className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[22px] text-[var(--hp-ink)]">
            {DAY_NAMES[day.key] ?? `${day.label}요일`}
            <span className="text-[13px] font-normal tracking-wide text-[var(--hp-muted)]">{day.date}</span>
            {day.today ? (
              <span className="text-[11px] font-bold text-[var(--hp-brand-deep)]">오늘</span>
            ) : null}
          </h3>
          {!day.future ? (
            <p className="mt-2 flex items-center gap-2 text-[12.5px] font-medium text-[var(--hp-muted)]">
              <span className={`hp-chip ${DAY_STATUS_CHIP[status]}`} aria-hidden="true" />
              {DAY_STATUS_LABEL[status]}
            </p>
          ) : null}
        </div>
      </div>

      {day.future ? (
        <div className="mt-8 flex flex-1 flex-col items-center justify-center py-10 text-center">
          <i className="ri-calendar-line text-[26px] leading-none text-[var(--hp-line-strong)]" />
          <p className="mt-3 text-[13.5px] font-semibold text-[var(--hp-ink)]">아직 오지 않은 날이에요</p>
          <p className="mt-1.5 max-w-[280px] text-[12.5px] leading-relaxed text-[var(--hp-muted)]">
            공부를 마치면 그만큼 책이 쌓입니다. 아직 기록이 비어 있어요.
          </p>
          {day.plan ? (
            <p className="mt-4 flex w-full max-w-[300px] items-center justify-center gap-1.5 text-[11.5px] leading-relaxed text-[var(--hp-brand-deep)]">
              <i className="ri-calendar-check-line text-[13px] leading-none" />
              {day.plan}
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-end gap-2">
            <span className="hp-display text-[40px] leading-none text-[var(--hp-ink)]">{formatHours(day.hours)}</span>
            <span className="pb-1.5 text-[12.5px] font-medium text-[var(--hp-muted)]">
              · 책 {day.books?.length ?? 0}권
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[var(--hp-muted)]">
            <span>
              계획 페이지 대비{" "}
              <strong className="font-semibold tabular-nums text-[var(--hp-ink-soft)]">
                {donePagesOf(day)}p / {plannedPagesOf(day)}p
              </strong>{" "}
              ({Math.round(pageRatio(day) * 100)}%)
            </span>
            <span className="h-3 w-px bg-[var(--hp-line-strong)]" aria-hidden="true" />
            <span>
              퀴즈 {day.quiz.correct}/{day.quiz.total || "-"}
            </span>
          </div>

          <ul className="mt-6 flex flex-col gap-3.5">
            {day.sessions.map((session) => (
              <li key={`${day.key}-${session.subject}`} className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-[13px] font-medium text-[var(--hp-ink)]">{session.subject}</span>
                  <span className="shrink-0 text-[12px] tabular-nums text-[var(--hp-muted)]">
                    {formatMinutes(session.minutes)}
                  </span>
                </div>
                <div className="mt-1.5 h-[5px] w-full overflow-hidden rounded-full bg-[var(--hp-line)]">
                  <div
                    className={`h-full rounded-full ${SUBJECT_TONES[session.subject] ?? "hp-sub-data"}`}
                    style={{ width: `${Math.round((session.minutes / maxMinutes) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center gap-2 pt-6">
            <span className="hp-chip hp-bk-green shrink-0" aria-hidden="true" />
            <p className="text-[11.5px] text-[var(--hp-muted)]">
              책 한 권은 그날 기록한 태스크 하나예요. 내일도 한 권 더 얹어볼까요?
            </p>
          </div>
        </>
      )}
    </section>
  );
}