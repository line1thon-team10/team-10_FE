import { useState, type FormEvent } from "react";
import DialogShell from "@/pages/manage/components/DialogShell";
import type { ManageSubject, SubjectField } from "@/pages/manage/types";

type Props = {
  subject: ManageSubject;
  field: SubjectField;
  onClose: () => void;
  onPreview: (payload: { label: string; after: string }) => void;
};

const FIELD_META: Record<SubjectField, { label: string; hint: string }> = {
  range: { label: "시험 범위", hint: "예: 5단원 · 130p" },
  examDate: { label: "시험일", hint: "예: 11/14 (토)" },
  goal: { label: "목표", hint: "예: A+ (커트라인 90점)" },
  progress: { label: "지금까지 본 쪽수", hint: "숫자만 적어 주세요" },
};

const initialValue = (subject: ManageSubject, field: SubjectField) => {
  if (field === "range") return subject.range;
  if (field === "examDate") return subject.examDate;
  if (field === "goal") return subject.goal;
  return String(subject.progressPages);
};

export default function SubjectEditDialog({ subject, field, onClose, onPreview }: Props) {
  const meta = FIELD_META[field];
  const [value, setValue] = useState(() => initialValue(subject, field));
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setError("바꿀 값을 먼저 적어 주세요.");
      return;
    }
    if (field === "progress") {
      const pages = Number(trimmed);
      if (Number.isNaN(pages) || pages < 0 || pages > subject.totalPages) {
        setError(`0에서 ${subject.totalPages} 사이 숫자로 적어 주세요.`);
        return;
      }
      onPreview({ label: meta.label, after: `${pages}/${subject.totalPages}p` });
      return;
    }
    onPreview({ label: meta.label, after: trimmed });
  };

  return (
    <DialogShell
      title={`${subject.name} · ${meta.label} 바꾸기`}
      subtitle="담아 두면 오른쪽 미리보기에서 계산 결과를 확인하고 적용할 수 있어요."
      onClose={onClose}
      label={`${subject.name} ${meta.label}`}
      footer={
        <>
          <button type="button" onClick={onClose} className="mg-btn mg-btn--ghost">
            취소
          </button>
          <button type="submit" form="mg-subject-edit" className="mg-btn mg-btn--solid">
            미리보기에 담기
          </button>
        </>
      }
    >
      <form id="mg-subject-edit" onSubmit={submit}>
        <label htmlFor="mg-subject-field" className="text-[11.5px] font-semibold text-[var(--mg-ink-soft)]">
          {meta.label}
        </label>
        <input
          id="mg-subject-field"
          type={field === "progress" ? "number" : "text"}
          value={value}
          min={field === "progress" ? 0 : undefined}
          max={field === "progress" ? subject.totalPages : undefined}
          onChange={(event) => {
            setValue(event.target.value);
            setError("");
          }}
          placeholder={meta.hint}
          className="mg-field box-border mt-2"
        />
        <p className="mt-2 text-[11px] text-[var(--mg-muted)]">
          {field === "progress"
            ? `전체 ${subject.totalPages}p 중 지금까지 본 쪽수를 적어 주세요.`
            : "기록·점수·쌓인 책은 바뀌지 않아요. 계획만 다시 계산돼요."}
        </p>
        {error ? <p className="mt-2 text-[11.5px] font-semibold text-[#f0a595]">{error}</p> : null}
      </form>
    </DialogShell>
  );
}