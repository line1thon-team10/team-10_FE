import dayjs from 'dayjs';
import { db } from './db.js';

// mock: 서버가 할 계산을 흉내 내요. 실제 규칙은 백엔드 A·B가 정의서 4장대로 구현해요.
// (진행률 · 퀴즈 열림 · 자정 판정 · 이월 · 분배안 · 책 상태 · 퀴즈 채점)

const OPEN_RATE = 70; // 4-4
const CARRY_RATE = 0.5; // 4-8
const MIN_PER_PAGE = 2.5; // 데이터 세트 3장 "약 2.5분/페이지"
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
export const pagesOf = (t) => t.to - t.from + 1;

export class MockError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// ── 책 상태 ─────────────────────────────────────────────
const findTask = (s, id) => [...s.today.tasks, ...s.pastTasks].find((t) => t.id === id);
const unitOf = (s, subjectId, unitNo) => s.bookshelf[subjectId]?.find((u) => u.unitNo === unitNo);

// 끝난 책은 단원 등급 색, 등급이 없으면 '완료(퀴즈 전)' (4-5)
function blockState(b, unit, s) {
  if (b === 'planned') return 'planned';
  if (b === 'done') return unit.grade ?? 'done';
  const t = findTask(s, b.taskId);
  if (!t || t.status === 'todo' || t.status === 'none') return 'planned';
  if (t.status === 'partial') return 'doing';
  return unit.grade ?? 'done';
}

function taskBlockState(t, s) {
  if (t.status === 'partial') return 'doing';
  if (t.status !== 'done') return 'planned';
  return unitOf(s, t.subjectId, t.unitNo)?.grade ?? 'done';
}

// ── 오늘 ────────────────────────────────────────────────
export function buildToday() {
  const s = db.get();
  if (!s.hasPlan)
    throw new MockError('NO_PLAN', '아직 계획이 없어요. 계획을 먼저 만들어 주세요', 404);
  const tasks = s.today.tasks;
  const totalPages = tasks.reduce((n, t) => n + pagesOf(t), 0);
  const donePages = tasks.reduce((n, t) => n + t.donePages, 0);
  const rate = pct(donePages, totalPages);
  const counts = s.quizCounts[s.today.date] ?? {};

  const bySubject = {};
  for (const t of tasks) {
    const g = (bySubject[t.subjectId] ??= { total: 0, done: 0 });
    g.total += pagesOf(t);
    g.done += t.donePages;
  }
  const subjectRates = Object.fromEntries(
    Object.entries(bySubject).map(([id, g]) => [id, pct(g.done, g.total)]),
  );
  const openSubjects = Object.entries(subjectRates)
    .filter(([, r]) => r >= OPEN_RATE)
    .map(([subjectId]) => ({ subjectId, count: counts[subjectId] ?? 0 }));

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
    subjectRates,
    quiz: {
      openRate: OPEN_RATE,
      open: rate >= OPEN_RATE,
      remainPages: Math.max(0, Math.ceil((totalPages * OPEN_RATE) / 100) - donePages),
      openSubjects,
      totalCount: Object.keys(bySubject).reduce((n, id) => n + (counts[id] ?? 0), 0),
    },
    exams: s.subjects.map((sub) => ({
      subjectId: sub.id,
      dday: dayjs(sub.examDate).diff(dayjs(s.demo.today), 'day'),
      readiness: s.readiness.find((r) => r.subjectId === sub.id)?.readiness ?? null,
    })),
    recentDays: [
      ...s.recentDays.map((d) => ({ date: d.date, blocks: d.blocks.map((state) => ({ state })) })),
      {
        date: s.today.date,
        blocks: tasks.map((t) => ({ state: taskBlockState(t, s), taskId: t.id })),
      },
    ],
    streakDays: s.streakDays,
    notice: s.notice,
    replan: s.replan && {
      ...s.replan,
      totalPages: s.replan.overdue.reduce((n, o) => n + o.pages, 0),
    },
  };
}

