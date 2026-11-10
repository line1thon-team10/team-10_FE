import DialogShell from "@/pages/manage/components/DialogShell";
import { paceFootnote, paceNote, paceRows } from "@/mocks/managePlan";

type Props = {
  onClose: () => void;
  onApply: () => void;
  subject?: string;
};

export default function PaceDialog({ onClose, onApply, subject = "자료구조" }: Props) {
  return (
    <DialogShell
      label="속도 보정 알림"
      title={`${subject}는 예상보다 1.4배 걸려요`}
      subtitle="1페이지당 3.5분 걸렸어요(예상 2.5분). 남은 태스크 시간을 늘릴까요?"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="mg-btn mg-btn--ghost mg-btn--lg">
            그대로
          </button>
          <button type="button" onClick={onApply} className="mg-btn mg-btn--solid mg-btn--lg">
            반영
          </button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="h-2 w-2 rounded-[2px]" style={{ background: "var(--mg-good)" }} aria-hidden="true" />
        <p className="text-[11.5px] text-[var(--mg-ink-soft)]">
          {subject} · 최근 3일 집중 모드 기록 3회
        </p>
        <span className="mg-chip">예시 값</span>
      </div>

      <table className="mg-table mt-3">
        <thead>
          <tr>
            <th scope="col">남은 태스크</th>
            <th scope="col" className="w-[72px] text-right">
              지금
            </th>
            <th scope="col" className="w-[104px] text-right">
              반영하면
            </th>
          </tr>
        </thead>
        <tbody>
          {paceRows.map((row) => (
            <tr key={row.id}>
              <td className="pr-3 leading-relaxed text-[var(--mg-ink-soft)]">{row.task}</td>
              <td className="text-right tabular-nums text-[var(--mg-muted)]">{row.now}</td>
              <td className="text-right tabular-nums font-semibold text-[var(--mg-ink)]">{row.after}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--mg-ink-soft)]">{paceNote}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--mg-muted)]">{paceFootnote}</p>
    </DialogShell>
  );
}