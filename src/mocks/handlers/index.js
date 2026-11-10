// 목업 핸들러는 기능별 파일로 나눠요. 새 API를 붙이면 여기에 한 줄 추가해요.
import { booksHandlers } from './books.js';
import { demoHandlers } from './demo.js';
import { manageHandlers } from './manage.js';
import { materialsHandlers } from './materials.js';
import { onboardingHandlers } from './onboarding.js';
import { planHandlers } from './plan.js';
import { quizHandlers } from './quiz.js';
import { reviewHandlers } from './review.js';
import { scheduleHandlers } from './schedule.js';
import { sessionHandlers } from './session.js';
import { studyHandlers } from './study.js';
import { todayHandlers } from './today.js';
import { tutorHandlers } from './tutor.js';

export const handlers = [
  ...sessionHandlers,
  ...demoHandlers,
  ...onboardingHandlers,
  ...materialsHandlers,
  ...planHandlers,
  ...todayHandlers,
  ...quizHandlers,
  ...booksHandlers,
  ...reviewHandlers,
  ...scheduleHandlers,
  ...manageHandlers,
  ...studyHandlers,
  ...tutorHandlers,
];
