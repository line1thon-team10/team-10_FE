import { useState } from "react";
import DialogShell from "@/pages/manage/components/DialogShell";
import AiWait from "@/components/feature/AiWait";
import { catchUpOptions, catchUpPreviews } from "@/mocks/managePlan";

type Props = {
  onClose: () => void;
  onApply: (optionId: string) => void;
};

export default function CatchUpDialog({ onClose, onApply }: Props) {
  const [selected, setSelected] = useState("cu-a");

  return (
    <DialogShell
      wide
      label="밀린 분량 분배안"
      title="어제 38p가 밀렸어요"
      subtitle="자료구조 24p · 컴퓨터네트워크 14p · 두 과목 모두 하루 평균 계획의 50%를 넘어서 남은 일정을 다시 짜 봤어요. 운영체제 2단원 보충 학습은 미루지 않고 그대로 둬요."
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="mg-btn mg-btn--ghost mg-btn--lg">
            나중에
          </button>
          <button
            type="button"
            onClick={() => onApply(selected)}
            className="mg-btn mg-btn--solid mg-btn--lg"
          >
            이 안으로 적용
          </button>
        </>
      }
    >
      <AiWait tone="manage" bare label="AI가 밀린 분량을 다시 나누고 있어요">
        <div className="grid gap-2.5 md:grid-cols-3">
        {catchUpOptions.map((option) => {
          const active = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              aria-pressed={active}
              className={`mg-opt flex-col items-stretch gap-2 ${active ? "is-selected" : ""}`}
            >
              <span className="flex items-center gap-2">
                <span className="mg-dot" aria-hidden="true" />
                <span className="text-[12.5px] font-semibold text-[var(--mg-ink)]">{option.title}</span>
              </span>
              <span className="flex flex-col gap-1 pl-[25px]">
                {option.bullets?.map((bullet) => (
                  <span key={bullet} className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--mg-ink-soft)]">
                    <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--mg-muted)]" aria-hidden="true" />
                    {bullet}
                  </span>
                ))}
              </span>
              {option.chip ? (
                <span className="pl-[25px]">
                  <span className="mg-chip">{option.chip}</span>
                </span>
              ) : null}
            </button>
          );
        })}
        </div>

        <div className="mg-card--dashed mt-3.5 rounded-[10px] px-3.5 py-3">
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-[11.5px] leading-relaxed text-[var(--mg-ink-soft)]">
            <span className="font-semibold text-[var(--mg-ink)]">변경 미리보기</span>
            <span className="text-[var(--mg-muted)]">{catchUpPreviews[selected]}</span>
          </p>
        </div>
      </AiWait>
    </DialogShell>
  );
}