const STEPS = ["일정·목표", "캘린더 확인", "자료 올리기", "단원 확인", "분량 확인"];

type Props = {
  current: number;
  reached: number;
  onSelect: (step: number) => void;
};

export default function PlanStepper({ current, reached, onSelect }: Props) {
  return (
    <div className="ps-cal-scroll pb-1">
      <div className="ps-steps">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const isDone = step < current;
          const isActive = step === current;
          const className = ["ps-step", isDone ? "is-done" : "", isActive ? "is-active" : ""]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(step)}
              aria-current={isActive ? "step" : undefined}
              aria-label={`${step}단계 ${label}`}
              aria-disabled={step > reached}
              className={className}
            >
              <span className="ps-step-track">
                <span
                  className={`ps-step-line ${index === 0 ? "is-hidden" : ""} ${isDone || isActive ? "is-on" : ""}`}
                  aria-hidden="true"
                />
                <span className="ps-step-dot">
                  {isDone ? <i className="ri-check-line text-[14px] leading-none" /> : step}
                </span>
                <span
                  className={`ps-step-line ${index === STEPS.length - 1 ? "is-hidden" : ""} ${isDone ? "is-on" : ""}`}
                  aria-hidden="true"
                />
              </span>
              <span className="ps-step-label">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}