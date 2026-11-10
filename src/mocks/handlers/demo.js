import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { db, SEEDS } from '../db.js';
import { advanceDay } from '../logic.js';
import { fail, ok, run } from './respond.js';

const AI_TARGETS = ['plan', 'quiz', 'grading', 'tutor', 'replan'];

const demoState = (judgment = null) => {
  const s = db.get();
  return {
    today: s.demo.today,
    firstExam: db.firstExam(),
    seed: s.seedName,
    hasPlan: s.hasPlan,
    judgment,
  };
};

export const demoHandlers = [
  http.get(EP.demoState, () => ok({ ...demoState(), seeds: SEEDS })),
  // NF-08: 자정 판정을 바로 실행하고 다음 날로 넘어가요. judgment: carry(이월) | replan(분배안) | none
  http.post(EP.demoNextDay, () => run(() => ({ ...demoState(advanceDay()), seeds: SEEDS }), 500)),
  http.post(EP.demoReset, () => {
    db.reset();
    return ok({ ...demoState(), seeds: SEEDS });
  }),
  // AI 상태 재현 (/dev): { target, mode: null | slow | fail }
  http.get(EP.demoAi, () => ok(db.get().aiSim)),
  http.post(EP.demoAi, async ({ request }) => {
    const { target, mode } = await request.json();
    if (!AI_TARGETS.includes(target)) return fail('BAD_TARGET', '없는 화면이에요');
    db.get().aiSim = { ...db.get().aiSim, [target]: mode || null };
    return ok(db.get().aiSim);
  }),
  // NF-09: 시드 불러오기 (empty · day9 · overdue)
  http.post(EP.demoSeed, async ({ request }) => {
    const { seed } = await request.json();
    if (!SEEDS[seed]) return fail('BAD_SEED', '없는 시드예요');
    db.seed(seed);
    return ok({ ...demoState(), seeds: SEEDS }, 300);
  }),
];
