import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteSchedule,
  getWeekCalendar,
  postEmptyTime,
  postVoiceApply,
  postVoiceEvent,
} from '@/api/schedule.js';
import { QK } from './queryKeys.js';

export const useWeekCalendar = (from, to) =>
  useQuery({ queryKey: QK.week(from), queryFn: () => getWeekCalendar({ from, to }) });

// 일정·계획이 바뀌면 캘린더와 오늘 할 일을 다시 받아요
function usePlanChange(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => ['week', 'today'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}
export const useDeleteSchedule = () => usePlanChange(deleteSchedule);
export const useApplyEmptyTime = () => usePlanChange(postEmptyTime);
export const useVoiceApply = () => usePlanChange(postVoiceApply);
export const useVoicePreview = () => useMutation({ mutationFn: postVoiceEvent });
