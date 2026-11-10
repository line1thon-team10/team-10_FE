import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import {
  activeSessionView,
  finishSession,
  getSessionView,
  pauseSession,
  resumeSession,
  startSession,
} from '../logic.js';
import { run } from './respond.js';

// 집중 모드 (HM-07·08·09). 시간 계산은 서버
export const studyHandlers = [
  http.post(EP.sessions, async ({ request }) => {
    const { taskId } = await request.json();
    return run(() => startSession(taskId));
  }),
  http.get(`${EP.sessions}/active`, () => run(activeSessionView, 100)),
  http.get(`${EP.sessions}/:id`, ({ params }) => run(() => getSessionView(params.id), 100)),
  http.post(`${EP.sessions}/:id/pause`, ({ params }) => run(() => pauseSession(params.id))),
  http.post(`${EP.sessions}/:id/resume`, ({ params }) => run(() => resumeSession(params.id))),
  http.post(`${EP.sessions}/:id/end`, ({ params }) => run(() => finishSession(params.id), 300)),
];
