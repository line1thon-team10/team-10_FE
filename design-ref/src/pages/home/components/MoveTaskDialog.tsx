type Props = {
  subject?: string;
  range?: string;
  nextDayLabel?: string;
  onClose: () => void;
  onMove: () => void;
};

export default function MoveTaskDialog({
  subject = "자료구조",
  range = "p.89–95",
  nextDayLabel = "11/10 화",
  onClose,
  onMove,
}: Props) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="다른 날로 옮기기 확인"
        className="w-full max-w-[360px] rounded-2xl border border-[var(--hp-line-strong)] bg-[var(--hp-card)] p-5"
      >
        <h2 className="text-[15px] font-semibold leading-relaxed text-[var(--hp-ink)]">
          {subject} {range}를 다음 공부일({nextDayLabel}) 첫 태스크로 옮길까요?
        </h2>
        <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--hp-muted)]">
          하루 평균 계획의 절반이 안 되는 분량이라 분배안 없이 다음 공부일 맨 앞으로 넘겨요.
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex cursor-pointer items-center whitespace-nowrap rounded-full border border-[var(--hp-line-strong)] px-3.5 py-1.5 text-[11.5px] font-semibold text-[var(--hp-ink-soft)] transition-colors hover:border-[var(--hp-ink-soft)] hover:text-[var(--hp-ink)]"
          >
            그대로 두기
          </button>
          <button
            type="button"
            onClick={onMove}
            className="inline-flex cursor-pointer items-center whitespace-nowrap rounded-full bg-[var(--hp-solid)] px-3.5 py-1.5 text-[11.5px] font-semibold text-[var(--hp-solid-ink)] transition-colors hover:bg-[var(--hp-solid-hover)]"
          >
            옮기기
          </button>
        </div>
      </div>
    </div>
  );
}