// ── 다음 날로 (NF-08): 자정 판정 → 이월 또는 분배안 ──────────
export function advanceDay() {
  const s = db.get();
  if (!s.hasPlan) throw new MockError('NO_PLAN', '계획을 먼저 만들어 주세요');
  const next = dayjs(s.demo.today).add(1, 'day').format('YYYY-MM-DD');
  const plan = s.nextDayTasks[next];
  if (!plan)
    throw new MockError(
      'DEMO_END',
      '데모 시나리오는 11/10까지예요. 데모 메뉴에서 시드를 다시 불러와 주세요',
    );

  // RC-01·02: 과목별 밀린 페이지가 하루 평균 계획의 50% 이상이면 분배안, 미만이면 이월
  const left = [];
  for (const t of s.today.tasks) {
    const pages = pagesOf(t) - t.donePages;
    if (pages > 0) left.push({ task: t, pages, from: t.doneTo ? t.doneTo + 1 : t.from });
  }
  const overdue = {};
  for (const l of left) overdue[l.task.subjectId] = (overdue[l.task.subjectId] ?? 0) + l.pages;
  const over = Object.entries(overdue).filter(([id, p]) => p >= s.dailyAvgPages[id] * CARRY_RATE);

  // 어제 기록한 책을 '최근 7일'로 옮겨요
  const yBlocks = s.today.tasks
    .filter((t) => t.status === 'done' || t.status === 'partial')
    .map((t) => taskBlockState(t, s));
  s.recentDays = [...s.recentDays, { date: s.today.date, blocks: yBlocks }].slice(-6);
  s.pastTasks.push(...s.today.tasks);
  s.today = { date: next, tasks: structuredClone(plan) };
  s.demo.today = next;
  s.notice = null;
  s.replan = null;

  if (over.length) {
    s.replan = {
      date: next,
      overdue: Object.entries(overdue).map(([subjectId, pages]) => ({
        subjectId,
        pages,
        dailyAvg: s.dailyAvgPages[subjectId],
      })),
      keepNote: s.replanKeepNote,
      options: s.plans,
    };
    return 'replan';
  }
  if (left.length) {
    const carried = left.map((l) => ({
      ...l.task,
      id: `${l.task.id}c`,
      from: l.from,
      minutes: Math.max(15, Math.round((l.pages * MIN_PER_PAGE) / 5) * 5),
      reason: '어제에서 이월',
      status: 'todo',
      donePages: 0,
      doneTo: null,
      carried: true,
    }));
    s.today.tasks = [...carried, ...s.today.tasks];
    s.notice = {
      type: 'carry',
      items: left.map((l) => ({
        subjectId: l.task.subjectId,
        from: l.from,
        to: l.task.to,
        pages: l.pages,
        dailyAvg: s.dailyAvgPages[l.task.subjectId],
        ratio: pct(l.pages, s.dailyAvgPages[l.task.subjectId]),
      })),
    };
    return 'carry';
  }
  return 'none';
}

// RC-04: 고른 안만 적용 → 회복 박스 (BK-03)
export function applyReplan(key) {
  const s = db.get();
  if (!s.replan) throw new MockError('NO_REPLAN', '적용할 분배안이 없어요');
  const task = s.replanTasks[key];
  if (!task) throw new MockError('BAD_KEY', '분배안을 다시 골라 주세요');
  s.today.tasks = [{ ...task, status: 'todo', donePages: 0, doneTo: null }, ...s.today.tasks];
  s.replan = null;
  s.notice = { type: 'replanned', key };
  return { type: 'box', reason: 'recover', planKey: key };
}

// ── 책 쌓기 (S9) ────────────────────────────────────────
export function booksView() {
  const s = db.get();
  return {
    subjects: s.subjects.map((sub) => {
      const units = s.bookshelf[sub.id].map((u) => {
        const meta = sub.units.find((x) => x.no === u.unitNo);
        const blocks = u.blocks.map((b) => {
          const t = typeof b === 'object' ? findTask(s, b.taskId) : null;
          return {
            state: blockState(b, u, s),
            supplement: Boolean(b.supplement),
            task: t ? { title: t.title, from: t.from, to: t.to, doneTo: t.doneTo } : null,
          };
        });
        return {
          no: u.unitNo,
          title: meta.title,
          from: meta.from,
          to: meta.to,
          grade: u.grade,
          score: u.score,
          note: u.note ?? null,
          blocks,
        };
      });
      const all = units.flatMap((u) => u.blocks);
      return {
        subjectId: sub.id,
        name: sub.name,
        color: sub.color,
        total: all.length,
        collected: all.filter((b) => b.state !== 'planned').length,
        units,
      };
    }),
    readiness: s.readiness,
  };
}

// ── 오늘의 퀴즈 (S8 · S8-2) ─────────────────────────────
const quizKey = (s, subjectId) => `${s.today.date}:${subjectId}`;

