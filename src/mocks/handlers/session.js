import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { ok } from './respond.js';

export const sessionHandlers = [
  http.post(EP.session, () => ok({ anonymousId: `mock-${crypto.randomUUID().slice(0, 8)}` })),
];
