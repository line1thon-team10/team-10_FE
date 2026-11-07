// P2 분배안 (팝업) — 신민종
// 밀린 분량이 기준(하루 평균의 50%)을 넘었을 때만 다음 접속 시 떠요. 고른 안만 확인 후 적용해요 (RC-02~04).
import { useState } from 'react';
import { toast } from 'sonner';
import AiBox from '@/components/common/AiBox.jsx';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import { EmptyState } from '@/components/common/StateView.jsx';
import { PLAN_OPTION } from '@/config/labels.js';
import { useReplan, useToday } from '@/hooks/useToday.js';
import { useUiStore } from '@/stores/uiStore.js';

export default function P2Plans({ onClose }) {
  const { data: today } = useToday();
  const apply = useReplan();
  const openModal = useUiStore((s) => s.openModal);
  const [key, setKey] = useState(null);
  const replan = today?.replan;

  if (!replan)
    return (
      <Modal title="분배안" onClose={onClose}>
        <EmptyState
          title="지금은 밀린 분량이 없어요"
          description="데모 메뉴에서 '밀림 시나리오'를 불러온 뒤 '다음 날로'를 누르면 분배안이 떠요."
        />
      </Modal>
    );

  const nameOf = (id) => today.subjects.find((s) => s.id === id)?.name;
  const overdueText = replan.overdue.map((o) => `${nameOf(o.subjectId)} ${o.pages}p`).join(' · ');
  const picked = replan.options.find((o) => o.key === key);

  const onApply = () =>
    apply.mutate(key, {
      onSuccess: ({ event }) => {
        onClose();
        openModal('P1', { event });
      },
      onError: (e) => toast.error(`적용하지 못했어요. ${e.message}`),
    });

  return (
    <Modal
      title={`어제 ${replan.totalPages}p가 밀렸어요`}
      wide
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>나중에</Button>
          <Button variant="primary" disabled={!key || apply.isPending} onClick={onApply}>
            {apply.isPending ? '다시 짜는 중…' : '이 안으로 적용'}
          </Button>
        </>
      }
    >
      <AiBox label="AI">
        <p className="text-[13.5px]">
          {overdueText} · {replan.overdue.length > 1 ? '두 과목 모두 ' : ''}하루 평균 계획의 50%를
          넘어서 남은 일정을 다시 짜 봤어요
        </p>
        <p className="text-[13px] text-fg-2">{replan.keepNote}</p>
      </AiBox>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">분배안 선택</legend>
        <div className="grid gap-2.5 md:grid-cols-3">
          {replan.options.map((o) => (
            <button
              key={o.key}
              type="button"
              aria-pressed={key === o.key}
              onClick={() => setKey(o.key)}
              className={`flex flex-col gap-1.5 rounded-md border p-3.5 text-left ${key === o.key ? 'border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]' : 'border-line hover:border-fg-3'}`}
            >
              <strong>
                {o.key} · {PLAN_OPTION[o.key]}
              </strong>
              {o.lines.map((l) => (
                <span key={l} className="text-[13px] text-fg-2">
                  {l}
                </span>
              ))}
              <span className="badge mt-1 self-start">{o.effect}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <p className="rounded-sm bg-surface-2 px-3 py-2.5 text-[13px]" aria-live="polite">
        {picked
          ? `변경 미리보기: ${picked.preview}`
          : '안을 고르면 바뀌는 날짜를 미리 보여 드려요.'}
      </p>
    </Modal>
  );
}
