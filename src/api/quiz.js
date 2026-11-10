import { fromAnswers, toMore, toQuizResult, toQuizSet, toQuizToday } from './adapters/quiz.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getQuizToday = async () => toQuizToday(await http.get(EP.quizToday));
// saved: AI 출제가 안 될 때 저장된 결과 (시드의 오늘 퀴즈, NF-10)
export const getQuizSet = async (subjectId, saved = false) =>
  toQuizSet(await http.get(`${EP.quiz}/${subjectId}`, { params: saved ? { saved: 1 } : {} }));
export const postQuizSubmit = async ({ subjectId, answers, savedGrading = false }) =>
  toQuizResult(
    await http.post(`${EP.quiz}/${subjectId}/submit`, {
      answers: fromAnswers(answers),
      savedGrading,
    }),
  );
export const getQuizResult = async (subjectId) =>
  toQuizResult(await http.get(`${EP.quiz}/${subjectId}/result`));

// 더 풀기 (QZ-11): 같은 단원 5문항 세트 → { quizId }
export const postMore = async ({ subjectId, unitNo }) =>
  toMore(await http.post(`${EP.quiz}/${subjectId}/more`, { unitNo }));
