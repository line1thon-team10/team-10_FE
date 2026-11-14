import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getQuizResult,
  getQuizSet,
  getQuizToday,
  postMore,
  postQuizSubmit,
  putQuizAnswer,
} from '@/api/quiz.js';
import { QK } from './queryKeys.js';

export const useQuizToday = () => useQuery({ queryKey: QK.quizToday, queryFn: getQuizToday });
export function useQuizSet(subjectId, saved = false, quizId = null) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: QK.quizSetDetail(subjectId, saved, quizId),
    queryFn: async () => {
      const set = await getQuizSet(subjectId, saved, quizId);
      if (!quizId) qc.setQueryData(QK.quizSetDetail(subjectId, saved, set.quizId), set);
      return set;
    },
    enabled: Boolean(subjectId),
    retry: false,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => (previous?.quizId === quizId ? previous : undefined),
  });
}

export function useSaveQuizAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: putQuizAnswer,
    retry: false,
    onSuccess: async (receipt, request) => {
      await qc.cancelQueries({ queryKey: QK.quizSet(request.subjectId) });
      qc.setQueriesData({ queryKey: QK.quizSet(request.subjectId) }, (set) => {
        if (
          !set ||
          set.quizId !== receipt.quizId ||
          !set.questions.some((q) => q.id === receipt.questionId)
        )
          return set;
        const previous = set.savedAnswers.find((a) => a.questionId === receipt.questionId);
        if (previous && previous.revision >= receipt.revision) return set;
        const answer = {
          questionId: receipt.questionId,
          choice: request.choice,
          text: request.text,
          confidence: request.confidence,
          revision: receipt.revision,
        };
        const answers = new Map(set.savedAnswers.map((a) => [a.questionId, a]));
        answers.set(answer.questionId, answer);
        return {
          ...set,
          savedAnswers: set.questions.flatMap((q) =>
            answers.has(q.id) ? [answers.get(q.id)] : [],
          ),
        };
      });
    },
  });
}
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
      qc.invalidateQueries({ queryKey: ['quiz', 'result'] }); // 더 풀기는 원래 결과에 붙어요
      ['books', 'today', 'review'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      qc.invalidateQueries({ queryKey: QK.quizToday });
    },
  });
}

export const useMoreQuiz = () => useMutation({ mutationFn: postMore });
