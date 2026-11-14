import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getToday,
  patchRecord,
  postInterpret,
  postPace,
  postRecord,
  postReplan,
  getReplanOptions,
} from '@/api/today.js';
import { QK } from './queryKeys.js';

export const useToday = () =>
  useQuery({
    queryKey: QK.today,
    queryFn: getToday,
    retry: (n, e) => e?.code !== 'NO_PLAN' && n < 1,
  });

// 기록한 세션의 recorded/pending 상태까지 새로 받아요. 완료 콜백은 갱신 뒤 실행해요.
function useTodayMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      Promise.all(
        [QK.today, QK.books, QK.quiz, QK.study].map((queryKey) =>
          qc.invalidateQueries({ queryKey }),
        ),
      ),
  });
}

export const useRecord = () => useTodayMutation(postRecord);
export const useFixRecord = () => useTodayMutation(patchRecord);
export const useReplan = () => useTodayMutation(postReplan);
export const usePace = () => useTodayMutation(postPace);

export const useInterpret = () => useMutation({ mutationFn: postInterpret });

export const useReplanOptions = (saved = false, enabled = true) =>
  useQuery({
    queryKey: ['today', 'replan', saved],
    queryFn: () => getReplanOptions(saved),
    enabled,
    retry: false,
  });
