type Props = {
  variant?: "small" | "big";
  onMove: () => void;
  onConfirm: () => void;
};

export default function LateBanner({ variant = "small", onMove, onConfirm }: Props) {
  const big = variant === "big";

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--hp-line-strong)] bg-white/[0.03] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="flex items-start gap-1.5 text-[12.5px] font-semibold text-[var(--hp-ink)]">
          <i className="ri-arrow-go-back-line mt-0.5 text-[13px] leading-none text-[var(--hp-brand-deep)]" />
          <span>
            {big ? "어제 38p를 못 했어요" : "어제 자료구조 p.89–95(7p)를 못 했어요"}
          </span>
        </p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--hp-muted)]">
          {big
            ? "자료구조 24p · 컴퓨터네트워크 14p예요. 두 과목 모두 하루 평균 계획(각 18p)의 50%(9p)를 넘어서 남은 일정을 다시 짠 분배안을 먼저 보여드려요."
            : "자료구조 하루 평균 계획(약 18p)의 39%라 분배안 없이 오늘 맨 위에 넣었어요. 밀린 양이 50%를 넘으면 다시 짜는 안을 보여줘요."}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onMove}
          className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--hp-line-strong)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--hp-ink-soft)] transition-colors hover:border-[var(--hp-ink-soft)] hover:text-[var(--hp-ink)]"
        >
          {big ? "분배안 보기" : "다른 날로 옮기기"}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--hp-solid)] px-3.5 py-1.5 text-[11.5px] font-semibold text-[var(--hp-solid-ink)] transition-colors hover:bg-[var(--hp-solid-hover)]"
        >
          확인
        </button>
      </div>
    </div>
  );
}