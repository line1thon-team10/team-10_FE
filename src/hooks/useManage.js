import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  applyAddition,
  applySubjectEdit,
  applySubjectRemove,
  applyTodayPlan,
  getSubjects,
  previewAddition,
  previewSubjectEdit,
  previewSubjectRemove,
  previewTodayPlan,
} from '@/api/manage.js';
import { QK } from './queryKeys.js';

export const useSubjects = () => useQuery({ queryKey: QK.subjects, queryFn: getSubjects });

// 적용하면 과목 · 오늘 · 캘린더 · 책 쌓기를 다시 받아요
function useApply(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      ['subjects', 'today', 'week', 'books', 'demo'].forEach((k) =>
        qc.invalidateQueries({ queryKey: [k] }),
      ),
  });
}
export const usePreviewSubjectEdit = () => useMutation({ mutationFn: previewSubjectEdit });
export const usePreviewSubjectRemove = () => useMutation({ mutationFn: previewSubjectRemove });
export const usePreviewAddition = () => useMutation({ mutationFn: previewAddition });
export const usePreviewTodayPlan = () => useMutation({ mutationFn: previewTodayPlan });
export const useApplySubjectEdit = () => useApply(applySubjectEdit);
export const useApplySubjectRemove = () => useApply(applySubjectRemove);
export const useApplyAddition = () => useApply(applyAddition);
export const useApplyTodayPlan = () => useApply(applyTodayPlan);
