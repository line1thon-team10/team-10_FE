import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import {
  applyAddition,
  applySubjectEdit,
  applySubjectRemove,
  applyTodayPlan,
  MockError,
  previewAddition,
  previewSubjectEdit,
  previewSubjectRemove,
  previewTodayPlan,
  subjectsView,
} from '../logic.js';
import { run } from './respond.js';

// 계획 바꾸기 (PL-09 · PL-10 · PL-11). 재배분 계산은 서버 (mock은 logic.js), 모두 미리보기 → 적용
export const manageHandlers = [
  http.get(EP.subjects, () => run(subjectsView)),
  http.patch(`${EP.subjects}/:id/preview`, async ({ params, request }) => {
    const patch = await request.json();
    return run(() => previewSubjectEdit(params.id, patch), 500);
  }),
  http.patch(`${EP.subjects}/:id`, ({ params }) => run(() => applySubjectEdit(params.id), 400)),
  http.delete(`${EP.subjects}/:id/preview`, ({ params }) =>
    run(() => previewSubjectRemove(params.id), 500),
  ),
  http.delete(`${EP.subjects}/:id`, ({ params }) => run(() => applySubjectRemove(params.id), 400)),
  // AI 배치 자리 (김현민) — mock은 고른 요일의 기존 블록 뒤 빈 시간
  http.post(`${EP.additions}/preview`, async ({ request }) => {
    const body = await request.json();
    return run(() => previewAddition(body), 900);
  }),
  http.post(EP.additions, () => run(applyAddition, 400)),
  http.post(`${EP.todayPlan}/preview`, async ({ request }) => {
    const { action, taskId } = await request.json();
    return run(() => previewTodayPlan(action, taskId), 400);
  }),
  http.post(EP.todayPlan, async ({ request }) => {
    const { action } = await request.json();
    return run(() => applyTodayPlan(action), 400);
  }),
  http.post(EP.rebuild, () =>
    run(() => {
      throw new MockError('NOT_READY', '계획 다시 만들기는 기획 확인 중이에요', 501);
    }),
  ),
];
