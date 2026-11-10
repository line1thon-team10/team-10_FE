import type { BookSubject } from "@/pages/books/types";

type Props = {
  subject: BookSubject;
  others: BookSubject[];
  onSelect: (id: string) => void;
};

export default function ReadinessCard({ subject, others, onSelect }: Props) {
  const { readiness } = subject;

  return (
    <section className="rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-[var(--hp-brand-deep)]">
            시험 준비도
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-[var(--hp-muted)]">
            <span className={`bk-ribbon ${subject.tone}`} aria-hidden="true" />
            {subject.name}
          </p>
        </div>
        <span className="hp-tag shrink-0">{readiness.grade} 목표</span>
      </div>

      <p className="hp-display mt-2 text-[44px] leading-none text-[var(--hp-ink)]">
        {readiness.value}
        <span className="ml-0.5 text-[18px] text-[var(--hp-muted)]">%</span>
      </p>

      <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--hp-muted)]">
        진도율{" "}
        <strong className="font-semibold tabular-nums text-[var(--hp-ink-soft)]">{readiness.progress}%</strong> (
        {readiness.pages}) × 숙달도{" "}
        <strong className="font-semibold tabular-nums text-[var(--hp-ink-soft)]">{readiness.mastery}%</strong>
      </p>

      <div className="relative mt-3">
        <div className="h-[8px] w-full overflow-hidden rounded-full bg-[var(--hp-line)]">
          <div
            className="h-full rounded-full bg-[var(--hp-brand)] transition-[width] duration-500"
            style={{ width: `${readiness.value}%` }}
          />
        </div>
        <span className="bk-target-line" style={{ left: `calc(${readiness.target}% - 1px)` }} aria-hidden="true" />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-[var(--hp-muted)]">
        <span>
          목표선 {readiness.target}% ({readiness.grade})
        </span>
        <span>
          목표까지{" "}
          <strong className="font-semibold tabular-nums text-[var(--hp-brand-deep)]">{readiness.gap}%</strong> 부족
        </span>
      </div>

      <p className="mt-3 flex items-center gap-1.5 border-t border-[var(--hp-line)] pt-3 text-[11px] text-[var(--hp-muted)]">
        <i className="ri-calendar-event-line text-[12px] leading-none" />
        시험 {subject.examLabel}
      </p>

      <ul className="mt-3 flex flex-col gap-2.5">
        {others.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className="w-full cursor-pointer text-left"
              aria-label={`${item.name} 책 쌓기 보기`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-[var(--hp-ink-soft)]">
                  <span className={`bk-ribbon ${item.tone}`} aria-hidden="true" />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-[var(--hp-muted)]">
                  <strong className="text-[12px] font-semibold text-[var(--hp-ink)]">{item.readiness.value}%</strong>{" "}
                  · 목표 {item.readiness.target}%
                </span>
              </div>
              <div className="mt-1 h-[4px] w-full overflow-hidden rounded-full bg-[var(--hp-line)]">
                <span
                  className="block h-full rounded-full bg-[var(--hp-line-strong)]"
                  style={{ width: `${item.readiness.value}%` }}
                />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}