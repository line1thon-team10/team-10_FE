import type { ManageSubject, SubjectField } from "@/pages/manage/types";

type Props = {
  subject: ManageSubject;
  onEdit: (field: SubjectField) => void;
  onRemove: () => void;
};

const EDIT_BUTTONS: { field: SubjectField; label: string }[] = [
  { field: "range", label: "범위 고치기" },
  { field: "examDate", label: "시험일 바꾸기" },
  { field: "goal", label: "목표 바꾸기" },
];

export default function SubjectCard({ subject, onEdit, onRemove }: Props) {
  const percent = subject.totalPages > 0 ? (subject.progressPages / subject.totalPages) * 100 : 0;

  return (
    <article className={`mg-subject mg-accent-${subject.accent}`}>
      <div className="flex flex-col gap-4 pl-2 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h3 className="text-[16px] text-[var(--mg-ink)]">{subject.name}</h3>
            <span className="mg-chip mg-chip--brand">{subject.dDay}</span>
          </div>

          <dl className="mt-3 grid grid-cols-[58px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[12.5px]">
            <dt className="text-[var(--mg-muted)]">시험일</dt>
            <dd className="text-[var(--mg-ink-soft)] tabular-nums">
              {subject.examDate} · {subject.dDay}
            </dd>
            <dt className="text-[var(--mg-muted)]">목표</dt>
            <dd className="text-[var(--mg-ink-soft)]">{subject.goal}</dd>
            <dt className="text-[var(--mg-muted)]">범위</dt>
            <dd className="text-[var(--mg-ink-soft)]">{subject.range}</dd>
            <dt className="text-[var(--mg-muted)]">진도</dt>
            <dd className="text-[var(--mg-ink-soft)] tabular-nums">
              {subject.progressPages}/{subject.totalPages}p · {percent.toFixed(1)}%
            </dd>
          </dl>

          <div className="mg-bar mt-3 max-w-[280px]">
            <span style={{ width: `${Math.min(percent, 100)}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:max-w-[266px] lg:shrink-0">
          {EDIT_BUTTONS.map((item) => (
            <button
              key={item.field}
              type="button"
              onClick={() => onEdit(item.field)}
              className="mg-btn mg-btn--ghost"
            >
              {item.label}
            </button>
          ))}
          <button type="button" onClick={onRemove} className="mg-btn mg-btn--ghost text-[var(--mg-muted)]">
            과목 빼기
          </button>
        </div>
      </div>
    </article>
  );
}