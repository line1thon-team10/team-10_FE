import { planCompareNotes, planCompareStats, planCompareWeeks } from "@/mocks/planSetup";

type Props = {
  onBack: () => void;
  onRequestAgain: () => void;
  onApprove: () => void;
};

function hourLabel(hours: number): string {
  if (!hours) return "0h";
  return `${hours}h`;
}

export default function ComparePlans({ onBack, onRequestAgain, onApprove }: Props) {
  return (
    <div className="ps-rise">
      <div className="mt-7 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-[25px] leading-snug text-[var(--ps-ink)] md:text-[31px]">
            기존 안과 새 안을 비교해 보세요
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="ps-compare-chip">요청: 토요일은 쉬기 · 평일에 나눠서</span>
            <span className="ps-compare-chip">유지: 분량 조정 · 목표 · 일정 · 단원</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button type="button" onClick={onRequestAgain} className="ps-btn-ghost">
            요청 바꿔서 다시
          </button>
          <button type="button" onClick={onBack} className="ps-btn-ghost">
            이전 안으로 되돌리기
          </button>
          <button type="button" onClick={onApprove} className="ps-btn-solid">
            이 안으로 승인
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {planCompareStats.map((stat) => (
          <div key={stat.id} className="ps-card px-4 py-3.5">
            <p className="text-[11.5px] text-[var(--ps-muted)]">{stat.label}</p>
            <p className="mt-1.5 flex items-baseline gap-2 text-[17px] leading-none text-[var(--ps-ink)]">
              <span className="text-[14px] text-[var(--ps-muted)]">{stat.before}</span>
              <i className="ri-arrow-right-line text-[12px] leading-none text-[var(--ps-muted)]" />
              <span className="font-semibold">{stat.after}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {planCompareWeeks.map((week) => {
          const isNew = week.id === "after";
          return (
            <div key={week.id} className={`ps-card p-4 sm:p-5 ${isNew ? "ps-compare-new" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                {isNew ? <span className="ps-ai-mark">AI</span> : null}
                <h2 className="text-[14px] font-semibold text-[var(--ps-ink)]">
                  {week.label} · {week.range}
                </h2>
              </div>

              <div className="mt-3.5 grid grid-cols-7 gap-1.5">
                {week.days.map((day) => (
                  <div key={day.id} className={`ps-compare-day ${day.changed ? "is-changed" : ""}`}>
                    <span className="ps-compare-label">{day.label}</span>
                    <span className="ps-compare-bar-wrap">
                      <span
                        className="ps-compare-bar"
                        style={{ height: `${Math.max(3, Math.min(38, day.hours * 16))}px` }}
                      />
                    </span>
                    <span className="ps-compare-hours">{hourLabel(day.hours)}</span>
                    {day.changed ? (
                      <span className="ps-compare-tag">변경</span>
                    ) : (
                      <span className="ps-compare-tag is-empty" aria-hidden="true">
                        변경
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-[10.5px] text-[var(--ps-muted)]">굵은 테두리 = 바뀐 날 · 숫자는 예시</p>

      <div className="ps-compare-notes mt-5">
        <div className="flex items-center gap-2">
          <span className="ps-ai-mark">AI</span>
          <h2 className="text-[13px] font-semibold text-[var(--ps-ink)]">이렇게 바꿨어요</h2>
        </div>
        <ul className="mt-3 flex flex-col gap-2 text-[11.5px] leading-relaxed text-[var(--ps-ink-soft)]">
          {planCompareNotes.map((note) => (
            <li key={note} className="flex items-start gap-2">
              <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--ps-brand)]" aria-hidden="true" />
              <span className="min-w-0">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}