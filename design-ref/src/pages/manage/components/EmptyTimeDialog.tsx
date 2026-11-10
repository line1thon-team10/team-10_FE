import { useState } from "react";
import DialogShell from "@/pages/manage/components/DialogShell";
import AiWait from "@/components/feature/AiWait";
import "@/pages/manage/manage.css";
import { emptyTimeOptions } from "@/mocks/managePlan";

type Props = {
  onClose: () => void;
  onApply: (optionId: string) => void;
  slotLabel?: string;
  /** 팝업 제목을 직접 지정할 때 */
  title?: string;
  /** 부제목 (이번만 / 앞으로 모두에 따라 달라집니다) */
  subtitle?: string;
};

export default function EmptyTimeDialog({
  onClose,
  onApply,
  slotLabel = "11/13 (금) 18:00–22:00",
  title,
  subtitle = "알바 일정을 이번만 지웠어요. 빈 시간을 어떻게 쓸까요?",
}: Props) {
  const [selected, setSelected] = useState("et-rest");

  return (
    <DialogShell
      label="빈 시간 제안"
      title={title ?? `${slotLabel}이 비었어요`}
      subtitle={subtitle}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="mg-btn mg-btn--ghost mg-btn--lg">
            취소
          </button>
          <button type="button" onClick={() => onApply(selected)} className="mg-btn mg-btn--solid mg-btn--lg">
            적용
          </button>
        </>
      }
    >
      <div className="mg-card--dashed rounded-[12px] p-3">
        <AiWait tone="manage" bare label="AI가 빈 시간에 넣을 안을 만들고 있어요">
          <div className="flex items-center gap-2 px-1">
            <span className="mg-ai-mark">AI</span>
            <h3 className="text-[12.5px] font-semibold text-[var(--mg-ink)]">빈 시간 쓰는 안 3개</h3>
          </div>

          <div className="mt-2.5 flex flex-col gap-2">
            {emptyTimeOptions.map((option) => {
              const disabled = option.disabled === true;
              const active = selected === option.id && !disabled;
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelected(option.id)}
                  aria-pressed={active}
                  className={`mg-opt flex-col items-stretch gap-1 ${active ? "is-selected" : ""} ${
                    disabled ? "is-disabled" : ""
                  }`}
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

          <p className="mt-2.5 px-1 text-[11px] leading-relaxed text-[var(--mg-muted)]">
            과목을 뺄 때도 이 창이 떠요. 보충 학습이 있으면 ③에서 보충을 먼저 알려줘요.
          </p>
        </AiWait>
      </div>
    </DialogShell>
  );
}