// 목업 핸들러는 기능별 파일로 나눠요. 새 API를 붙이면 여기에 한 줄 추가해요.
import { booksHandlers } from './books.js';
import { demoHandlers } from './demo.js';
import { materialsHandlers } from './materials.js';
import { onboardingHandlers } from './onboarding.js';
import { planHandlers } from './plan.js';
import { quizHandlers } from './quiz.js';
import { sessionHandlers } from './session.js';
import { todayHandlers } from './today.js';

export const handlers = [
  ...sessionHandlers,
  ...demoHandlers,
  ...onboardingHandlers,
  ...materialsHandlers,
  ...planHandlers,
  ...todayHandlers,
  ...quizHandlers,
  ...booksHandlers,
];
