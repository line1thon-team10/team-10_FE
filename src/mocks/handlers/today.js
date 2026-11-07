import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { db } from '../db.js';
import { applyReplan, buildToday, MockError, pagesOf } from '../logic.js';
import { run } from './respond.js';

const OPEN_RATE = 70;

export const todayHandlers = [
  http.get(EP.today, () => run(buildToday)),

  http.post(EP.records, async ({ request }) => {
    const { taskId, result, toPage } = await request.json();
    return run(() => {
      const task = db.get().today.tasks.find((t) => t.id === taskId);
      if (!task) throw new MockError('TASK_NOT_FOUND', '태스크를 찾지 못했어요', 404);
      const before = buildToday().progress.rate;
      if (result === 'done')
        Object.assign(task, { status: 'done', donePages: pagesOf(task), doneTo: task.to });
      if (result === 'partial') {
        const to = Math.min(Math.max(Number(toPage), task.from), task.to);
        Object.assign(task, {
          status: to >= task.to ? 'done' : 'partial',
          donePages: to - task.from + 1,
          doneTo: to,
        });
      }
      if (result === 'none') Object.assign(task, { status: 'none', donePages: 0, doneTo: null });
      const after = buildToday().progress.rate;
      const sub = db.get().subjects.find((x) => x.id === task.subjectId);
      // BK-03: 평소엔 가벼운 알림, 70% 달성·단원 완료·회복 때만 박스 (mock은 70% 달성만 판정)
      let event = null;
      if (before < OPEN_RATE && after >= OPEN_RATE)
        event = { type: 'box', reason: 'rate70', rate: after };
      else if (result !== 'none')
        event = {
          type: 'toast',
          reason: 'record',
          rate: after,
          message: `책 1권 쌓였어요 · ${sub.name} ${task.unitNo}단원 · 오늘 ${after}%`,
        };
      return { event };
    }, 300);
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
