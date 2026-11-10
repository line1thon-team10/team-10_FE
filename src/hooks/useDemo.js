import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAiSim,
  getDemoState,
  postAiSim,
  postNextDay,
  postResetDemo,
  postSeed,
} from '@/api/demo.js';
import { useUiStore } from '@/stores/uiStore.js';
import { QK } from './queryKeys.js';

export const useDemoState = () => useQuery({ queryKey: QK.demoState, queryFn: getDemoState });

// 날짜나 시드가 바뀌면 모든 화면 데이터가 바뀌므로 세션을 뺀 전체를 다시 불러와요.
function useDemoMutation(fn) {
  const qc = useQueryClient();
  const resetUi = useUiStore((s) => s.resetDemoUi);
  return useMutation({
    mutationFn: fn,
    onSuccess: (state) => {
      resetUi();
      qc.setQueryData(QK.demoState, state);
      qc.resetQueries({ predicate: (q) => !['session', 'demo'].includes(q.queryKey[0]) });
    },
  });
}

export const useNextDay = () => useDemoMutation(postNextDay);
export const useResetDemo = () => useDemoMutation(postResetDemo);
export const useSeed = () => useDemoMutation(postSeed);

export const useAiSim = () => useQuery({ queryKey: ['demo', 'ai'], queryFn: getAiSim });
export function useSetAiSim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postAiSim,
    onSuccess: (data) => qc.setQueryData(['demo', 'ai'], data),
  });
}
