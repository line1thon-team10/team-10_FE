import { useState, type FormEvent } from "react";
import SummaryPanel from "./SummaryPanel";
import GoalChat from "./GoalChat";
import { planQuickExamples } from "@/mocks/planSetup";
import type { PlanSubject, RepeatItem } from "@/pages/plan/types";

type Props = {
  subjects: PlanSubject[];
  repeats: RepeatItem[];
  onUpdateSubject: (id: string, patch: Partial<PlanSubject>) => void;
  onAddSubject: (text: string) => boolean;
  onReplaceSubjects: (list: PlanSubject[]) => void;
  onNext: () => void;
  /** 관리 화면 [과목 추가]에서 새 과목 하나만 넣는 흐름 */
  mode?: "create" | "add";
};

const TIPS = [
  "시험일은 11/16 처럼 적으면 돼요. 11월 16일도 괜찮아요.",
  "목표는 A+, B0, 패스처럼 한 단어로 적어 주세요.",
  "한 번에 한 과목씩 적으면 정확하게 들어갑니다.",
];

export default function StepGoal({
  subjects,
  repeats,
  onUpdateSubject,
  onAddSubject,
  onReplaceSubjects,
  onNext,
  mode = "create",
}: Props) {
  const isAdd = mode === "add";
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showTip, setShowTip] = useState(false);
  const [directOpen, setDirectOpen] = useState(isAdd);

  const allReady = subjects.length > 0 && subjects.every((subject) => subject.status === "ready");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      setError("과목과 시험일을 함께 적어 주세요. 예: 운영체제 11/16 B+");
      return;
    }
    const added = onAddSubject(input);
    if (!added) {
      setError("과목 이름과 시험일(예: 11/16)을 함께 적어 주세요.");
      return;
    }
    setInput("");
    setError("");
  };

  const fillExample = (example: string) => {
    setInput(example);
    setError("");
  };

  return (
    <div className="ps-rise">
      <h1 className="mt-7 text-[25px] leading-snug text-[var(--ps-ink)] md:text-[31px]">
        {isAdd ? "추가할 과목의 일정과 목표를 적어 주세요" : "일정과 시험, 목표를 적어 주세요"}
      </h1>
      <p className="mt-2.5 max-w-[640px] text-[13px] leading-relaxed text-[var(--ps-muted)]">
        {isAdd
          ? "새 과목 하나만 입력하면 자료·시험 범위·바뀌는 날 순서로 이어서 넣어요. 기존 과목과 계획은 그대로 둡니다."
          : "말로 편하게 적으면 AI가 과목·시험일·목표로 정리해요. 알바·수업·약속 같은 고정 일정도 함께 말해 주세요."}
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="ps-card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--ps-line)] px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="ps-mark">
                <i className="ri-list-check-2 text-[14px] leading-none" />
              </span>
              <h2 className="truncate text-[13.5px] font-semibold text-[var(--ps-ink)]">일정·목표 정리</h2>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10.5px] font-medium text-[var(--ps-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ps-brand)]" />
              {isAdd ? "직접 입력" : "AI와 대화"}
            </span>
          </div>

          {isAdd ? null : (
            <GoalChat onImport={onReplaceSubjects} onUpdate={onUpdateSubject} />
          )}

          <div className={isAdd ? "px-5 pb-5 pt-4" : "border-t border-[var(--ps-line)] px-5 pb-5 pt-4"}>
            <button
              type="button"
              onClick={() => setDirectOpen((prev) => !prev)}
              aria-expanded={directOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-[var(--ps-line)] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--ps-line-strong)] hover:bg-white/[0.03]"
            >
              <span className="text-[12px] font-medium text-[var(--ps-ink-soft)]">직접 넣기</span>
              <i
                className={`text-[14px] leading-none text-[var(--ps-muted)] ${
                  directOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
                }`}
              />
            </button>

            {directOpen ? (
              <div className="mt-3 flex flex-col gap-3.5">
                <div className="ps-soft px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ps-muted)]">
                    이렇게 적으면 바로 들어가요
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {planQuickExamples.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => fillExample(example)}
                        className="ps-chip"
                      >
                        <i className="ri-add-line text-[12px] leading-none" />
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-1">
                  <label htmlFor="plan-quick-add" className="text-[11.5px] font-medium text-[var(--ps-muted)]">
                    과목 · 시험일 · 목표
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="plan-quick-add"
                      name="plan_quick_add"
                      type="text"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="예: 운영체제 11/16 B+ 이상"
                      className="ps-field box-border min-w-0 flex-1"
                      autoComplete="off"
                    />
                    <button type="submit" className="ps-btn-solid justify-center px-5">
                      추가
                    </button>
                  </div>
                  {error ? (
                    <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--ps-brand-deep)]">
                      <i className="ri-error-warning-line mt-0.5 text-[13px] leading-none" />
                      {error}
                    </p>
                  ) : null}
                </form>

                <button
                  type="button"
                  onClick={() => setShowTip((prev) => !prev)}
                  aria-expanded={showTip}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-[var(--ps-line)] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--ps-line-strong)] hover:bg-white/[0.03]"
                >
                  <span className="text-[12px] font-medium text-[var(--ps-ink-soft)]">적는 요령 보기</span>
                  <i
                    className={`text-[14px] leading-none text-[var(--ps-muted)] ${
                      showTip ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
                    }`}
                  />
                </button>

                {showTip ? (
                  <ul className="flex flex-col gap-2 rounded-xl bg-white/[0.02] p-3.5">
                    {TIPS.map((tip) => (
                      <li
                        key={tip}
                        className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[var(--ps-ink-soft)]"
                      >
                        <i className="ri-check-line mt-0.5 text-[12px] leading-none text-[var(--ps-brand-deep)]" />
                        <span className="min-w-0">{tip}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <SummaryPanel subjects={subjects} repeats={repeats} onUpdate={onUpdateSubject} />
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--ps-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-[11.5px] leading-relaxed ${
            allReady ? "text-[var(--ps-muted)]" : "text-[var(--ps-brand-deep)]"
          }`}
        >
          {allReady
            ? "정리된 내용은 언제든 고칠 수 있어요. 다음 단계에서 빈 시간에만 공부 계획을 넣습니다."
            : "모든 과목의 목표가 정해져야 다음 단계로 갈 수 있어요."}
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={!allReady}
          className="ps-btn-solid w-full justify-center disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          다음: 캘린더 확인
          <i className="ri-arrow-right-line text-[14px] leading-none" />
        </button>
      </div>
    </div>
  );
}