import { useMemo, useState } from "react";
import type { PlanAllocation, PlanSubject, PlanUnit } from "@/pages/plan/types";
import { daysUntil, unitPages } from "@/pages/plan/utils";
import { planTaskGroups, planTaskSubjects } from "@/mocks/planSetup";
import TaskSplitPanel from "./TaskSplitPanel";
import ResplitDialog from "./ResplitDialog";
import ComparePlans from "./ComparePlans";

type Props = {
  subjects: PlanSubject[];
  units: PlanUnit[];
  onPrev: () => void;
  onApprove: (allocations: PlanAllocation[]) => void;
};

export default function StepAmount({ subjects, units, onPrev, onApprove }: Props) {
  const [activeId, setActiveId] = useState(planTaskSubjects[0].id);
  const [resplitOpen, setResplitOpen] = useState(false);
  const [comparing, setComparing] = useState(false);

  const allocations = useMemo<PlanAllocation[]>(
    () =>
      subjects.map((subject) => {
        const confirmed = units.filter((unit) => unit.subjectId === subject.id && unit.confirmed);
        const source = confirmed.length
          ? confirmed
          : units.filter((unit) => unit.subjectId === subject.id);
        const pages = source.reduce((sum, unit) => sum + unitPages(unit.startPage, unit.endPage), 0);
        const days = Math.max(1, daysUntil(subject.examDate) - 1);
        return { subjectId: subject.id, perDay: pages ? Math.max(5, Math.ceil(pages / days)) : 0 };
      }),
    [subjects, units],
  );

  const totalPages = planTaskSubjects.reduce((sum, item) => sum + item.pages, 0);
  const totalTasks = planTaskSubjects.reduce((sum, item) => sum + item.tasks, 0);
  const activeSubject = planTaskSubjects.find((item) => item.id === activeId) ?? planTaskSubjects[0];
  const activeGroups = planTaskGroups[activeSubject.id] ?? [];

  const approve = () => onApprove(allocations);

  if (comparing) {
    return (
      <ComparePlans
        onBack={() => setComparing(false)}
        onRequestAgain={() => {
          setComparing(false);
          setResplitOpen(true);
        }}
        onApprove={approve}
      />
    );
  }

  return (
    <div className="ps-rise">
      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[23px] leading-snug text-[var(--ps-ink)] md:text-[29px]">
            강의자료 {totalPages}페이지를 태스크 {totalTasks}개로 나눴어요
          </h1>
          <p className="mt-2.5 max-w-[620px] text-[13px] leading-relaxed text-[var(--ps-muted)]">
            단원 막대가 15~60분짜리 블록으로 쪼개져요
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button type="button" onClick={onPrev} className="ps-btn-ghost">
            이전
          </button>
          <button type="button" onClick={() => setResplitOpen(true)} className="ps-btn-ghost">
            <i className="ri-shuffle-line text-[13px] leading-none" />
            다시 나누기
          </button>
          <button type="button" onClick={approve} className="ps-btn-solid">
            이대로 계획 확정
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {planTaskSubjects.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              aria-pressed={isActive}
              className={`cursor-pointer whitespace-nowrap rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
                isActive
                  ? "border-transparent bg-[var(--ps-solid)] text-[var(--ps-solid-ink)]"
                  : "border-[var(--ps-line-strong)] text-[var(--ps-ink-soft)] hover:border-[var(--ps-ink-soft)] hover:bg-white/[0.04]"
              }`}
            >
              {item.label} · {item.pages}p · {item.tasks}개
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <TaskSplitPanel groups={activeGroups} totalPages={totalPages} totalTasks={totalTasks} />
      </div>

      <p className="mt-5 text-[11.5px] leading-relaxed text-[var(--ps-muted)]">
        이대로 확정하면 기록 화면에서 태스크 블록으로 하나씩 쌓입니다. 마음에 안 들면 다시 나누기로 배치만 새로 짤
        수 있어요.
      </p>

      {resplitOpen ? (
        <ResplitDialog
          subjectLabel={activeSubject.label}
          onCancel={() => setResplitOpen(false)}
          onSubmit={() => {
            setResplitOpen(false);
            setComparing(true);
          }}
        />
      ) : null}
    </div>
  );
}