export function quizTodayView() {
  const s = db.get();
  const today = buildToday();
  const counts = s.quizCounts[s.today.date] ?? {};
  const sets = s.quizSets[s.today.date] ?? {};
  const ids = [...new Set(s.today.tasks.map((t) => t.subjectId))];
  return {
    date: s.today.date,
    open: today.quiz.open,
    openRate: OPEN_RATE,
    subjects: ids.map((id) => {
      const sub = s.subjects.find((x) => x.id === id);
      const result = s.quizResults[quizKey(s, id)];
      return {
        subjectId: id,
        name: sub.name,
        color: sub.color,
        count: counts[id] ?? 0,
        rate: today.subjectRates[id] ?? 0,
        open: today.quiz.open || (today.subjectRates[id] ?? 0) >= OPEN_RATE,
        hasQuestions: Boolean(sets[id]),
        result: result ? { correct: result.summary.correct, total: result.summary.total } : null,
      };
    }),
  };
}

export function quizSetView(subjectId) {
  const s = db.get();
  const set = s.quizSets[s.today.date]?.[subjectId];
  if (!set) throw new MockError('NO_QUIZ', '이 과목 퀴즈 문항이 아직 없어요', 404);
  const sub = s.subjects.find((x) => x.id === subjectId);
  return {
    subjectId,
    name: sub.name,
    round: set.round,
    difficulty: set.difficulty,
    composition: set.composition,
    questions: set.questions.map((q) => ({
      id: q.id,
      type: q.type,
      tag: q.tag,
      unitNo: q.unitNo,
      page: q.page,
      prompt: q.prompt,
      options: q.options ?? null,
      mockFilled: q.mockFilled ?? [],
    })),
  };
}

const norm = (t) =>
  String(t ?? '')
    .replace(/\s+/g, '')
    .toLowerCase();

export function gradeQuiz(subjectId, answers) {
  const s = db.get();
  const set = s.quizSets[s.today.date]?.[subjectId];
  if (!set) throw new MockError('NO_QUIZ', '이 과목 퀴즈 문항이 아직 없어요', 404);
  if (set.questions.some((q) => !answers.find((a) => a.questionId === q.id)?.confidence)) {
    throw new MockError('CONFIDENCE_REQUIRED', '모든 문항에 확실/애매를 골라 주세요'); // QZ-05
  }
  const sub = s.subjects.find((x) => x.id === subjectId);
  const items = set.questions.map((q, i) => {
    const a = answers.find((x) => x.questionId === q.id) ?? {};
    let correct = false;
    let score = null;
    let feedback = null;
    if (q.type === 'choice') correct = a.choice === q.answer;
    if (q.type === 'short') correct = q.accepts.map(norm).includes(norm(a.text));
    if (q.type === 'essay') {
      // mock: AI 채점(QZ-04) 자리. 답이 있으면 데이터 세트 시연 점수 70점을 줘요.
      score = String(a.text ?? '').trim() ? q.demoScore : 0;
      correct = score >= 85;
      feedback = { good: q.good, miss: q.miss };
    }
    return {
      questionId: q.id,
      no: i + 1,
      type: q.type,
      tag: q.tag,
      prompt: q.prompt,
      page: q.page,
      confidence: a.confidence,
      correct,
      score,
      feedback,
      explanation: correct ? null : (q.explanation ?? null),
      mockFilled: q.mockFilled ?? [],
    };
  });
  const summary = {
    total: items.length,
    correct: items.filter((x) => x.correct).length,
    sureCorrect: items.filter((x) => x.correct && x.confidence === 'sure').length,
    unsureCorrect: items.filter((x) => x.correct && x.confidence === 'unsure').length,
    wrong: items.filter((x) => !x.correct).length,
  };
  const unitChanges = set.unitChanges.map((c) => {
    const unit = unitOf(s, subjectId, c.unitNo);
    if (unit) Object.assign(unit, { grade: c.grade, score: c.after }); // LV-01·02 결과 반영 (mock 고정값)
    return { ...c, title: sub.units.find((u) => u.no === c.unitNo)?.title };
  });
  const result = {
    subjectId,
    name: sub.name,
    summary,
    items,
    unitChanges,
    wrongAdded: items
      .filter((x) => !x.correct || x.confidence === 'unsure')
      .map((x) => ({ no: x.no, reason: x.correct ? '애매 정답' : '오답' })),
  };
  s.quizResults[quizKey(s, subjectId)] = result;
  return result;
}

export function quizResultView(subjectId) {
  const s = db.get();
  const r = s.quizResults[quizKey(s, subjectId)];
  if (!r) throw new MockError('NO_RESULT', '아직 푼 퀴즈가 없어요', 404);
  return r;
}
