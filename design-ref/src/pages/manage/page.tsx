import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./manage.css";
import ManageHeader from "./components/ManageHeader";
import SubjectCard from "./components/SubjectCard";
import ManagePreview from "./components/ManagePreview";
import TodayPlanCard from "./components/TodayPlanCard";
import SubjectEditDialog from "./components/SubjectEditDialog";
import PlanAddDialog from "./components/PlanAddDialog";
import PaceDialog from "./components/PaceDialog";
import CatchUpDialog from "./components/CatchUpDialog";
import EmptyTimeDialog from "./components/EmptyTimeDialog";
import BookBoxDialog from "@/components/feature/BookBoxDialog";
import { finishedSubjectsNote, initialAddedPlans, manageSubjects, pendingEmptyTime } from "@/mocks/managePlan";
import type { AddedPlan, ManageSubject, PendingChange, SubjectField } from "./types";

const beforeOf = (subject: ManageSubject, field: SubjectField) => {
  if (field === "range") return subject.range;
  if (field === "examDate") return subject.examDate;
  if (field === "goal") return subject.goal;
  return `${subject.progressPages}/${subject.totalPages}p`;
};

const RANGE_SUBJECT_ID: Record<string, string> = {
  "mg-ds": "sub-data",
  "mg-os": "sub-os",
  "mg-net": "sub-network",
};

const ALERTS = [
  { id: "pace", icon: "ri-speed-up-line", label: "속도 보정 알림", detail: "자료구조 1.4배" },
  { id: "empty", icon: "ri-calendar-schedule-line", label: "빈 시간 제안", detail: "11/13 18–22시" },
  { id: "catch", icon: "ri-arrow-go-back-line", label: "밀린 분량 정리", detail: "어제 38p" },
];

type AlertId = "pace" | "empty" | "catch";

