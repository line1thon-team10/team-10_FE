import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { gradeQuiz, quizResultView, quizSetView, quizTodayView } from '../logic.js';
import { run } from './respond.js';

export const quizHandlers = [
  http.get(EP.quizToday, () => run(quizTodayView)),
  http.get(`${EP.quiz}/:subjectId`, ({ params }) => run(() => quizSetView(params.subjectId), 400)),
  http.post(`${EP.quiz}/:subjectId/submit`, async ({ params, request }) => {
    const { answers, savedGrading } = await request.json();
    return run(() => gradeQuiz(params.subjectId, answers, savedGrading), 1200); // 서술형 AI 채점 시간 흉내
  }),
  http.get(`${EP.quiz}/:subjectId/result`, ({ params }) =>
    run(() => quizResultView(params.subjectId)),
  ),
];
