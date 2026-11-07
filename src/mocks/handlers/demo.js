import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { db } from '../db.js';
import { ok } from './respond.js';

const demoState = () => ({ today: db.get().demo.today, firstExam: db.firstExam() });

export const demoHandlers = [
  http.get(EP.demoState, () => ok(demoState())),
  http.post(EP.demoNextDay, () => {
    db.nextDay();
    return ok(demoState(), 400);
  }),
  http.post(EP.demoReset, () => {
    db.reset();
    return ok(demoState());
  }),
];
