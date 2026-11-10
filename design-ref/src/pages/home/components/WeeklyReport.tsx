import type { StudyWeek } from "@/pages/home/types";
import { formatHours, weekTotals } from "@/pages/home/utils";

type Props = {
  week: StudyWeek;
  isCurrent: boolean;
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

export default function WeeklyReport({ week, isCurrent }: Props) {
  const totals = weekTotals(week);
  const percent = totals.plannedPages
    ? Math.min(100, Math.round((totals.donePages / totals.plannedPages) * 100))
    : 0;
  const remaining = Math.max(0, totals.plannedPages - totals.donePages);
  const average = week.days.length ? totals.hours / week.days.length : 0;

  return (
    <section className="flex h-full flex-col">
      <div>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--hp-muted)]">주간 리포트</p>
        <h3 className="mt-2 text-[22px] text-[var(--hp-ink)]">
          {isCurrent ? "이번 주 흐름" : `${week.label} 흐름`}
        </h3>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-3">
          <p className="text-[12px] font-medium text-[var(--hp-muted)]">
            이번 주 계획 페이지 {totals.plannedPages}p
          </p>
          <p className="hp-display text-[19px] text-[var(--hp-ink)]">{percent}%</p>
        </div>
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[var(--hp-line)]">
          <div
            className="h-full rounded-full bg-[var(--hp-brand)] transition-[width] duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2.5 text-[11.5px] text-[var(--hp-muted)]">
          {percent >= 100
            ? "이번 주 계획 페이지를 모두 했어요. 남은 날은 예습으로 써보세요."
            : `${remaining}p 더 하면 이번 주 계획을 채워요.`}
        </p>
      </div>

      <dl className="mt-5 flex flex-col divide-y divide-[var(--hp-line)] border-t border-[var(--hp-line)]">
        <div className="flex items-center justify-between gap-3 py-3">
          <dt className="text-[12.5px] text-[var(--hp-muted)]">가장 많이 쌓은 날</dt>
          <dd className="text-[13px] font-semibold text-[var(--hp-ink)]">
            {totals.best ? `${DAY_NAMES[totals.best.key] ?? totals.best.label} · ${formatHours(totals.best.hours)}` : "-"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-3">
          <dt className="text-[12.5px] text-[var(--hp-muted)]">하루 평균</dt>
          <dd className="text-[13px] font-semibold text-[var(--hp-ink)]">{formatHours(average)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 py-3">
          <dt className="text-[12.5px] text-[var(--hp-muted)]">계획 다 한 날</dt>
          <dd className="text-[13px] font-semibold text-[var(--hp-ink)]">{totals.goalDays}일</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-start gap-2.5 pt-5">
        <i className="ri-lightbulb-line mt-0.5 text-base leading-none text-[var(--hp-brand-deep)]" />
        <p className="text-[12px] leading-relaxed text-[var(--hp-muted)]">
          책 한 권은 그날 기록한 태스크 하나예요. 책 색은 그 태스크가 속한 단원의 지금 상태를 보여줘요.
        </p>
      </div>
    </section>
  );
}