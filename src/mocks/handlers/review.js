import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import {
  makeCustomQuiz,
  relearnUnit,
  retryNote,
  retryQuestionView,
  reviewNotesView,
} from '../logic.js';
import { run } from './respond.js';

export const reviewHandlers = [
  http.get(EP.reviewNotes, ({ request }) =>
    run(() => reviewNotesView(new URL(request.url).searchParams.get('group') ?? 'date')),
  ),
  http.get(`${EP.reviewNotes}/:id/question`, ({ params }) =>
    run(() => retryQuestionView(params.id)),
  ),
  http.post(`${EP.reviewNotes}/:id/retry`, async ({ params, request }) => {
    const answer = await request.json();
    return run(() => retryNote(params.id, answer), 500);
  }),
  // AI 출제 자리 (김현민) — mock은 지금 있는 문항에서 골라요
  http.post(EP.customQuiz, async ({ request }) => {
    const body = await request.json();
    return run(() => makeCustomQuiz(body), 1500);
  }),
  http.post(EP.relearn, async ({ request }) => {
    const { subjectId, unitNo } = await request.json();
    return run(() => relearnUnit(subjectId, unitNo));
  }),
];
