import { Loader2, RotateCcw } from 'lucide-react';

// AI 대기 표시 (NF-05, 디자인 AiWait). phase는 useAiWait 값: normal → (8초) slow → (30초) retry
// onRetry가 없으면 다시 시도 버튼 없이 안내 문구만 보여요.
export default function AiWait({
  phase = 'normal',
  label = 'AI가 정리하고 있어요',
  retryNote = '응답이 없으면 저장된 결과를 보여드려요',
  onRetry,
  lines = true,
}) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Loader2
          size={14}
          className="animate-spin text-brand-deep motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span className="text-[12.5px] font-semibold">{label}</span>
        <span className="text-[11.5px] text-fg-2">
          {phase === 'normal' ? '잠시만 기다려 주세요' : '조금 오래 걸리고 있어요'}
        </span>
      </div>
      {lines && (
        <div className="flex flex-col gap-1.5" aria-hidden="true">
          {['88%', '70%', '46%'].map((w) => (
            <span
              key={w}
              className="block h-2 animate-pulse rounded-full bg-white/[0.07] motion-reduce:animate-none"
              style={{ width: w }}
            />
          ))}
        </div>
      )}
      {phase === 'retry' && (
        <div className="flex flex-wrap items-center gap-2">
          {onRetry && (
            <button type="button" className="btn btn-sm" onClick={onRetry}>
              <RotateCcw size={12} aria-hidden="true" />
              다시 시도
            </button>
          )}
          <span className="text-[11.5px] text-fg-2">{retryNote}</span>
        </div>
      )}
    </div>
  );
}
