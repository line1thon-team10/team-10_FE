// S6-4 말로 일정 추가 재조정 (팝업) — 신민종
// "목요일 저녁에 조모임 생겼어" → 추가할 일정 + 옮길 태스크(지금 → 새 시간) → [이대로 적용] (ON-06 · 4-12 미리보기 → 확인 → 적용)
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import { fmtShort } from '@/config/date.js';
import { useVoiceApply } from '@/hooks/useSchedule.js';

const range = (from, to) => (from ? ` p.${from}–${to}` : '');

export default function S6_4Reschedule({ preview, onClose, onPickOnCalendar }) {
  const apply = useVoiceApply();
  if (!preview) return null; // 캘린더의 말로 일정 추가에서만 열려요
  const { event, moves, note } = preview;
  const submit = () =>
    apply.mutate(undefined, {
      onSuccess: () => {
        onClose();
        toast(
          moves.length
            ? `일정을 추가하고 ${moves.length}개 태스크를 옮겼어요`
            : '일정을 추가했어요',
        );
      },
      onError: (e) => toast.error(e.message),
    });
  return (
    <Modal
      title={event.label}
      wide
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>취소</Button>
          <Button
            onClick={() => {
              onClose();
              onPickOnCalendar?.();
            }}
          >
            캘린더에서 직접 고르기
          </Button>
          <Button variant="primary" disabled={apply.isPending} onClick={submit}>
            {apply.isPending ? '적용하는 중…' : '이대로 적용'}
          </Button>
        </>
      }
    >
      <p className="-mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-fg-2">
        <span className="ai-chip">AI</span>
        {event.repeat
          ? '매주 반복 일정이라 남은 기간 겹침을 한 번에 보여줘요'
          : '하루짜리 일정이에요'}
        <MockBadge />
      </p>
      {moves.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="옮길 태스크">
          <h3 className="font-sans text-[13px] font-semibold">옮길 태스크 {moves.length}개</h3>
          {moves.map((m) => (
            <div
              key={m.taskId}
              className="flex flex-col gap-1.5 rounded-xl border border-line-2 p-3"
            >
              <p className="flex items-center gap-2 text-[12.5px]">
                <span
                  className="h-3 w-1 rounded-full"
                  style={{ background: m.block.color }}
                  aria-hidden="true"
                />
                <b className="font-semibold">{m.block.subjectName}</b> {m.block.title}
                {range(m.block.from, m.block.to)} · {m.block.minutes}분
              </p>
              <div className="num grid gap-1 pl-3 text-[12px] text-fg-soft sm:grid-cols-[auto_auto_1fr] sm:items-start sm:gap-3">
                <span className="text-fg-2 line-through">
                  지금 {fmtShort(m.block.date)} {m.block.start}–{m.block.end}
                </span>
                <ArrowRight size={13} className="hidden text-fg-2 sm:block" aria-hidden="true" />
                <span className="flex flex-col gap-0.5">
                  {m.pieces.map((p) => (
                    <span key={p.date}>
                      {fmtShort(p.date)} {p.start}–{p.end}
                      {range(p.from, p.to)} · {p.minutes}분
                    </span>
                  ))}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}
      <p className="rounded-xl border border-dashed border-line-2 px-3.5 py-2.5 text-[12.5px] text-fg-soft">
        {note}
      </p>
    </Modal>
  );
}
