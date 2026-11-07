import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDemoState, postNextDay, postResetDemo } from '@/api/demo.js';
import { QK } from './queryKeys.js';

export const useDemoState = () => useQuery({ queryKey: QK.demoState, queryFn: getDemoState });

// 날짜가 바뀌면 모든 화면 데이터가 바뀌므로 세션을 뺀 전체를 다시 불러와요.
function useDemoMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (state) => {
      qc.setQueryData(QK.demoState, state);
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'session' });
    },
  });
}

export const useNextDay = () => useDemoMutation(postNextDay);
export const useResetDemo = () => useDemoMutation(postResetDemo);
