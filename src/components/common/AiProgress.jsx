import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAiWait } from '@/hooks/useAiWait.js';
import AiWait from './AiWait.jsx';
import Button from './Button.jsx';
import StepProgress from './StepProgress.jsx';

const STEP_MS = 1200; // mock: 서버가 단계를 알려주기 전이라 시간으로 넘겨요 (마지막 단계는 응답까지 머물러요)

// AI를 기다리는 화면 공통 (NF-05): 진행 단계(StepProgress) + 8초 안내 · 30초 다시 시도 → 저장된 결과
// TODO(확인필요): [백엔드 확정 필요] 오래 걸리는 작업의 진행 단계를 서버가 알려주면 그 값으로 바꿔요
export function AiProgress({
  steps,
  label,
  onSaved,
  retryNote = '응답이 없으면 저장된 결과를 보여드려요',
}) {
  const [startedAt] = useState(() => Date.now());
  const [current, setCurrent] = useState(0);
  const wait = useAiWait(startedAt, true);
  useEffect(() => {
    if (!steps || current >= steps.length - 1) return undefined;
    const id = setTimeout(() => setCurrent((n) => n + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [steps, current]);
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite">
      {steps && <StepProgress steps={steps} current={current} />}
      <AiWait phase={wait} label={label} lines={!steps} retryNote={retryNote} onRetry={onSaved} />
    </div>
  );
}

// AI 실패 (NF-10): 문구 + [다시 시도] (+ 저장된 결과 보기 · 나중에)
export function AiFail({ message, retryLabel = '다시 시도', onRetry, onSaved, onLater }) {
  return (
    <div
      className="flex flex-col gap-2.5 rounded-xl border border-st-risk/40 px-3.5 py-3"
      role="alert"
    >
      <p className="text-[13px]">{message}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" onClick={onRetry}>
          <RotateCcw size={12} aria-hidden="true" />
          {retryLabel}
        </Button>
        {onLater && (
          <Button size="sm" onClick={onLater}>
            나중에
          </Button>
        )}
        {onSaved && (
          <Button size="sm" variant="ghost" onClick={onSaved}>
            저장된 결과 보기
          </Button>
        )}
      </div>
    </div>
  );
}

// '저장된 결과'는 작게만 (시연 흐름을 끊지 않게)
export const SavedTag = () => (
  <span className="badge text-[10.5px]" title="AI가 응답하지 않아 미리 저장해 둔 결과를 보여줘요">
    저장된 결과
  </span>
);
