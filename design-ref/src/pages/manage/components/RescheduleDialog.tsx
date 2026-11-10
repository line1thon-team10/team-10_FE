import DialogShell from "@/pages/manage/components/DialogShell";
import "@/pages/manage/manage.css";
import { rescheduleMoves, rescheduleNote } from "@/mocks/managePlan";

type Props = {
  onClose: () => void;
  onApply: () => void;
  onDraw: () => void;
  dateLabel?: string;
  timeLabel?: string;
  title?: string;
};

export default function RescheduleDialog({
  onClose,
  onApply,
  onDraw,
  dateLabel = "11/12(목)",
  timeLabel = "19:00–21:00",
  title = "조모임",
}: Props) {
  return (
    <DialogShell
      label="추가한 일정으로 인한 재조정"
      title={`${dateLabel} ${timeLabel} ${title}을 추가할게요`}
      subtitle="자료구조 시험 당일이라 겹치는 공부 1개를 나눠서 옮겨야 해요. 이렇게 옮겨도 될까요?"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="mg-btn mg-btn--ghost mg-btn--lg">
            취소
          </button>
          <button type="button" onClick={onDraw} className="mg-btn mg-btn--ghost mg-btn--lg">
            캘린더에서 직접 그리기
          </button>
          <button type="button" onClick={onApply} className="mg-btn mg-btn--solid mg-btn--lg">
            이대로 적용
          </button>
        </>
      }
    >
      <ul className="flex flex-col gap-2">
        {rescheduleMoves.map((move) => (
          <li key={move.id} className="mg-card--soft rounded-[10px] px-3.5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
              <p className="flex min-w-0 items-center gap-2 text-[12.5px] text-[var(--mg-ink)]">
                <span className="h-4 w-[3px] flex-none rounded-full" style={{ background: "var(--mg-blue)" }} aria-hidden="true" />
                <span className="truncate">
                  {move.subject} · {move.task}
                </span>
              </p>
              <p className="flex shrink-0 items-center gap-1.5 text-[11.5px] tabular-nums text-[var(--mg-muted)]">
                {move.from}
                <i className="ri-arrow-right-line text-[12px] leading-none" />
                <span className="font-semibold text-[var(--mg-ink)]">{move.to}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mg-card--dashed mt-3 rounded-[10px] px-3.5 py-2.5">
        <p className="text-[11px] leading-relaxed text-[var(--mg-muted)]">{rescheduleNote}</p>
      </div>
    </DialogShell>
  );
}