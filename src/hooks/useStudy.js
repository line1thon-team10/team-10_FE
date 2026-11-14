import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  endSession,
  getActiveSession,
  getSession,
  pauseSession,
  resumeSession,
  startSession,
} from '@/api/study.js';
import { QK } from './queryKeys.js';

// 진행 중인 측정: 서버 상태(알림·자동 종료)를 30초마다 다시 물어봐요
export const useActiveSession = (enabled = true) =>
  useQuery({
    queryKey: QK.activeSession,
    queryFn: getActiveSession,
    enabled,
    refetchInterval: 30000,
  });
export const useSession = (id) =>
  useQuery({ queryKey: QK.studySession(id), queryFn: () => getSession(id), enabled: Boolean(id) });

function useSessionMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      qc.setQueryData(QK.activeSession, data.status === 'ended' ? null : data);
      qc.setQueryData(QK.studySession(data.id), data);
      if (data.status === 'ended') qc.invalidateQueries({ queryKey: QK.today });
    },
  });
}
export const useStartSession = () => useSessionMutation(startSession);
export const usePauseSession = () => useSessionMutation(pauseSession);
export const useResumeSession = () => useSessionMutation(resumeSession);
export const useEndSession = () => useSessionMutation(endSession);
