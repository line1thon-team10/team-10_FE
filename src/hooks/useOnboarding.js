import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addEventByVoice,
  createEvent,
  deleteEvent,
  getCalendar,
  getOnboarding,
  postMessage,
  updateEvent,
} from '@/api/onboarding.js';
import { QK } from './queryKeys.js';

export const useOnboarding = () => useQuery({ queryKey: QK.onboarding, queryFn: getOnboarding });

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postMessage,
    onSuccess: (data) => {
      qc.setQueryData(QK.onboarding, data);
      qc.invalidateQueries({ queryKey: QK.calendar });
    },
  });
}

export const useCalendar = () => useQuery({ queryKey: QK.calendar, queryFn: getCalendar });

// 일정 추가·수정·삭제·말로 추가는 모두 새 캘린더 상태를 돌려줘요.
function useCalendarMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      qc.setQueryData(QK.calendar, data);
      qc.invalidateQueries({ queryKey: QK.onboarding });
    },
  });
}
export const useCreateEvent = () => useCalendarMutation(createEvent);
export const useUpdateEvent = () => useCalendarMutation(updateEvent);
export const useDeleteEvent = () => useCalendarMutation(deleteEvent);
export const useVoiceEvent = () => useCalendarMutation(addEventByVoice);
