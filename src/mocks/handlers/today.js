import dayjs from 'dayjs';
import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { db } from '../db.js';
import { fail, ok } from './respond.js';

// mock: 서버가 할 계산(진행률·퀴즈 열림·D-day)을 흉내 내요. 실제 규칙은 백엔드 A·B가 정의서 4장대로 구현해요.
const OPEN_RATE = 70;
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function buildToday() {
  const s = db.get();
  const tasks = s.today.tasks;
  const totalPages = tasks.reduce((n, t) => n + (t.to - t.from + 1), 0);
  const donePages = tasks.reduce((n, t) => n + t.donePages, 0);
  const rate = pct(donePages, totalPages);

  const bySubject = {};
  for (const t of tasks) {
    const g = (bySubject[t.subjectId] ??= { total: 0, done: 0 });
    g.total += t.to - t.from + 1;
    g.done += t.donePages;
  }
  const openSubjects = Object.entries(bySubject)
    .filter(([, g]) => pct(g.done, g.total) >= OPEN_RATE)
    .map(([subjectId]) => ({ subjectId, count: s.quizCounts[subjectId] ?? 0 }));

  const blockOf = (t) => ({ done: 'done', partial: 'doing' })[t.status] ?? 'planned';
  return {
    date: s.today.date,
    subjects: s.subjects.map(({ id, name, color, examDate }) => ({ id, name, color, examDate })),
    tasks,
    progress: {
      doneCount: tasks.filter((t) => t.status === 'done').length,
      totalCount: tasks.length,
      donePages,
      totalPages,
      rate,
    },
    quiz: {
      openRate: OPEN_RATE,
      open: rate >= OPEN_RATE,
      remainPages: Math.max(0, Math.ceil((totalPages * OPEN_RATE) / 100) - donePages),
      openSubjects,
      totalCount: Object.keys(bySubject).reduce((n, id) => n + (s.quizCounts[id] ?? 0), 0),
    },
    exams: s.subjects.map((sub) => ({
      subjectId: sub.id,
      dday: dayjs(sub.examDate).diff(dayjs(s.demo.today), 'day'),
      readiness: s.readiness.find((r) => r.subjectId === sub.id)?.readiness ?? null,
    })),
    recentDays: [
      ...s.recentDays.map((d) => ({ date: d.date, blocks: d.blocks.map((state) => ({ state })) })),
      { date: s.today.date, blocks: tasks.map((t) => ({ state: blockOf(t), taskId: t.id })) },
    ],
    streakDays: s.streakDays,
  };
}

export const todayHandlers = [
  http.get(EP.today, () => ok(buildToday())),

  http.post(EP.records, async ({ request }) => {
    const { taskId, result, toPage } = await request.json();
    const task = db.get().today.tasks.find((t) => t.id === taskId);
    if (!task) return fail('TASK_NOT_FOUND', '태스크를 찾지 못했어요', 404);
    const before = buildToday().progress.rate;
    const pages = task.to - task.from + 1;
    if (result === 'done')
      Object.assign(task, { status: 'done', donePages: pages, doneTo: task.to });
    if (result === 'partial') {
      const to = Math.min(Math.max(Number(toPage), task.from), task.to);
      Object.assign(task, {
        status: to >= task.to ? 'done' : 'partial',
        donePages: to - task.from + 1,
        doneTo: to,
      });
    }
    if (result === 'none') Object.assign(task, { status: 'none', donePages: 0, doneTo: null });
    const after = buildToday().progress.rate;
    const sub = db.get().subjects.find((x) => x.id === task.subjectId);

    // BK-03: 평소엔 가벼운 알림, 70% 달성·단원 완료·회복 때만 박스. (mock은 70% 달성만 판정해요)
    let event = null;
    if (before < OPEN_RATE && after >= OPEN_RATE)
      event = { type: 'box', reason: 'rate70', rate: after };
    else if (result !== 'none')
      event = {
        type: 'toast',
        reason: 'record',
        rate: after,
        message: `책 1권 쌓였어요 · ${sub.name} ${task.unitNo}단원 · 오늘 ${after}%`,
      };
    return ok({ event }, 300);
  }),

  // mock: AI가 "스택까지 끝냈어" 같은 말을 페이지로 바꾸는 자리 (HM-04). 시연 값만 돌려줘요.
  http.post(EP.recordInterpret, async ({ request }) => {
    const { taskId } = await request.json();
    const task = db.get().today.tasks.find((t) => t.id === taskId);
    if (!task) return fail('TASK_NOT_FOUND', '태스크를 찾지 못했어요', 404);
    const demo =
      task.id === 't1'
        ? { to: 88, label: 'BST 탐색·삽입·삭제' }
        : { to: task.to, label: task.title };
    return ok({ from: task.from, to: demo.to, label: demo.label }, 700);
  }),
];
