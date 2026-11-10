import { fromAnswers, toMore, toQuizResult, toQuizSet, toQuizToday } from './adapters/quiz.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getQuizToday = async () => toQuizToday(await http.get(EP.quizToday));
export const getQuizSet = async (subjectId) => toQuizSet(await http.get(`${EP.quiz}/${subjectId}`));
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