export default function ManagePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [subjects, setSubjects] = useState<ManageSubject[]>(() => manageSubjects.map((item) => ({ ...item })));
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [editing, setEditing] = useState<{ subjectId: string; field: SubjectField } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<ManageSubject | null>(null);
  const [alert, setAlert] = useState<AlertId | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addedPlans, setAddedPlans] = useState<AddedPlan[]>(() => initialAddedPlans.map((item) => ({ ...item })));
  const [extraMinutes, setExtraMinutes] = useState(0);
  const [resting, setResting] = useState(false);
  const [toast, setToast] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  useEffect(() => {
    document.title = "피뢰침 | 과목·계획 관리";
    const desc = document.querySelector('meta[name="description"]');
    const text =
      "과목별 시험일과 목표, 범위, 진도를 한 화면에서 관리하고 바뀌는 계획을 미리 확인한 뒤 적용하는 피뢰침의 관리 화면입니다.";
    if (desc) desc.setAttribute("content", text);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = text;
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // /plan?add=1 온보딩과 범위 고치기에서 돌아왔을 때 결과를 반영합니다.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const added = params.get("added");
    const range = params.get("range");
    if (!added && !range) return;
    if (added) {
      setSubjects((prev) => [
        ...prev,
        {
          id: `mg-added-${Date.now()}`,
          name: added,
          examDate: "11/20 (금)",
          dDay: "D-11",
          goal: "B+ 이상",
          range: "4단원 · 120p",
          progressPages: 0,
          totalPages: 120,
          accent: "blue",
        },
      ]);
      setToast("과목을 추가했어요");
    }
    if (range) {
      setPending({
        subjectId: RANGE_SUBJECT_ID[range] ?? "mg-ds",
        field: "range",
        label: "범위",
        before: "5단원 · 140p",
        after: "4단원 · 120p",
      });
      setToast("범위 변경을 미리보기에 담았어요. 오른쪽에서 확인하고 적용해요.");
    }
    navigate("/manage", { replace: true });
  }, [location.search, navigate]);

  const editingSubject = subjects.find((item) => item.id === editing?.subjectId) ?? null;

  const preview = (payload: { label: string; after: string }) => {
    if (!editing || !editingSubject) return;
    setPending({
      subjectId: editing.subjectId,
      field: editing.field,
      label: payload.label,
      before: beforeOf(editingSubject, editing.field),
      after: payload.after,
    });
    setEditing(null);
    setToast("미리보기에 담았어요. 오른쪽에서 확인하고 적용해요.");
  };

  const applyPending = () => {
    if (!pending) return;
    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id !== pending.subjectId) return subject;
        if (pending.field === "range") return { ...subject, range: pending.after };
        if (pending.field === "examDate") return { ...subject, examDate: pending.after };
        if (pending.field === "goal") return { ...subject, goal: pending.after };
        const pages = Number.parseInt(pending.after, 10);
        return { ...subject, progressPages: Number.isNaN(pages) ? subject.progressPages : pages };
      }),
    );
    setPending(null);
    setToast("바뀐 값을 적용했어요. 내일(11/10) 계획부터 반영돼요.");
  };

  const removeSubject = () => {
    if (!removeTarget) return;
    setSubjects((prev) => prev.filter((item) => item.id !== removeTarget.id));
    if (pending?.subjectId === removeTarget.id) setPending(null);
    setToast(`${removeTarget.name} 과목을 뺐어요. 기록과 쌓인 책은 그대로 남아 있어요.`);
    setRemoveTarget(null);
  };

  const addPlan = (plan: Omit<AddedPlan, "id">) => {
    setAddedPlans((prev) => [...prev, { ...plan, id: `ap-${Date.now()}` }]);
    setAddOpen(false);
    setToast(`${plan.subject} ${plan.range} 계획을 넣었어요.`);
  };

  return (
    <div className="mg-scope flex min-h-screen w-full flex-col bg-[var(--mg-paper)]">
      <ManageHeader />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-14 pt-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[26px] leading-tight text-[var(--mg-ink)] md:text-[32px]">과목·계획 관리</h1>
            <p className="mt-2.5 max-w-[620px] text-[13px] leading-relaxed text-[var(--mg-muted)]">
              무엇을 바꾸든 바뀌는 날 먼저 보여주고, 확인해야 적용돼요. 기록·점수·쌓인 책은 그대로예요.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/plan?add=1")}
            className="mg-btn mg-btn--ghost mg-btn--lg shrink-0 self-start md:self-auto"
          >
            <i className="ri-add-line text-[13px] leading-none" />
            과목 추가
          </button>
        </div>

        <div className="mg-rise mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--mg-muted)]">
            AI 제안 · 놓친 제안 다시 보기
          </span>
          {ALERTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAlert(item.id as AlertId)}
              className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border border-[var(--mg-line)] bg-white/[0.02] px-3 py-1.5 text-[11.5px] text-[var(--mg-ink-soft)] transition-colors hover:border-[var(--mg-brand-line)] hover:text-[var(--mg-ink)]"
            >
              <i className={`${item.icon} text-[13px] leading-none text-[var(--mg-brand-deep)]`} />
              {item.label}
              <span className="text-[var(--mg-muted)]">{item.detail}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.9fr_1fr] lg:gap-7">
          <div className="min-w-0">
            <div className="flex flex-col gap-3">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onEdit={(field) => {
                    if (field === "range") {
                      navigate(`/plan?step=4&subject=${RANGE_SUBJECT_ID[subject.id] ?? "sub-data"}`);
                      return;
                    }
                    setEditing({ subjectId: subject.id, field });
                  }}
                  onRemove={() => setRemoveTarget(subject)}
                />
              ))}

              {subjects.length === 0 ? (
                <div className="mg-card--dashed rounded-[14px] px-5 py-10 text-center">
                  <p className="text-[13px] text-[var(--mg-ink)]">아직 관리할 과목이 없어요</p>
                  <p className="mt-1.5 text-[11.5px] text-[var(--mg-muted)]">
                    과목 추가를 누르면 자료·범위·목표까지 이어서 넣을 수 있어요.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              <TodayPlanCard
                addedPlans={addedPlans}
                extraMinutes={extraMinutes}
                resting={resting}
                onAddTime={() => {
                  setExtraMinutes((prev) => prev + 30);
                  setResting(false);
                  setToast("오늘 계획에 30분을 더했어요. 다음 태스크 1개를 오늘로 옮겼어요.");
                }}
                onRest={() => {
                  setResting(true);
                  setToast("오늘은 쉬는 날로 바꿨어요. 남은 태스크는 뒤 날로 나눠 넣었어요.");
                }}
                onRebuild={() => navigate("/plan?new=1")}
              />
            </div>

            <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--mg-muted)]">
              <i className="ri-information-line mt-0.5 text-[12px] leading-none" />
              {finishedSubjectsNote}
            </p>
          </div>

          <ManagePreview
            subjects={subjects}
            pending={pending}
            onCancel={() => setPending(null)}
            onApply={applyPending}
          />
        </div>
      </main>

      <footer className="border-t border-[var(--mg-line)] bg-[var(--mg-paper-warm)]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-[11.5px] text-[var(--mg-muted)] sm:flex-row md:px-8">
          <p>© 2026 피뢰침. 계획이 바뀌어도 기록은 그대로.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--mg-brand)]" aria-hidden="true" />
            적용 전에는 항상 미리보기부터
          </p>
        </div>
      </footer>

      {editing && editingSubject ? (
        <SubjectEditDialog
          subject={editingSubject}
          field={editing.field}
          onClose={() => setEditing(null)}
          onPreview={preview}
        />
      ) : null}

      {removeTarget ? (
        <div className="mg-scope">
          <div
            className="mg-overlay"
            role="presentation"
            onClick={(event) => {
              if (event.target === event.currentTarget) setRemoveTarget(null);
            }}
          >
            <div className="mg-modal mg-rise" role="dialog" aria-modal="true" aria-label="과목 빼기 확인">
              <h2 className="text-[17px] text-[var(--mg-ink)]">{removeTarget.name} 과목을 뺄까요?</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--mg-muted)]">
                이 과목의 남은 태스크를 지우고, 비는 시간은 빈 시간 제안에서 다시 짜요. 기록·점수·쌓인 책은 그대로
                보관해요.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2 border-t border-[var(--mg-line)] pt-4">
                <button type="button" onClick={() => setRemoveTarget(null)} className="mg-btn mg-btn--ghost">
                  취소
                </button>
                <button type="button" onClick={removeSubject} className="mg-btn mg-btn--solid">
                  과목 빼기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {addOpen ? <PlanAddDialog onClose={() => setAddOpen(false)} onAdd={addPlan} /> : null}

      {alert === "pace" ? (
        <PaceDialog
          onClose={() => setAlert(null)}
          onApply={() => {
            setAlert(null);
            setToast("걸린 시간에 맞춰 남은 태스크 시간을 늘렸어요. 넘치는 태스크는 옆 날로 옮겼어요.");
          }}
        />
      ) : null}

      {alert === "catch" ? (
        <CatchUpDialog
          onClose={() => setAlert(null)}
          onApply={() => {
            setAlert(null);
            setToast("분배안을 적용했어요. 11/10 오후에 밀린 범위를 채워 넣었어요.");
            setRecoveryOpen(true);
          }}
        />
      ) : null}

      {alert === "empty" ? (
        <EmptyTimeDialog
          onClose={() => setAlert(null)}
          onApply={(optionId) => {
            setAlert(null);
            setToast(
              optionId === "et-move"
                ? "11/13 18:00–18:50에 운영체제 4단원을 앞당겨 넣었어요."
                : "계획은 바꾸지 않고 그대로 쉬기로 했어요.",
            );
          }}
        />
      ) : null}

      {toast ? (
        <div className="mg-toast mg-rise" role="status">
          {toast}
        </div>
      ) : null}

      {recoveryOpen ? (
        <BookBoxDialog
          variant="recovery"
          percent={0}
          books={0}
          onClose={() => setRecoveryOpen(false)}
        />
      ) : null}
    </div>
  );
}