import { useState } from 'react';
import { toast } from 'sonner';
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import { useApplyEmptyTime } from '@/hooks/useSchedule.js';

// P5 빈 시간 제안 (ON-08, Could · 디자인 manage EmptyTimeDialog)
// 일정 삭제 · 과목 빼기로 빈 시간이 생기면 AI 안 3개: ① 그대로 쉬기(기본) ② 밀린 분량 당겨오기 ③ 다음 태스크 앞당기기(보충 먼저)
export default function EmptyTimeDialog({ data, onClose, onApplied }) {
  const apply = useApplyEmptyTime();
  const [key, setKey] = useState(data.options.find((o) => o.default)?.key ?? 'rest');
  const submit = () =>
    apply.mutate(key, {
      onSuccess: (r) => {
        onClose();
        onApplied?.(r);
        toast(key === 'rest' ? '계획은 그대로 두고 쉬어요' : '빈 시간에 계획을 넣었어요');
      },
      onError: (e) => toast.error(e.message),
    });
  return (
    <Modal
      title={data.emptyTime.label}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>취소</Button>
          <Button variant="primary" disabled={apply.isPending} onClick={submit}>
            {apply.isPending ? '적용하는 중…' : '적용'}
          </Button>
        </>
      }
    >
      <p className="-mt-2 flex items-center gap-2 text-[12.5px] text-fg-2">
        <span className="ai-chip">AI</span>빈 시간을 어떻게 쓸지 골라 주세요.
        <MockBadge />
      </p>
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">빈 시간 안</legend>
        {data.options.map((o, i) => (
          <label
            key={o.key}
            className={`flex gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${!o.enabled ? 'cursor-not-allowed opacity-45' : key === o.key ? 'cursor-pointer border-brand-line bg-brand-tint' : 'cursor-pointer border-line-2 hover:border-fg-2'}`}
          >
            <input
              type="radio"
              name="empty-time"
              className="mt-1 accent-brand"
              disabled={!o.enabled}
              checked={key === o.key}
              onChange={() => setKey(o.key)}
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <b className="text-[13px] font-semibold">
                {'①②③'[i]} {o.title}
                {o.default && <span className="ml-1.5 text-[11px] text-fg-2">(기본)</span>}
              </b>
              <span className="text-[12px] text-fg-soft">{o.desc}</span>
              {o.reason && <span className="text-[11.5px] text-brand-deep">{o.reason}</span>}
            </span>
          </label>
        ))}
      </fieldset>
    </Modal>
  );
}
