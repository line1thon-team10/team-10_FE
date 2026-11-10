import type { AddedPlan } from "@/pages/manage/types";
import { todayPlanNote } from "@/mocks/managePlan";

type Props = {
  addedPlans: AddedPlan[];
  extraMinutes: number;
  resting: boolean;
  onAddTime: () => void;
  onRest: () => void;
  onRebuild: () => void;
};

export default function TodayPlanCard({
  addedPlans,
  extraMinutes,
  resting,
  onAddTime,
  onRest,
  onRebuild,
}: Props) {
  return (
    <section className="mg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-[14px] font-semibold text-[var(--mg-ink)]">오늘 계획</h2>
        <p className="text-[11.5px] text-[var(--mg-muted)]">
          {resting
            ? "오늘은 쉬는 날로 바꿨어요 · 남은 태스크는 뒤 날로 나눠 넣었어요"
            : extraMinutes > 0
              ? `오늘 목표에 ${extraMinutes}분을 더했어요`
              : "계획은 오늘 기준으로 다시 그려져요"}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button type="button" onClick={onAddTime} className="mg-btn mg-btn--solid mg-btn--lg justify-center">
          <i className="ri-add-line text-[13px] leading-none" />
          30분 더 하기
        </button>
        <button type="button" onClick={onRest} className="mg-btn mg-btn--ghost mg-btn--lg justify-center">
          오늘 쉬기
        </button>
        <button type="button" onClick={onRebuild} className="mg-btn mg-btn--ghost mg-btn--lg justify-center">
          계획 다시 만들기
        </button>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[var(--mg-muted)]">{todayPlanNote}</p>

      {addedPlans.length > 0 ? (
        <div className="mt-4 border-t border-[var(--mg-line)] pt-3.5">
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--mg-brand-deep)]">
            <i className="ri-checkbox-circle-line text-[13px] leading-none" />
            따로 넣은 계획 {addedPlans.length}개
          </p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {addedPlans.map((plan) => (
              <li key={plan.id} className="mg-plan-item mg-accent-blue">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-[12.5px] text-[var(--mg-ink)]">
                    {plan.subject} · {plan.range}
                  </p>
                  <p className="text-[11.5px] tabular-nums text-[var(--mg-muted)]">
                    {plan.days} · 총 {plan.minutes}분
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}