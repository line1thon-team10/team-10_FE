import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNotes,
  getRetryQuestion,
  postCustomQuiz,
  postRelearn,
  postRetry,
} from '@/api/review.js';
import { QK } from './queryKeys.js';

export const useNotes = (group) =>
  useQuery({ queryKey: QK.notes(group), queryFn: () => getNotes(group) });
export const useRetryQuestion = (noteId) =>
  useQuery({
    queryKey: ['review', 'question', noteId],
    queryFn: () => getRetryQuestion(noteId),
    enabled: Boolean(noteId),
  });

// 다시 풀기·재학습은 오답 노트와 책 쌓기(단원 점수)를 같이 바꿔요
function useReviewMutation(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => ['review', 'books'].forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}
export const useRetry = () => useReviewMutation(postRetry);
export const useRelearn = () => useReviewMutation(postRelearn);
export const useCustomQuiz = () => useMutation({ mutationFn: postCustomQuiz });
