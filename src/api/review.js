import {
  toCustomQuiz,
  toNotes,
  toRelearn,
  toRetryQuestion,
  toRetryResult,
} from './adapters/review.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getNotes = async (group) =>
  toNotes(await http.get(EP.reviewNotes, { params: { group } }));
export const getRetryQuestion = async (noteId) =>
  toRetryQuestion(await http.get(`${EP.reviewNotes}/${noteId}/question`));
export const postRetry = async ({ noteId, choice, text, confidence }) =>
  toRetryResult(
    await http.post(`${EP.reviewNotes}/${noteId}/retry`, {
      choice: choice ?? null,
      text: text ?? null,
      confidence,
    }),
  );
export const postCustomQuiz = async ({ subjectId, units, difficulty, count, weight }) =>
  toCustomQuiz(await http.post(EP.customQuiz, { subjectId, units, difficulty, count, weight }));
export const postRelearn = async ({ subjectId, unitNo }) =>
  toRelearn(await http.post(EP.relearn, { subjectId, unitNo }));
