import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { gradeQuiz, makeMoreQuiz, quizResultView, quizSetView, quizTodayView } from '../logic.js';
import { run } from './respond.js';

export const quizHandlers = [
  http.get(EP.quizToday, () => run(quizTodayView)),
  http.get(`${EP.quiz}/:subjectId`, ({ params }) => run(() => quizSetView(params.subjectId), 400)),
  http.post(`${EP.quiz}/:subjectId/submit`, async ({ params, request }) => {
    const { answers, savedGrading } = await request.json();
    return run(() => gradeQuiz(params.subjectId, answers, savedGrading), 1200); // 서술형 AI 채점 시간 흉내
  }),
  // 더 풀기 (QZ-11): 같은 단원 5문항 세트를 만들어요 → /quiz?subject=만든 id
  http.post(`${EP.quiz}/:subjectId/more`, async ({ params, request }) => {
    const { unitNo } = await request.json();
    return run(() => makeMoreQuiz(params.subjectId, unitNo), 800);
  }),
  http.get(`${EP.quiz}/:subjectId/result`, ({ params }) =>
    run(() => quizResultView(params.subjectId)),
  ),
];
