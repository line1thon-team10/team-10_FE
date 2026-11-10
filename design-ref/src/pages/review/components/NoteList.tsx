import type { NoteGroup, NoteTab, ReviewNote } from "@/pages/review/types";

type TabItem = {
  key: NoteTab;
  label: string;
};

type Props = {
  tab: NoteTab;
  tabs: TabItem[];
  groups: NoteGroup[];
  total: number;
  onTabChange: (tab: NoteTab) => void;
  onRetry: (note: ReviewNote) => void;
};

export default function NoteList({ tab, tabs, groups, total, onTabChange, onRetry }: Props) {
  return (
    <section className="mt-8" aria-label="누적 오답 노트">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h2 className="text-[19px] text-[var(--qz-ink)] md:text-[21px]">누적 오답 노트</h2>
          <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--qz-muted)]">
            틀린 문제 + 애매하게 맞힌 문제까지 {total}문항. 한 번 더 볼 문항만 골라 다시 풀 수 있어요.
          </p>
        </div>
        <div className="rv-tabs" role="tablist" aria-label="오답 노트 보기 방식">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => onTabChange(item.key)}
              className={`rv-tab ${tab === item.key ? "is-active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-6">
        {groups.length === 0 ? (
          <p className="qz-card qz-card--dashed text-[12.5px] text-[var(--qz-muted)]">
            해당하는 문항이 없어요. 다음 복습에서 만나요.
          </p>
        ) : null}

        {groups.map((group) => (
          <div key={group.key}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--qz-line)] pb-2">
              <h3 className="text-[12.5px] font-semibold text-[var(--qz-ink-soft)]">{group.label}</h3>
              <span className="text-[11px] text-[var(--qz-muted)]">{group.sub}</span>
            </div>

            <ul className="mt-2.5 flex flex-col gap-2">
              {group.items.map((note) => (
                <li key={note.id}>
                  <article className={`qz-card rv-note rv-accent-${note.accent} p-4`}>
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className={`rv-dot rv-accent-${note.accent}`} aria-hidden="true" />
                        <span className="shrink-0 text-[11.5px] font-semibold text-[var(--qz-ink-soft)]">
                          {note.subject}
                        </span>
                        <span className="shrink-0 text-[11px] text-[var(--qz-muted)]">· {note.unit}</span>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                        <span className="qz-chip">{note.kind}</span>
                        <span className="qz-chip qz-chip--brand">{note.page}</span>
                      </div>
                    </div>

                    <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--qz-ink)]">{note.prompt}</p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--qz-muted)]">
                        <i className="ri-history-line text-[12px] leading-none" />
                        {note.history}
                      </span>
                      {note.unsureCount > 0 ? (
                        <span className="qz-chip qz-chip--warn">애매 정답 {note.unsureCount}회 포함</span>
                      ) : null}
                      <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--qz-brand-deep)]">
                        <i className="ri-calendar-schedule-line text-[12px] leading-none" />
                        {note.schedule}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--qz-line)] pt-3">
                      <span className="flex items-center gap-1.5 text-[11px] text-[var(--qz-muted)]">
                        <i className="ri-bookmark-line text-[12px] leading-none text-[var(--qz-warn)]" />
                        오답 {note.wrongCount}회 누적
                      </span>
                      <button
                        type="button"
                        onClick={() => onRetry(note)}
                        className="qz-btn qz-btn--ghost shrink-0"
                      >
                        <i className="ri-restart-line text-[12px] leading-none" />
                        다시 풀기
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}