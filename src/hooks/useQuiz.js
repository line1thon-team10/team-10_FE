import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getQuizResult, getQuizSet, getQuizToday, postQuizSubmit } from '@/api/quiz.js';
import { QK } from './queryKeys.js';

export const useQuizToday = () => useQuery({ queryKey: QK.quizToday, queryFn: getQuizToday });
export const useQuizSet = (subjectId) =>
  useQuery({
    queryKey: QK.quizSet(subjectId),
    queryFn: () => getQuizSet(subjectId),
    enabled: Boolean(subjectId),
    retry: false,
  });
export const useQuizResult = (subjectId) =>
  useQuery({
    queryKey: QK.quizResult(subjectId),
    queryFn: () => getQuizResult(subjectId),
    enabled: Boolean(subjectId),
    retry: false,
  });

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postQuizSubmit,
    onSuccess: (result) => {
      qc.setQueryData(QK.quizResult(result.subjectId), result);
      ['books', 'today', 'review'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: QK.quizToday });
    },
  });
}
