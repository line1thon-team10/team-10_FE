import { useState } from "react";
import type { PlanSubject, RepeatItem, SubjectStatus } from "@/pages/plan/types";

const GOAL_OPTIONS = ["A+", "A0", "B+", "B0", "C+", "통과", "패스"];

const STATUS_LABEL: Record<SubjectStatus, string> = {
  ready: "정리됨",
  asking: "추가 질문 중",
  pending: "입력 전",
};

type Props = {
  subjects: PlanSubject[];
  repeats: RepeatItem[];
  onUpdate: (id: string, patch: Partial<PlanSubject>) => void;
};

export default function SummaryPanel({ subjects, repeats, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PlanSubject | null>(null);

  const startEdit = (subject: PlanSubject) => {
    setEditingId(subject.id);
    setDraft({ ...subject });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!draft) return;
    onUpdate(draft.id, {
      name: draft.name.trim() || draft.name,
      examDate: draft.examDate.trim() || draft.examDate,
      goal: draft.goal,
      totalGoal: draft.totalGoal.trim(),
      extraInfo: draft.extraInfo.trim(),
      status: "ready",
    });
    cancelEdit();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="ps-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[14.5px] font-semibold text-[var(--ps-ink)]">정리된 내용</h2>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-[var(--ps-muted)]">
            {subjects.length}과목
          </span>
        </div>

        <div className="mt-4 hidden grid-cols-[1.35fr_0.85fr_0.7fr_1fr] gap-2 border-b border-[var(--ps-line)] pb-2 text-[11px] font-semibold text-[var(--ps-muted)] sm:grid">
          <span>과목</span>
          <span>시험일</span>
          <span>목표</span>
          <span>상태</span>
        </div>

        <div className="divide-y divide-[var(--ps-line)]">
          {subjects.map((subject) => {
            const isEditing = editingId === subject.id;
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => (isEditing ? cancelEdit() : startEdit(subject))}
                aria-expanded={isEditing}
                className={`grid w-full cursor-pointer grid-cols-[1.35fr_auto] items-center gap-x-2 gap-y-1 py-3 text-left transition-colors sm:grid-cols-[1.35fr_0.85fr_0.7fr_1fr] ${
                  isEditing ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-[var(--ps-brand)]" />
                  <span className="truncate text-[12.5px] font-medium text-[var(--ps-ink)]">{subject.name}</span>
                </span>
                <span className="hidden text-[12px] text-[var(--ps-muted)] sm:block">{subject.examDate}</span>
                <span className="hidden text-[12px] sm:block">
                  {subject.goal ? (
                    <span className="text-[var(--ps-ink-soft)]">{subject.goal}</span>
                  ) : (
                    <span className="text-[var(--ps-muted)]">[목표]</span>
                  )}
                </span>
                <span className="flex items-center justify-end gap-1.5 sm:justify-start">
                  <span
                    className={`inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-1 text-[10px] font-semibold ${
                      subject.status === "ready"
                        ? "bg-[var(--ps-brand-tint)] text-[var(--ps-brand-deep)]"
                        : subject.status === "asking"
                          ? "bg-white/[0.1] text-[var(--ps-ink)]"
                          : "bg-white/[0.04] text-[var(--ps-muted)]"
                    }`}
                  >
                    {STATUS_LABEL[subject.status]}
                  </span>
                  <i
                    className={`text-[12px] leading-none text-[var(--ps-muted)] ${
                      isEditing ? "ri-arrow-up-s-line" : "ri-edit-line"
                    }`}
                  />
                </span>
                <span className="col-span-2 flex flex-wrap items-center gap-x-2 text-[11px] text-[var(--ps-muted)] sm:hidden">
                  <span>{subject.examDate}</span>
                  <span>·</span>
                  <span>{subject.goal || "목표 미정"}</span>
                </span>
              </button>
            );
          })}
        </div>

        {editingId && draft ? (
          <div className="mt-2 rounded-xl border border-[var(--ps-brand-line)] bg-white/[0.03] p-3.5">
            <p className="text-[11.5px] font-semibold text-[var(--ps-brand-deep)]">과목 정보 고치기</p>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              <label className="min-w-0">
                <span className="text-[11px] text-[var(--ps-muted)]">과목 이름</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  className="ps-field mt-1"
                  placeholder="예: 자료구조"
                />
              </label>
              <label className="min-w-0">
                <span className="text-[11px] text-[var(--ps-muted)]">시험일</span>
                <input
                  type="text"
                  value={draft.examDate}
                  onChange={(event) => setDraft({ ...draft, examDate: event.target.value })}
                  className="ps-field mt-1"
                  placeholder="예: 11/16"
                />
              </label>
              <label className="min-w-0">
                <span className="text-[11px] text-[var(--ps-muted)]">목표 학점</span>
                <select
                  value={draft.goal}
                  onChange={(event) => setDraft({ ...draft, goal: event.target.value })}
                  className="ps-field mt-1"
                >
                  <option value="">목표를 골라 주세요</option>
                  {GOAL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="min-w-0">
                <span className="text-[11px] text-[var(--ps-muted)]">시험 총 목표 (커트라인·합격 기준)</span>
                <input
                  type="text"
                  value={draft.totalGoal}
                  onChange={(event) => setDraft({ ...draft, totalGoal: event.target.value })}
                  className="ps-field mt-1"
                  placeholder="예: 상대평가 상위 15% · 커트라인 90점"
                />
              </label>
              <label className="min-w-0 sm:col-span-2">
                <span className="text-[11px] text-[var(--ps-muted)]">기타 정보 (반영 비율·교수님 강조 범위)</span>
                <input
                  type="text"
                  value={draft.extraInfo}
                  onChange={(event) => setDraft({ ...draft, extraInfo: event.target.value })}
                  className="ps-field mt-1"
                  placeholder="예: 중간 40% · 기말 40% · 교수님 강조 3단원 트리"
                />
              </label>
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button type="button" onClick={cancelEdit} className="ps-btn-ghost">
                취소
              </button>
              <button type="button" onClick={saveEdit} className="ps-btn-solid">
                저장
              </button>
            </div>
          </div>
        ) : null}

        <p className="mt-4 text-[11px] leading-relaxed text-[var(--ps-muted)]">
          받은 정보: 교수님 강조 범위 · 학습 기준 · 등급·학점 기준 · 시험 반영 비율
        </p>
      </div>

      <div className="ps-card p-5">
        <h2 className="text-[14.5px] font-semibold text-[var(--ps-ink)]">반복 일정</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {repeats.map((repeat) => (
            <li key={repeat.id} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--ps-ink-soft)]">
              <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-[var(--ps-brand)]" />
              <span className="min-w-0">
                <strong className="font-semibold text-[var(--ps-ink)]">{repeat.label}</strong>
                <span className="text-[var(--ps-muted)]"> {repeat.time}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-[var(--ps-muted)]">
          모든 과목의 목표가 구체적으로 정해지면 다음 단계로 갈 수 있어요.
        </p>
      </div>
    </div>
  );
}