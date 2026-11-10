import { useState } from "react";
import DialogShell from "@/pages/manage/components/DialogShell";

export type DeleteScope = "once" | "all";

type Props = {
  /** "11/13(금)" */
  dateLabel: string;
  /** "알바" */
  title: string;
  /** "18:00–22:00" */
  timeLabel: string;
  onClose: () => void;
  onNext: (scope: DeleteScope) => void;
};

const OPTIONS: { id: DeleteScope; title: string; note: string }[] = [
  {
    id: "once",
    title: "이번만",
    note: "이 날짜의 일정만 지우고, 다음 주 같은 요일은 그대로 둬요.",
  },
  {
    id: "all",
    title: "앞으로 모두",
    note: "남은 기간의 같은 요일·같은 시간 일정을 함께 지워요.",
  },
];

/** 반복 고정 일정을 지우기 전에 이번만 / 앞으로 모두를 고르는 작은 팝업 */
export default function DeleteScopeDialog({ dateLabel, title, timeLabel, onClose, onNext }: Props) {
  const [scope, setScope] = useState<DeleteScope>("once");

  return (
    <DialogShell
      label="반복 일정 삭제"
      title={`${dateLabel} ${title} ${timeLabel}을 지울게요`}
      subtitle="반복되는 고정 일정이에요. 이번만 지울지, 앞으로 모두 지울지 골라 주세요."
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="mg-btn mg-btn--ghost mg-btn--lg">
            취소
          </button>
          <button type="button" onClick={() => onNext(scope)} className="mg-btn mg-btn--solid mg-btn--lg">
            다음
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        {OPTIONS.map((option) => {
          const active = scope === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setScope(option.id)}
              aria-pressed={active}
              className={`mg-opt flex-col items-stretch gap-1 ${active ? "is-selected" : ""}`}
            >
              <span className="flex items-center gap-2">
                <span className="mg-dot" aria-hidden="true" />
                <span className="text-[12.5px] font-semibold text-[var(--mg-ink)]">{option.title}</span>
              </span>
              <span className="pl-[25px] text-[11.5px] leading-relaxed text-[var(--mg-ink-soft)]">
                {option.note}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--mg-muted)]">
        지운 시간은 바로 빈 시간으로 바뀌고, 다음 화면에서 AI가 3안을 보여줘요.
      </p>
    </DialogShell>
  );
}