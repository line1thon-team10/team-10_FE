import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { db } from '../db.js';
import { applyReplan, buildToday, fixRecord, MockError, recordTask } from '../logic.js';
import { run } from './respond.js';

export const todayHandlers = [
  http.get(EP.today, () => run(buildToday)),

  http.post(EP.records, async ({ request }) => {
    const { taskId, result, toPage, sessionId } = await request.json();
    return run(() => ({ event: recordTask(taskId, result, toPage, sessionId) }), 300);
  }),

  // 기록한 뒤 페이지 고치기 (HM-03 v2)
  http.patch(`${EP.tasks}/:id/record`, async ({ params, request }) => {
    const { toPage } = await request.json();
    return run(() => fixRecord(params.id, Number(toPage)), 300);
  }),

  // mock: AI가 "스택까지 끝냈어" 같은 말을 페이지로 바꾸는 자리 (HM-04). 시연 값만 돌려줘요.
  http.post(EP.recordInterpret, async ({ request }) => {
    const { taskId } = await request.json();
    return run(() => {
      const task = db.get().today.tasks.find((t) => t.id === taskId);
      if (!task) throw new MockError('TASK_NOT_FOUND', '태스크를 찾지 못했어요', 404);
      const demo =
        task.id === 't1'
          ? { to: 88, label: 'BST 탐색·삽입·삭제' }
          : { to: task.to, label: task.title };
      return { from: task.from, to: demo.to, label: demo.label };
    }, 700);
  }),

  // RC-04: 분배안 적용
  http.post(EP.replan, async ({ request }) => {
    const { key } = await request.json();
    return run(() => ({ event: applyReplan(key) }), 700);
  }),
];
