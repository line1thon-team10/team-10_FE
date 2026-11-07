// 목업 핸들러는 기능별 파일로 나눠요. 새 API를 붙이면 여기에 한 줄 추가해요.
import { demoHandlers } from './demo.js';
import { sessionHandlers } from './session.js';

export const handlers = [...sessionHandlers, ...demoHandlers];
