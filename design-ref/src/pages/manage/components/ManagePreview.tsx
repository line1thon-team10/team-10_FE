import type { ManageSubject, PendingChange } from "@/pages/manage/types";

type Props = {
  subjects: ManageSubject[];
  pending: PendingChange | null;
  onCancel: () => void;
  onApply: () => void;
};

export default function ManagePreview({ subjects, pending, onCancel, onApply }: Props) {
  const pendingSubject = subjects.find((subject) => subject.id === pending?.subjectId) ?? null;

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
      <div className="mg-card--dashed rounded-[14px] p-4">
        <div className="flex items-center gap-2">
          <span className="mg-ai-mark">AI</span>
          <h2 className="text-[13px] font-semibold text-[var(--mg-ink)]">바뀌는 것 미리보기</h2>
        </div>
        <p className="mt-2.5 text-[11px] leading-relaxed text-[var(--mg-muted)]">
          예시 · 운영체제 목표 B+ → A
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--mg-ink-soft)]">
          계획 엔진이 다시 계산해요. 바뀌는 건 계획뿐이고, 내일(11/10) 계획부터 반영돼요.
        </p>

        {pending ? (
          <p className="mt-3">
            <span className="mg-chip mg-chip--brand">
              {pendingSubject?.name} · {pending.label} 변경
            </span>
          </p>
        ) : null}

        <table className="mg-table mt-4">
          <thead>
            <tr>
              <th scope="col">과목</th>
              <th scope="col" className="text-right">
                하루 평균
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => {
              const isTarget = pending?.subjectId === subject.id;
              return (
                <tr key={subject.id}>
                  <td className="pr-3">{subject.name}</td>
                  <td className="text-right tabular-nums">
                    <span className="mg-before">[{isTarget ? pending.before : "지금"}]</span>
                    <span className="mx-1.5 text-[var(--mg-muted)]">→</span>
                    {isTarget ? (
                      <span className="mg-after">[{pending.after}]</span>
                    ) : (
                      <span className="text-[var(--mg-muted)]">[바뀐 값]</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="mt-3 text-[11px] leading-relaxed text-[var(--mg-muted)]">
          값은 계획 엔진이 계산해요. 시험일·범위 변경이면 이 표 대신 ‘바뀌는 날’ 목록으로 보여줘요.
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={!pending} className="mg-btn mg-btn--ghost">
            취소
          </button>
          <button type="button" onClick={onApply} disabled={!pending} className="mg-btn mg-btn--solid">
            적용
          </button>
        </div>
      </div>

      <div className="mg-card p-4">
        <h3 className="text-[12.5px] font-semibold text-[var(--mg-ink)]">과목 빼기를 누르면</h3>
        <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--mg-muted)]">
          확인 후 그 과목 태스크를 지우고, 빈 시간은 빈 시간 제안처럼 AI가 3안을 보여줘요. 기록과 쌓인 책은
          그대로 보관해요.
        </p>
      </div>
    </aside>
  );
}