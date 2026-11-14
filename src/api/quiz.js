import {
  fromAnswer,
  fromAnswers,
  toMore,
  toQuizResult,
  toQuizSet,
  toQuizToday,
  toSavedAnswer,
} from './adapters/quiz.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getQuizToday = async () => toQuizToday(await http.get(EP.quizToday));
// saved: AI 출제가 안 될 때 저장된 결과 (시드의 오늘 퀴즈, NF-10)
export const getQuizSet = async (subjectId, saved = false, quizId = null) => {
  const set = toQuizSet(
    await http.get(`${EP.quiz}/${subjectId}`, {
      params: { ...(saved ? { saved: 1 } : {}), ...(quizId ? { quizId } : {}) },
    }),
  );
  if (quizId && set.quizId !== quizId)
    throw new Error('같은 퀴즈를 불러오지 못했어요. 다시 시도해 주세요.');
  return set;
};
export const putQuizAnswer = async ({ quizId, questionId, ...answer }) => {
  const saved = toSavedAnswer(
    await http.put(`${EP.quiz}/${quizId}/answers/${questionId}`, fromAnswer(answer)),
  );
  if (
    saved.quizId !== quizId ||
    saved.questionId !== questionId ||
    saved.saved !== true ||
    !Number.isSafeInteger(saved.revision) ||
    saved.revision < 1 ||
    saved.revision < answer.revision
  )
    throw new Error('답안 저장을 확인하지 못했어요. 같은 답으로 다시 시도해 주세요.');
  return saved;
};
export const postQuizSubmit = async ({ subjectId, quizId, answers, savedGrading = false }) =>
  toQuizResult(
    await http.post(`${EP.quiz}/${subjectId}/submit`, {
      quizId,
      answers: fromAnswers(answers),
      savedGrading,
    }),
  );
export const getQuizResult = async (subjectId) =>
  toQuizResult(await http.get(`${EP.quiz}/${subjectId}/result`));

// 더 풀기 (QZ-11): 같은 단원 5문항 세트 → { quizId }
export const postMore = async ({ subjectId, unitNo }) =>
  toMore(await http.post(`${EP.quiz}/${subjectId}/more`, { unitNo }));
