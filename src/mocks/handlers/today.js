import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { db } from '../db.js';
import { applyReplan, buildToday, decidePace, fixRecord, MockError, recordTask } from '../logic.js';
import { aiRun, run } from './respond.js';

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

  // mock: AI가 "로지스틱 회귀까지 했어" 같은 말을 페이지로 바꾸는 자리 (HM-04). 해석은 AI 몫이라 태스크 범위를 그대로 돌려줘요.
  http.post(EP.recordInterpret, async ({ request }) => {
    const { taskId } = await request.json();
    return run(() => {
      const task = db.get().today.tasks.find((t) => t.id === taskId);
      if (!task) throw new MockError('TASK_NOT_FOUND', '태스크를 찾지 못했어요', 404);
      return { from: task.from, to: task.to, label: task.title };
    }, 700);
  }),

  // PL-07 속도 보정: [반영] · [그대로]
  http.post(EP.pace, async ({ request }) => {
    const { subjectId, apply } = await request.json();
    return run(() => decidePace(subjectId, Boolean(apply)), 500);
  }),

  // P2 분배안 만들기 (RC-02·03, AI 설명): 계산은 규칙, 설명 문구만 AI. ?saved=1이면 저장된 설명 (NF-10)
  http.get(`${EP.replan}/options`, ({ request }) => {
    const saved = new URL(request.url).searchParams.get('saved') === '1';
    return aiRun(
      'replan',
      () => {
        const r = buildToday().replan;
        if (!r) throw new MockError('NO_REPLAN', '지금은 밀린 분량이 없어요', 404);
        return { ...r, saved };
      },
      1500,
      { saved },
    );
  }),

  // RC-04: 분배안 적용
  http.post(EP.replan, async ({ request }) => {
    const { key } = await request.json();
    return run(() => ({ event: applyReplan(key) }), 700);
  }),
];
