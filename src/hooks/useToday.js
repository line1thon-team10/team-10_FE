import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getToday, postInterpret, postRecord } from '@/api/today.js';
import { QK } from './queryKeys.js';

export const useToday = () => useQuery({ queryKey: QK.today, queryFn: getToday });

export function useRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postRecord,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.today }),
  });
}

export const useInterpret = () => useMutation({ mutationFn: postInterpret });
