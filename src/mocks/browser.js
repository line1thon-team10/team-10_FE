import { setupWorker } from 'msw/browser';
import { ENV } from '@/config/env.js';
import { handlers } from './handlers/index.js';
import { hybridHandler } from './hybrid.js';

// 혼합 모드면 서버에 있는 경로를 먼저 가로채 서버로 보내요 (src/mocks/hybrid.js)
export const worker = setupWorker(...(ENV.mode === 'hybrid' ? [hybridHandler] : []), ...handlers);
