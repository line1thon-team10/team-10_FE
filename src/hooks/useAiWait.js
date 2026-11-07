import { useEffect, useState } from 'react';
import { AI_WAIT } from '@/config/app.js';

// AI 응답 대기 상태: normal → (8초) slow 안내 → (30초) retry 다시 시도 (NF-05, [임시] 기준)
export function useAiWait(startedAt, active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  if (!active || !startedAt) return 'normal';
  const elapsed = now - startedAt;
  if (elapsed >= AI_WAIT.retryMs) return 'retry';
  if (elapsed >= AI_WAIT.slowMs) return 'slow';
  return 'normal';
}
