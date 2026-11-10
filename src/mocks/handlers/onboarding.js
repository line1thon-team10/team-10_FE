import dayjs from 'dayjs';
import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { SCHEDULE_KIND } from '@/config/labels.js';
import { db } from '../db.js';
import { parseSchedule } from '../parseSchedule.js';
import { fail, ok } from './respond.js';

// mock: AI(김현민)가 할 자연어 해석과 추가 질문을 정해진 대본으로 흉내 내요. 입력 문장 내용은 보지 않아요.
const ob = () => db.get().setup; // 온보딩 진행 상태 (seed의 onboarding은 대본 값)
const minutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
let seq = 100;
const newId = (p) => `${p}${++seq}`;

function onboardingView() {
  const o = ob();
  return {
    messages: o.messages,
    chips: o.chips,
    subjects: o.subjects,
    schedules: o.events.filter((e) => e.days),
    done: o.stage >= 3,
  };
}

function handleMessage(text) {
  const o = ob();
  const s = db.get();
  const script = s.onboardingScript;
  o.messages.push({ role: 'user', text });
  if (o.stage === 0) {
    o.subjects = s.subjects.map((sub, i) => ({
      id: sub.id,
      name: sub.name,
      examDate: sub.examDate,
      goal: i === 0 ? sub.goal : null,
      goalTotal: null,
      goalEtc: null,
      target: null,
      status: i === 0 ? 'asking' : 'pending',
    }));
    o.events = s.fixedSchedules.map((f) => ({
      id: newId('e'),
      kind: f.kind,
      title: SCHEDULE_KIND[f.kind],
      days: f.days,
      start: f.start,
      end: f.end,
    }));
    o.messages.push({ role: 'ai', text: script.askFirst });
    o.chips = s.onboarding.goalChips;
    o.stage = 1;
  } else if (o.stage === 1) {
    const ds = o.subjects[0];
    Object.assign(ds, {
      status: 'confirmed',
      goalTotal: s.subjects[0].goalTotal,
      goalEtc: s.subjects[0].goalEtc,
      target: script.goalTargets.ds,
    });
    o.subjects.slice(1).forEach((x) => (x.status = 'asking'));
    o.messages.push({ role: 'ai', text: script.askRest });
    o.chips = [];
    o.stage = 2;
  } else if (o.stage === 2) {
    o.subjects.slice(1).forEach((x) => {
      const src = s.subjects.find((y) => y.id === x.id);
      Object.assign(x, {
        status: 'confirmed',
        goal: src.goal,
        goalTotal: src.goalTotal,
        goalEtc: src.goalEtc,
        target: script.goalTargets[x.id],
      });
    });
    o.messages.push({ role: 'ai', text: script.done });
    o.stage = 3;
  } else {
    o.messages.push({ role: 'ai', text: '반영했어요. 캘린더에서 다시 확인해 주세요.' });
  }
}

function calendarView() {
  const s = db.get();
  const o = ob();
  const weekStart = dayjs(s.onboardingWeekStart);
  const weekEnd = weekStart.add(6, 'day');
  let fixed = 0;
  for (const e of o.events) {
    const len = minutes(e.end) - minutes(e.start);
    if (e.days) fixed += len * e.days.length;
    else if (!dayjs(e.date).isBefore(weekStart) && !dayjs(e.date).isAfter(weekEnd)) fixed += len;
  }
  // TODO(확인필요): [백엔드 확정 필요] '공부 가능한 빈 시간'의 기준 시간대. mock은 08:00–23:00으로 계산해요.
  const free = 15 * 60 * 7 - fixed;
  return {
    weekStart: s.onboardingWeekStart,
    today: s.onboardingDate,
    events: o.events,
    exams: s.subjects.map((x) => ({ subjectId: x.id, name: x.name, examDate: x.examDate })),
    summary: { fixedMinutes: fixed, freeMinutes: free },
  };
}

// mock: 말로 한 일정 해석 (parseSchedule.js, S6-4와 같은 함수). 실제는 AI가 해요.
// 지금 규칙 그대로: 요일과 시각(또는 때)이 없으면 해석 실패. 반복이면 매주 일정으로 넣어요
function parseVoice(text) {
  const s = db.get();
  const r = parseSchedule(text);
  if (!r.days.length || !r.start) return null;
  return {
    id: newId('e'),
    kind: 'other',
    title: r.title,
    ...(r.repeat
      ? { days: r.days }
      : {
          date: dayjs(s.onboardingWeekStart)
            .add(r.days[0] - 1, 'day')
            .format('YYYY-MM-DD'),
        }),
    start: r.start,
    end: r.end,
    added: true,
  };
}

export const onboardingHandlers = [
  http.get(EP.onboarding, () => ok(onboardingView())),
  http.post(EP.onboardingMessage, async ({ request }) => {
    const { text } = await request.json();
    if (!text?.trim()) return fail('EMPTY', '메시지를 입력해 주세요');
    handleMessage(text.trim());
    return ok(onboardingView(), 900);
  }),

  http.get(EP.calendar, () => ok(calendarView())),
  http.post(EP.events, async ({ request }) => {
    const body = await request.json();
    ob().events.push({ ...body, id: newId('e') });
    return ok(calendarView());
  }),
  http.patch(`${EP.events}/:id`, async ({ params, request }) => {
    const body = await request.json();
    const e = ob().events.find((x) => x.id === params.id);
    if (!e) return fail('EVENT_NOT_FOUND', '일정을 찾지 못했어요', 404);
    Object.assign(e, body, { added: false });
    return ok(calendarView());
  }),
  http.delete(`${EP.events}/:id`, ({ params }) => {
    const o = ob();
    o.events = o.events.filter((x) => x.id !== params.id);
    return ok(calendarView());
  }),
  http.post(EP.eventsVoice, async ({ request }) => {
    const { text } = await request.json();
    const ev = parseVoice(text ?? '');
    if (!ev)
      return fail(
        'PARSE_FAILED',
        '요일과 시간을 찾지 못했어요. "수요일 저녁 7시부터 9시까지 팀플"처럼 말해 주세요',
      );
    ob().events.push(ev);
    return ok({ ...calendarView(), addedId: ev.id }, 800);
  }),
];
