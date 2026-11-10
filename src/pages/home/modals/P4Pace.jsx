// P4 속도 보정 알림 (팝업) — 신민종
// 과목별 최근 3일 1p당 시간이 예상과 20% 넘게 다르면 홈 접속 때 (PL-07 · 디자인 manage PaceDialog).
// [그대로]면 아무것도 바꾸지 않아요. [반영] 뒤 하루 공부 가능 시간을 넘는 날이 생기면 서버가 분배안(P2)으로 이어줘요
import { toast } from 'sonner';
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import { fmtShort } from '@/config/date.js';
import { usePace, useToday } from '@/hooks/useToday.js';
import { useUiStore } from '@/stores/uiStore.js';

export default function P4Pace({ onClose }) {
  const { data: today } = useToday();
  const pace = usePace();
  const openModal = useUiStore((s) => s.openModal);
  const a = today?.paceAlert;
  if (!a) return null;

  const decide = (apply) =>
    pace.mutate(
      { subjectId: a.subjectId, apply },
      {
        onSuccess: (r) => {
          onClose();
          if (!apply) return;
          if (r.replan) openModal('P2');
          else toast(`${a.subjectName} 남은 태스크 시간을 늘렸어요`);
        },
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <Modal
      title={`${a.subjectName}는 예상보다 ${a.ratio}배 걸려요`}
      onClose={() => decide(false)} // 닫으면 [그대로]와 같아요 (과목당 하루 한 번)
      footer={
        <>
          <Button disabled={pace.isPending} onClick={() => decide(false)}>
            그대로
          </Button>
          <Button variant="primary" disabled={pace.isPending} onClick={() => decide(true)}>
            반영
          </Button>
        </>
      }
    >
      <p className="-mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-fg-2">
        {a.subjectName} · 최근 {a.days}일 집중 모드 기록 {a.sessions}회
        <MockBadge />
      </p>
      <p className="text-[13.5px]">
        1페이지당 {a.perPage}분 걸렸어요(예상 {a.expectedPerPage}분). 남은 태스크 시간을 늘릴까요?
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px] [&_td]:border-b [&_td]:border-line [&_td]:px-2 [&_td]:py-2 [&_th]:px-2 [&_th]:pb-1 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-semibold [&_th]:text-fg-2">
          <thead>
            <tr>
              <th>남은 태스크</th>
              <th>지금</th>
              <th>반영하면</th>
            </tr>
          </thead>
          <tbody>
            {a.rows.map((r) => (
              <tr key={r.taskId}>
                <td>
                  <span className="num text-fg-2">{fmtShort(r.date)}</span> {r.title}
                  {r.from && (
                    <span className="num text-fg-2">
                      {' '}
                      p.{r.from}–{r.to}
                    </span>
                  )}
                </td>
                <td className="num">{r.now}분</td>
                <td className="num">
                  {r.after == null ? (
                    <span className="text-fg-2">그대로</span>
                  ) : (
                    <b className="font-semibold text-brand-deep">{r.after}분</b>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rounded-xl border border-dashed border-line-2 px-3.5 py-2.5 text-[12.5px] text-fg-soft">
        {a.overDays.length
          ? `반영하면 ${a.overDays.map((d) => `${fmtShort(d.date)} ${d.over}분`).join(' · ')}이 하루 공부 가능 시간을 넘어서 분배안을 보여줄게요.`
          : '반영해도 하루 공부 가능 시간을 넘는 날은 없어요.'}
      </p>
      <p className="text-[11.5px] text-fg-2">
        예상과 20% 이상 차이 날 때만, 과목당 하루 한 번 떠요.
      </p>
    </Modal>
  );
}
