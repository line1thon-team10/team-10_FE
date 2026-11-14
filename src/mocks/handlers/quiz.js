import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import {
  gradeQuiz,
  makeMoreQuiz,
  quizResultView,
  quizSetView,
  quizTodayView,
  saveQuizAnswer,
} from '../logic.js';
import { aiRun, run } from './respond.js';

export const quizHandlers = [
  http.get(EP.quizToday, () => run(quizTodayView)),
  // S8 퀴즈 준비 (AI 출제): ?saved=1이면 시드의 오늘 퀴즈 (NF-10)
  http.get(`${EP.quiz}/:subjectId`, ({ params, request }) => {
    const saved = new URL(request.url).searchParams.get('saved') === '1';
    const quizId = new URL(request.url).searchParams.get('quizId');
    return aiRun('quiz', () => ({ ...quizSetView(params.subjectId, quizId), saved }), 1200, {
      saved,
    });
  }),
  http.put(`${EP.quiz}/:quizId/answers/:questionId`, async ({ params, request }) => {
    const body = await request.json();
    return run(() => saveQuizAnswer(params.quizId, params.questionId, body));
  }),
  http.post(`${EP.quiz}/:subjectId/submit`, async ({ params, request }) => {
    const { answers, savedGrading } = await request.json();
    // 서술형 AI 채점 (S8-3). savedGrading이면 저장된 채점(70점)이라 바로
    return aiRun('grading', () => gradeQuiz(params.subjectId, answers, savedGrading), 1200, {
      saved: Boolean(savedGrading),
    });
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
