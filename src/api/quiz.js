import { fromAnswers, toQuizResult, toQuizSet, toQuizToday } from './adapters/quiz.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getQuizToday = async () => toQuizToday(await http.get(EP.quizToday));
export const getQuizSet = async (subjectId) => toQuizSet(await http.get(`${EP.quiz}/${subjectId}`));
export const postQuizSubmit = async ({ subjectId, answers }) =>
  toQuizResult(
    await http.post(`${EP.quiz}/${subjectId}/submit`, { answers: fromAnswers(answers) }),
  );
export const getQuizResult = async (subjectId) =>
  toQuizResult(await http.get(`${EP.quiz}/${subjectId}/result`));
