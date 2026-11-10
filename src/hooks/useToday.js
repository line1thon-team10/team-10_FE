import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getToday, patchRecord, postInterpret, postRecord, postReplan } from '@/api/today.js';
import { QK } from './queryKeys.js';

export const useToday = () =>
  useQuery({
    queryKey: QK.today,
    queryFn: getToday,
    retry: (n, e) => e?.code !== 'NO_PLAN' && n < 1,
  });

// 기록하면 오늘 할 일 · 책 쌓기 · 퀴즈 열림이 같이 바뀌어요
function useTodayMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      ['today', 'books', 'quiz'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}

export const useRecord = () => useTodayMutation(postRecord);
export const useFixRecord = () => useTodayMutation(patchRecord);
export const useReplan = () => useTodayMutation(postReplan);

export const useInterpret = () => useMutation({ mutationFn: postInterpret });
