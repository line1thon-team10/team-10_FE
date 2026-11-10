import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import {
  applyEmptyTime,
  applyVoiceEvent,
  deleteSchedule,
  monthlyReportView,
  monthlyView,
  previewVoiceEvent,
  weekCalendarView,
} from '../logic.js';
import { run } from './respond.js';

// 캘린더 · 일정 (ON-04·06·07·08). 재배치 계산은 서버 (mock은 logic.js)
export const scheduleHandlers = [
  http.get(EP.weekCalendar, ({ request }) => {
    const q = new URL(request.url).searchParams;
    return run(() => weekCalendarView(q.get('from'), q.get('to')));
  }),
  http.delete(`${EP.schedules}/:id`, ({ params, request }) =>
    run(
      () => deleteSchedule(params.id, new URL(request.url).searchParams.get('scope') ?? 'once'),
      400,
    ),
  ),
  http.post(EP.emptyTime, async ({ request }) => {
    const { option } = await request.json();
    return run(() => applyEmptyTime(option), 600);
  }),
  // AI 일정 해석 자리 (김현민) — mock은 요일·시간 낱말만 봐요
  http.post(`${EP.schedules}/voice`, async ({ request }) => {
    const { text } = await request.json();
    return run(() => previewVoiceEvent(text), 900);
  }),
  http.post(`${EP.schedules}/voice/apply`, () => run(applyVoiceEvent, 500)),
  // 월간 보기 · 리포트 (MO-01~03). 집계는 서버
  http.get(EP.monthly, ({ request }) =>
    run(() => monthlyView(new URL(request.url).searchParams.get('month'))),
  ),
  http.get(`${EP.monthly}/report`, ({ request }) =>
    run(() => monthlyReportView(new URL(request.url).searchParams.get('month'))),
  ),
];
