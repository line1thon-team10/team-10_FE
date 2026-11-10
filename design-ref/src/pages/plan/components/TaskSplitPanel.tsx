import type { TaskGroup } from "@/pages/plan/types";

type Props = {
  groups: TaskGroup[];
  /** 전체 과목 합계 (총 몇 p · 태스크 몇 개) */
  totalPages: number;
  totalTasks: number;
};

export default function TaskSplitPanel({ groups, totalPages, totalTasks }: Props) {
  return (
    <div>
      <div className="ps-split-panel">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="ps-ai-mark">AI</span>
          <span className="text-[12.5px] font-semibold text-[var(--ps-ink)]">단원 → 태스크 블록</span>
          <span className="rounded-md border border-[var(--ps-line-strong)] px-2 py-1 text-[10.5px] text-[var(--ps-muted)]">
            0.6초 동안 막대가 위에서부터 블록으로 갈라짐
          </span>
        </div>

        <div className="ps-split-scroll">
          <div className="ps-split-track">
            <div className="flex flex-col items-center gap-2">
              <span className="ps-split-source">분할 전</span>
              <span className="text-[10px] text-[var(--ps-muted)]">단원 막대</span>
            </div>

            <span className="mb-10 flex h-6 w-6 flex-none items-center justify-center text-[var(--ps-muted)]">
              <i className="ri-arrow-right-line text-[18px] leading-none" />
            </span>

            {groups.map((group, index) => (
              <div key={group.id} className="ps-split-group">
                <div className="ps-split-stack">
                  {group.heights.map((height, blockIndex) => (
                    <span
                      key={`${group.id}-${blockIndex}`}
                      className="ps-split-block"
                      style={{ height: `${height}px` }}
                    />
                  ))}
                </div>
                <p className="ps-split-title">
                  {index + 1}. {group.title.replace(/^\d+\.\s*/, "")}
                </p>
                <p className="ps-split-meta">
                  {group.pages}p · {group.tasks}개
                  {group.note ? ` · ${group.note}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-[var(--ps-muted)]">
          블록은 아직 예정(점선)이에요. 공부를 기록하면 같은 블록이 책 판자에 쌓여요. 2·3단원은 보충·총복습 블록이
          들어가서 분량보다 블록이 많아요.
        </p>
      </div>

      <div className="ps-split-summary mt-4">
        <span className="flex items-center gap-1.5">
          <i className="ri-stack-line text-[13px] leading-none text-[var(--ps-brand-deep)]" />
          <strong className="font-semibold text-[var(--ps-ink)]">총 {totalPages}p</strong>
          <span className="text-[var(--ps-muted)]">· 태스크 {totalTasks}개</span>
        </span>
        <span className="hidden h-3.5 w-px bg-[var(--ps-line-strong)] sm:block" aria-hidden="true" />
        <span>하루 평균 1시간 15분</span>
        <span className="hidden h-3.5 w-px bg-[var(--ps-line-strong)] sm:block" aria-hidden="true" />
        <span>알바 날은 짧게, 일요일은 길게, 시험 전날은 총복습</span>
      </div>
    </div>
  );
}