import dayjs from 'dayjs';
import { db } from './db.js';
import { parseSchedule } from './parseSchedule.js';

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
const quizKey = (s, subjectId) => `${s.today.date}:${subjectId}`;
const findTask = (s, id) => [...s.today.tasks, ...s.pastTasks].find((t) => t.id === id);
const unitOf = (s, subjectId, unitNo) => s.bookshelf[subjectId]?.find((u) => u.unitNo === unitNo);

// 끝난 책은 단원 등급 색, 등급이 없으면 '완료(퀴즈 전)' (4-5).
// 오늘 끝낸 책은 그 과목 오늘 퀴즈를 내기 전까지 '완료(퀴즈 전)' 회색이에요 (와이어 P3)
const beforeQuiz = (t, s) => s.today.tasks.includes(t) && !s.quizResults[quizKey(s, t.subjectId)];

function taskBlockState(t, s) {
  if (t.status === 'partial') return 'doing';
  if (t.status !== 'done') return 'planned';
  if (beforeQuiz(t, s)) return 'done';
  return unitOf(s, t.subjectId, t.unitNo)?.grade ?? 'done';
}

function blockState(b, unit, s) {
  if (b === 'planned') return 'planned';
  if (b === 'done') return unit.grade ?? 'done';
  const t = findTask(s, b.taskId);
  if (!t || t.status === 'todo' || t.status === 'none') return 'planned';
  return taskBlockState(t, s);
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

  // 집중 모드로 재고 아직 기록하지 않은 시간 ('기록 전 · N분')
  const pendingOf = (t) =>
    Object.values(s.studySessions).find(
      (x) => x.taskId === t.id && x.status === 'ended' && !x.recorded,
    );
  return {
    date: s.today.date,
    subjects: s.subjects.map(({ id, name, color, examDate }) => ({ id, name, color, examDate })),
    tasks: tasks.map((t) => {
      const p = pendingOf(t);
      return { ...t, pendingSessionId: p?.id ?? null, pendingMinutes: p?.minutes ?? null };
    }),
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
    exams: s.subjects
      .filter((x) => !x.removed)
      .map((sub) => ({
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
    notice: s.notice,
    tutorSuggestions: s.tutorSuggestions, // AI 튜터 추천 질문 칩 (mock)
    paceAlert: paceAlertView(s), // 속도 보정 알림 (PL-07 · P4)
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
  // 서버와 같아요: 집중 모드가 진행 중이면 다음 날로 못 넘어가요 (day9 시드의 42분 세션)
  if (activeOf(s)) throw new MockError('SESSION_RUNNING', '집중 모드를 먼저 끝내 주세요', 409);
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
  for (const t of s.today.tasks) t.date = s.today.date; // 캘린더에서 지난 날 블록을 그려요
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

// ── 기록 (HM-02·03) · 페이지 고치기 · 하루 마무리 박스 (BK-03) ─────────────
const DAY_CLOSE_TIME = '23:30'; // 정의서 v2 4장: 다 기록했거나 23:30이 지났을 때

function setDonePage(task, toPage) {
  const to = Math.min(Math.max(Number(toPage), task.from), task.to);
  Object.assign(task, {
    status: to >= task.to ? 'done' : 'partial',
    donePages: to - task.from + 1,
    doneTo: to,
  });
}

// 과목별로 퀴즈가 열렸는지 (전체 70% 이상이면 모두, 아니면 그 과목 70% 이상)
const openSet = (today) =>
  new Set(
    today.quiz.open
      ? Object.keys(today.subjectRates)
      : today.quiz.openSubjects.map((o) => o.subjectId),
  );

export function recordTask(taskId, result, toPage, sessionId = null) {
  const s = db.get();
  const task = s.today.tasks.find((t) => t.id === taskId);
  if (!task) throw new MockError('TASK_NOT_FOUND', '태스크를 찾지 못했어요', 404);
  // 집중 모드에서 온 기록이면 측정 시간을 붙여요. 없으면 시간 없이 저장 (HM-08)
  const session = sessionId && s.studySessions[sessionId];
  if (session?.status === 'ended') {
    task.measuredMinutes = (task.measuredMinutes ?? 0) + session.minutes;
    session.recorded = true;
  }
  const before = buildToday();
  if (result === 'done') setDonePage(task, task.to);
  if (result === 'partial') setDonePage(task, toPage);
  if (result === 'none') Object.assign(task, { status: 'none', donePages: 0, doneTo: null });
  const after = buildToday();
  const rate = after.progress.rate;
  const tasks = s.today.tasks;
  const allRecorded = tasks.every((t) => t.status !== 'todo');

  // 하루 마무리: 다 기록했거나 23:30이 지났고 70% 이상이면 하루 한 번 박스. 나머지는 가벼운 알림
  if (
    (allRecorded || s.demo.time >= DAY_CLOSE_TIME) &&
    rate >= OPEN_RATE &&
    s.dayClosedOn !== s.today.date
  ) {
    s.dayClosedOn = s.today.date;
    const was = openSet(before);
    const counts = s.quizCounts[s.today.date] ?? {};
    return {
      type: 'box',
      reason: 'dayClose',
      rate,
      recordedCount: tasks.filter((t) => t.status !== 'todo').length,
      totalCount: tasks.length,
      donePages: after.progress.donePages,
      totalPages: after.progress.totalPages,
      opened: [...openSet(after)]
        .filter((id) => !was.has(id))
        .map((subjectId) => ({ subjectId, count: counts[subjectId] ?? 0 })),
    };
  }
  if (result === 'none') return null;
  const sub = s.subjects.find((x) => x.id === task.subjectId);
  const crossed = before.progress.rate < OPEN_RATE && rate >= OPEN_RATE;
  return {
    type: 'toast',
    reason: crossed ? 'rate70' : 'record',
    rate,
    message: `${sub.name} ${task.unitNo}단원 한 권 쌓았어요`,
    detail: `오늘 ${rate}%${crossed ? ' · 오늘의 퀴즈가 열렸어요' : ''}`,
  };
}

// 기록한 뒤 끝낸 페이지 고치기 → 진행률·이월(다음 날로 때 계산)이 다시 계산돼요
export function fixRecord(taskId, toPage) {
  const task = db.get().today.tasks.find((t) => t.id === taskId);
  if (!task) throw new MockError('TASK_NOT_FOUND', '태스크를 찾지 못했어요', 404);
  if (task.status !== 'done' && task.status !== 'partial')
    throw new MockError('NOT_RECORDED', '아직 기록하지 않은 태스크예요');
  if (!Number.isInteger(Number(toPage)) || toPage < task.from || toPage > task.to)
    throw new MockError('BAD_PAGE', `p.${task.from}부터 p.${task.to} 사이로 적어 주세요`);
  setDonePage(task, toPage);
  return { taskId, status: task.status, doneTo: task.doneTo, rate: buildToday().progress.rate };
}

// RC-04: 고른 안만 적용 → 회복 박스 (BK-03)
export function applyReplan(key) {
  const s = db.get();
  if (!s.replan) throw new MockError('NO_REPLAN', '적용할 분배안이 없어요');
  const tasks = s.replanTasks[key]; // 밀린 과목마다 1개씩 (서버 적용 결과)
  if (!tasks) throw new MockError('BAD_KEY', '분배안을 다시 골라 주세요');
  s.today.tasks = [
    ...tasks.map((t) => ({ ...t, status: 'todo', donePages: 0, doneTo: null })),
    ...s.today.tasks,
  ];
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
          round: u.round ?? 1, // 보충을 끝내면 2회독 (정의서 4-2)
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

export function quizTodayView() {
  const s = db.get();
  const today = buildToday();
  const counts = s.quizCounts[s.today.date] ?? {};
  const sets = s.quizSets[s.today.date] ?? {};
  const ids = [...new Set(s.today.tasks.map((t) => t.subjectId))];
  const lines = s.quizLines[s.today.date] ?? {};
  return {
    date: s.today.date,
    rate: today.progress.rate,
    open: today.quiz.open,
    openRate: OPEN_RATE,
    subjects: ids.map((id) => {
      const sub = s.subjects.find((x) => x.id === id);
      const result = s.quizResults[quizKey(s, id)];
      const set = sets[id];
      return {
        lines: lines[id] ?? [],
        round: set?.round ?? null,
        difficulty: set?.difficulty ?? null,
        essayCount: set ? set.questions.filter((q) => q.type === 'essay').length : null,
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

// 퀴즈 세트: 오늘의 퀴즈(과목 id) 또는 문제 뽑기로 만든 세트(c1, c2 …)
const setOf = (s, id) => s.customSets[id] ?? s.quizSets[s.today.date]?.[id];
const subjectOfSet = (s, id, set) => s.subjects.find((x) => x.id === (set.subjectId ?? id));

export function quizSetView(subjectId) {
  const s = db.get();
  const set = setOf(s, subjectId);
  if (!set) throw new MockError('NO_QUIZ', '이 과목 퀴즈 문항이 아직 없어요', 404);
  const sub = subjectOfSet(s, subjectId, set);
  return {
    subjectId,
    custom: Boolean(set.subjectId), // 문제 뽑기·더 풀기로 만든 세트
    resultFor: set.moreOf ?? subjectId, // 풀고 나서 볼 결과 (더 풀기는 원래 퀴즈 결과)
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

// 단원 책 더미의 상태 목록 (P3 퀴즈 전·후 비교)
const unitBlockStates = (s, subjectId, unitNo) => {
  const unit = unitOf(s, subjectId, unitNo);
  return unit ? unit.blocks.map((b) => blockState(b, unit, s)) : [];
};

// savedGrading: AI 채점이 늦거나 실패해서 저장된 채점으로 진행 (NF-10)
export function gradeQuiz(subjectId, answers, savedGrading = false) {
  const s = db.get();
  const set = setOf(s, subjectId);
  if (!set) throw new MockError('NO_QUIZ', '이 과목 퀴즈 문항이 아직 없어요', 404);
  if (set.questions.some((q) => !answers.find((a) => a.questionId === q.id)?.confidence)) {
    throw new MockError('CONFIDENCE_REQUIRED', '모든 문항에 확실/애매를 골라 주세요'); // QZ-05
  }
  const sub = subjectOfSet(s, subjectId, set);
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
      unitNo: q.unitNo,
      type: q.type,
      tag: q.tag,
      prompt: q.prompt,
      page: q.page,
      confidence: a.confidence,
      correct,
      score,
      feedback,
      explanation: q.explanation ?? null, // v2: 정답·해설은 결과 화면에서 한 번에 (QZ-08)
      evidence: q.evidence ?? null, // 근거 원본 { materialId, page, quote } — 결과에서만 (QZ-13)
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
  // P3 · BK-08: 퀴즈 전 책 더미 → 결과 반영 → 퀴즈 후 책 더미 (S9와 같은 계산)
  // mock: 문제 뽑기 세트는 단원 점수를 바꾸지 않아요 (unitChanges 없음)
  const changes = set.unitChanges ?? [];
  const before = changes.map((c) => ({
    grade: unitOf(s, sub.id, c.unitNo)?.grade ?? null,
    blocks: unitBlockStates(s, sub.id, c.unitNo),
  }));
  s.quizResults[quizKey(s, subjectId)] = { pending: true }; // 오늘 끝낸 책도 등급 색으로
  const unitChanges = changes.map((c) => {
    const unit = unitOf(s, sub.id, c.unitNo);
    if (unit) Object.assign(unit, { grade: c.grade, score: c.after }); // LV-01·02 결과 반영 (mock 고정값)
    return { ...c, title: sub.units.find((u) => u.no === c.unitNo)?.title };
  });
  const bookChanges = unitChanges.map((c, i) => ({
    unitNo: c.unitNo,
    title: c.title,
    before: { score: c.before, grade: before[i].grade, blocks: before[i].blocks },
    after: { score: c.after, grade: c.grade, blocks: unitBlockStates(s, sub.id, c.unitNo) },
    recovering: Boolean(c.recovering),
  }));
  const result = {
    subjectId,
    name: sub.name,
    essayGrading: savedGrading ? 'saved' : 'ai',
    summary,
    items,
    unitChanges,
    bookChanges,
    wrongAdded: items
      .filter((x) => !x.correct || x.confidence === 'unsure')
      .map((x) => ({ no: x.no, reason: x.correct ? '애매 정답' : '오답' })),
  };
  // 더 풀기 (QZ-11): 이해도에 반영(4-2 '더 푼 5문항도 이해도에', mock은 다시 풀기와 같은 규칙)하고 원래 결과에 이어 붙여요
  // 실제 이해도 계산은 서버 몫이에요 (정의서 4-1 계산식 · calc.py). 여기 점수 변화는 시연용 mock 규칙
  if (set.moreOf) {
    let change = null;
    for (const it of items) {
      const d = it.correct ? (it.confidence === 'sure' ? 1 : 0) : -1;
      const c = applyUnitDelta(s, sub.id, set.unitNo, d);
      if (c) change = { unitNo: set.unitNo, before: change?.before ?? c.before, after: c.after };
    }
    result.unitNo = set.unitNo;
    result.moreUnitChange = change;
    const base = s.quizResults[quizKey(s, set.moreOf)];
    if (base) base.more = [...(base.more ?? []), result];
  }
  s.quizResults[quizKey(s, subjectId)] = result;
  addNotes(s, sub.id, set.questions, items); // RV-01: 오답·애매 정답은 오답 노트로
  return result;
}

export function quizResultView(subjectId) {
  const s = db.get();
  const r = s.quizResults[quizKey(s, subjectId)];
  if (!r) throw new MockError('NO_RESULT', '아직 푼 퀴즈가 없어요', 404);
  return r;
}

// ── 복습·오답 (S10 · RV-01~03) ──────────────────────────
// 판정 규칙 (11/10 결정 A, mock): 틀리면 틀린 횟수 +1 · 점수 −1, 확실 정답이면 점수 +1, 확실 정답 2번이면 해결.
// 회복 모드(80점 미만으로 떨어진 적 있는 단원)는 하루 +5, 그 범위를 재학습했으면 +15까지 (4-2)
const RESOLVE_STREAK = 2;
const WEAK_COUNT = 2; // 취약 개념 = 오답 2회 이상 (4-3)
const GRADE_ORDER = ['risk', 'shaky', 'stable'];
const gradeOfScore = (n) => (n >= 80 ? 'stable' : n >= 50 ? 'shaky' : 'risk');
const resultOf = (correct, confidence) =>
  correct
    ? confidence === 'sure'
      ? 'sureRight'
      : 'unsureRight'
    : confidence === 'sure'
      ? 'sureWrong'
      : 'unsureWrong';
const findQuestion = (s, id) => {
  for (const day of Object.values(s.quizSets))
    for (const set of Object.values(day)) {
      const q = set.questions.find((x) => x.id === id);
      if (q) return q;
    }
  return null;
};
const conceptId = (s, subjectId, unitNo, concept) => {
  const sub = s.subjects.find((x) => x.id === subjectId);
  const idx = sub.units.find((u) => u.no === unitNo)?.concepts.indexOf(concept) ?? -1;
  return idx < 0 ? concept : `${subjectId.toUpperCase()}${unitNo}-${idx + 1} ${concept}`;
};

// 퀴즈 제출 → 오답·애매 정답을 노트에 (같은 문제면 한 노트에 합쳐요)
function addNotes(s, subjectId, questions, items) {
  for (const it of items) {
    const r = resultOf(it.correct, it.confidence);
    let note = s.wrongNotes.find((n) => n.questionId === it.questionId);
    // 다시 나온 문제를 확실로 맞히면 해제에 한 걸음 (4-3: 두 번 모두 확실이면 해제)
    if (r === 'sureRight') {
      if (note && note.result !== 'resolved') {
        note.streak = (note.streak ?? 0) + 1;
        if (note.streak >= RESOLVE_STREAK) note.result = 'resolved';
        note.lastDate = s.today.date;
        note.history.push({ date: s.today.date, result: r });
      }
      continue;
    }
    const q = questions.find((x) => x.id === it.questionId);
    if (!note) {
      note = {
        id: `n${s.wrongNotes.length + 1}`,
        subjectId,
        unitNo: q.unitNo,
        concept: q.concept ?? null,
        questionId: q.id,
        question: q.prompt,
        page: Number(String(q.page).replace(/\D/g, '')) || null,
        type: q.type,
        wrongCount: 0,
        history: [],
        mockFilled: [],
      };
      s.wrongNotes.push(note);
    }
    if (!it.correct) note.wrongCount += 1;
    Object.assign(note, {
      result: r,
      lastDate: s.today.date,
      streak: 0,
      score: it.score ?? undefined,
    });
    note.mockFilled = (note.mockFilled ?? []).filter((x) => x !== 'confidence'); // 실제 확실/애매 값으로 바뀜
    note.history.push({ date: s.today.date, result: r, score: it.score ?? undefined });
  }
}

const noteView = (s, n) => {
  const sub = s.subjects.find((x) => x.id === n.subjectId);
  return {
    id: n.id,
    subjectId: n.subjectId,
    subjectName: sub.name,
    unitNo: n.unitNo,
    unitTitle: sub.units.find((u) => u.no === n.unitNo)?.title ?? '',
    concept: n.concept ? conceptId(s, n.subjectId, n.unitNo, n.concept) : null,
    question: n.question,
    page: n.page,
    type: n.type,
    wrongCount: n.wrongCount,
    lastDate: n.lastDate,
    result: n.result,
    streak: n.result === 'resolved' ? RESOLVE_STREAK : (n.streak ?? 0), // 확실 정답 연속 (2면 해결)
    score: n.type === 'essay' ? (n.score ?? null) : null,
    canRetry: Boolean(n.questionId && findQuestion(s, n.questionId)),
    history: n.history,
    mockFilled: n.mockFilled ?? [],
  };
};

function groupNotes(s, notes, group) {
  const by = (keyOf, labelOf, order) => {
    const map = new Map();
    for (const n of notes) {
      const k = keyOf(n);
      if (!map.has(k)) map.set(k, { key: String(k), label: labelOf(n), items: [] });
      map.get(k).items.push(n);
    }
    return [...map.values()].sort(order);
  };
  if (group === 'unit')
    return by(
      (n) => `${n.subjectId}-${n.unitNo}`,
      (n) => `${n.subjectName} · ${n.unitNo}단원 ${n.unitTitle}`,
      (a, b) => a.key.localeCompare(b.key),
    );
  if (group === 'count')
    return by(
      (n) => n.wrongCount,
      (n) => (n.wrongCount ? `오답 ${n.wrongCount}회` : '애매 정답 (오답 0회)'),
      (a, b) => Number(b.key) - Number(a.key),
    );
  return by(
    (n) => n.lastDate,
    (n) => dayjs(n.lastDate).format('M/D (dd)'),
    (a, b) => b.key.localeCompare(a.key),
  );
}

export function reviewNotesView(group = 'date') {
  const s = db.get();
  const notes = s.wrongNotes.map((n) => noteView(s, n));
  const weak = new Map();
  for (const n of notes) {
    if (!n.concept) continue;
    const k = `${n.subjectId}|${n.concept}`;
    const w = weak.get(k) ?? {
      subjectId: n.subjectId,
      subjectName: n.subjectName,
      concept: n.concept,
      count: 0,
    };
    w.count += n.wrongCount;
    weak.set(k, w);
  }
  return {
    group,
    total: notes.length,
    groups: groupNotes(s, notes, group),
    weakConcepts: [...weak.values()].filter((w) => w.count >= WEAK_COUNT),
  };
}

// 다시 풀기 문항 (정답은 보내지 않아요)
export function retryQuestionView(noteId) {
  const s = db.get();
  const n = s.wrongNotes.find((x) => x.id === noteId);
  const q = n?.questionId && findQuestion(s, n.questionId);
  if (!q) throw new MockError('NO_QUESTION', '이 문제는 다시 풀 문항이 아직 없어요', 404);
  return {
    noteId,
    type: q.type,
    prompt: q.prompt,
    options: q.options ?? null,
    mockFilled: q.mockFilled ?? [],
  };
}

export function retryNote(noteId, answer) {
  const s = db.get();
  const n = s.wrongNotes.find((x) => x.id === noteId);
  const q = n?.questionId && findQuestion(s, n.questionId);
  if (!q) throw new MockError('NO_QUESTION', '이 문제는 다시 풀 문항이 아직 없어요', 404);
  if (!answer.confidence) throw new MockError('CONFIDENCE_REQUIRED', '확실/애매를 골라 주세요');
  let correct = false;
  let score = null;
  if (q.type === 'choice') correct = answer.choice === q.answer;
  if (q.type === 'short') correct = q.accepts.map(norm).includes(norm(answer.text));
  if (q.type === 'essay') {
    score = String(answer.text ?? '').trim() ? q.demoScore : 0; // mock: 시연 점수
    correct = score >= 85;
  }
  const r = resultOf(correct, answer.confidence);
  const beforeCount = n.wrongCount;
  if (!correct) n.wrongCount += 1;
  n.streak = r === 'sureRight' ? (n.streak ?? 0) + 1 : 0;
  n.result = n.streak >= RESOLVE_STREAK ? 'resolved' : r === 'sureRight' ? n.result : r;
  if (n.result === r) n.mockFilled = (n.mockFilled ?? []).filter((x) => x !== 'confidence');
  if (q.type === 'essay') n.score = score;
  n.lastDate = s.today.date;
  n.history.push({ date: s.today.date, result: r, score: score ?? undefined, retry: true });

  const unitChange = applyUnitDelta(
    s,
    n.subjectId,
    n.unitNo,
    r === 'sureRight' ? 1 : correct ? 0 : -1,
  );
  return {
    note: noteView(s, n),
    correct,
    confidence: answer.confidence,
    score,
    explanation: q.explanation ?? null,
    wrongCountBefore: beforeCount,
    unitChange,
  };
}

// 단원 점수 (mock): 확실 정답 +1 · 오답 −1, 회복 모드(80점 미만) 하루 +5 · 재학습한 날 +15, 등급은 한 칸씩
function applyUnitDelta(s, subjectId, unitNo, delta) {
  const unit = unitOf(s, subjectId, unitNo);
  let unitChange = null;
  if (unit?.score != null) {
    const key = `${s.today.date}:${subjectId}:${unitNo}`;
    const gained = s.dailyGain[key] ?? 0;
    const cap = unit.relearnedOn === s.today.date ? 15 : 5;
    const applied = delta > 0 && unit.score < 80 ? Math.min(delta, cap - gained) : delta;
    const before = { score: unit.score, grade: unit.grade };
    const next = Math.max(0, Math.min(99, unit.score + applied));
    // 등급은 한 칸씩만 올라가요 (4-2)
    let grade = gradeOfScore(next);
    if (GRADE_ORDER.indexOf(grade) > GRADE_ORDER.indexOf(unit.grade) + 1)
      grade = GRADE_ORDER[GRADE_ORDER.indexOf(unit.grade) + 1];
    if (applied > 0) s.dailyGain[key] = gained + applied;
    Object.assign(unit, { score: next, grade });
    unitChange = { unitNo, before, after: { score: next, grade } };
  }
  return unitChange;
}

// 재학습 기록 (RV-03): 범위 전체 재학습 → 회독 +1, 그날 회복 상한 +15 (회복 점수 계산은 서버)
export function relearnUnit(subjectId, unitNo) {
  const s = db.get();
  const unit = unitOf(s, subjectId, unitNo);
  if (!unit) throw new MockError('UNIT_NOT_FOUND', '단원을 찾지 못했어요', 404);
  if (unit.relearnedOn === s.today.date)
    throw new MockError('ALREADY', '오늘 이미 재학습을 기록했어요');
  unit.round = (unit.round ?? 1) + 1;
  unit.relearnedOn = s.today.date;
  return { subjectId, unitNo, round: unit.round, relearnedOn: unit.relearnedOn };
}

// 문제 뽑기 (RV-02): 고른 범위·난이도 밖 출제 없음. mock은 지금 있는 퀴즈 문항에서 골라요
export function makeCustomQuiz({ subjectId, units, difficulty, count }) {
  const s = db.get();
  const sub = s.subjects.find((x) => x.id === subjectId);
  if (!sub) throw new MockError('SUBJECT_NOT_FOUND', '과목을 찾지 못했어요', 404);
  if (!units?.length) throw new MockError('NO_UNITS', '범위를 하나 이상 골라 주세요');
  // 2회독 범위만 난이도를 고를 수 있고, 1회독 범위가 섞이면 하 (4-2 · QZ-09)
  const allSecond = units.every((no) => (unitOf(s, subjectId, no)?.round ?? 1) >= 2);
  const level = allSecond ? difficulty : '하';
  const pool = Object.values(s.quizSets)
    .flatMap((day) => day[subjectId]?.questions ?? [])
    .filter((q) => units.includes(q.unitNo));
  if (!pool.length)
    throw new MockError('NO_QUESTIONS', `${sub.name} 이 범위는 목업 문항이 아직 없어요`, 404);
  const picked = pool.slice(0, count);
  const id = `c${Object.keys(s.customSets).length + 1}`;
  s.customSets[id] = {
    subjectId,
    round: allSecond ? '2회독' : '1회독',
    difficulty: level,
    composition: `문제 뽑기 · ${units.map((n) => `${n}단원`).join('·')}`,
    questions: picked.map((q) => ({
      ...q,
      tag: '문제 뽑기',
      mockFilled: [...new Set([...(q.mockFilled ?? []), 'custom'])],
    })),
  };
  return {
    quizId: id,
    count: picked.length,
    difficulty: level,
    note:
      picked.length < count
        ? `목업 문항이 ${picked.length}개뿐이라 ${picked.length}문항만 뽑았어요`
        : null,
  };
}

// ── 집중 모드 (S12 · S12-1 · HM-07~09) ────────────────────
// 시간은 서버가 재요. 화면은 시작·멈춤·재개·종료만 보내고, 받은 분만 보여줘요.
// mock: 서버 시계 = 이 목업의 Date.now(). '오늘' 날짜는 데모 날짜를 써요
const MIN = 60 * 1000;
const CHECK_WAIT_MS = 10 * MIN; // HM-09: 알림 뒤 10분 무응답이면 알림 시점에서 멈춤

function activeMs(x, now = Date.now()) {
  const end = x.endedAt ?? now;
  const pausing = x.pausedAt ? end - x.pausedAt : 0;
  return Math.max(0, end - x.startedAt - x.pausedMs - pausing);
}

// 예상 시간 2배가 지났는지 · 알림 뒤 10분 무응답이면 자동 종료 (HM-09)
function checkSession(s, x, now = Date.now()) {
  if (x.status !== 'active' || x.checkDismissed) return;
  const limit = x.expectedMinutes * 2 * MIN;
  if (activeMs(x, now) < limit) return;
  x.promptAt ??= x.startedAt + x.pausedMs + limit;
  if (now >= x.promptAt + CHECK_WAIT_MS) {
    // 알림이 뜬 시점까지만 측정하고, 이 기록은 속도 보정(PL-07)에서 빼요
    endSession(s, x, x.promptAt);
    x.autoStopped = true;
    x.excludeFromPace = true;
  }
}

function endSession(s, x, at = Date.now()) {
  if (x.pausedAt) {
    x.pausedMs += at - x.pausedAt;
    x.pausedAt = null;
  }
  x.endedAt = at;
  x.status = 'ended';
  x.minutes = Math.floor(activeMs(x) / MIN);
}

const sumMinutes = (s, pick) =>
  Object.values(s.studySessions)
    .filter((x) => x.status === 'ended' && pick(x))
    .reduce((n, x) => n + x.minutes, 0);

function sessionView(s, x) {
  checkSession(s, x);
  const task = findTask(s, x.taskId);
  const sub = s.subjects.find((y) => y.id === x.subjectId);
  const pausing = x.pausedAt ? Date.now() - x.pausedAt : 0;
  return {
    id: x.id,
    taskId: x.taskId,
    subjectId: x.subjectId,
    subjectName: sub.name,
    task: task && {
      title: task.title,
      from: task.from,
      to: task.to,
      pages: pagesOf(task),
      minutes: task.minutes,
    },
    status: x.status, // active | paused | ended
    quote: x.quote,
    material: { id: sub.file.id, page: task?.from ?? 1 }, // [자료 열기] PDF 보기
    minutes: x.status === 'ended' ? x.minutes : Math.floor(activeMs(x) / MIN),
    pausedMinutes: Math.floor((x.pausedMs + pausing) / MIN),
    checkIn: x.status === 'active' && Boolean(x.promptAt) && !x.checkDismissed, // '아직 공부 중이에요?'
    autoStopped: Boolean(x.autoStopped),
    excludeFromPace: Boolean(x.excludeFromPace),
    recorded: Boolean(x.recorded),
    todayMinutes: sumMinutes(s, (y) => y.date === s.today.date),
    subjectMinutes: sumMinutes(s, (y) => y.subjectId === x.subjectId),
  };
}

const sessionOf = (s, id) => {
  const x = s.studySessions[id];
  if (!x) throw new MockError('SESSION_NOT_FOUND', '공부 기록을 찾지 못했어요', 404);
  return x;
};
const activeOf = (s) =>
  Object.values(s.studySessions).find((x) => {
    checkSession(s, x);
    return x.status === 'active' || x.status === 'paused';
  });

export function startSession(taskId) {
  const s = db.get();
  const task = s.today.tasks.find((t) => t.id === taskId);
  if (!task) throw new MockError('TASK_NOT_FOUND', '태스크를 찾지 못했어요', 404);
  const running = activeOf(s);
  if (running?.taskId === taskId) return sessionView(s, running); // 새로고침·다시 들어옴 → 이어서
  if (running) {
    const other = findTask(s, running.taskId);
    throw new MockError(
      'OTHER_ACTIVE',
      `${other?.title ?? '다른 태스크'} 공부가 아직 진행 중이에요`,
      409,
    );
  }
  const id = `s${Object.keys(s.studySessions).length + 1}`;
  const quotes = s.focusQuotes;
  s.studySessions[id] = {
    id,
    taskId,
    subjectId: task.subjectId,
    date: s.today.date,
    expectedMinutes: task.minutes,
    quote: quotes[Math.floor(Math.random() * quotes.length)],
    startedAt: Date.now(),
    pausedAt: null,
    pausedMs: 0,
    status: 'active',
  };
  return sessionView(s, s.studySessions[id]);
}

export function activeSessionView() {
  const s = db.get();
  const x = activeOf(s);
  return x ? sessionView(s, x) : null;
}

export const getSessionView = (id) => {
  const s = db.get();
  return sessionView(s, sessionOf(s, id));
};

export function pauseSession(id) {
  const s = db.get();
  const x = sessionOf(s, id);
  if (x.status !== 'active') throw new MockError('NOT_ACTIVE', '공부 중일 때만 멈출 수 있어요');
  Object.assign(x, { status: 'paused', pausedAt: Date.now() });
  return sessionView(s, x);
}

// 다시 시작 · '아직 공부 중이에요?'에서 [계속 공부]
export function resumeSession(id) {
  const s = db.get();
  const x = sessionOf(s, id);
  if (x.status === 'paused') {
    x.pausedMs += Date.now() - x.pausedAt;
    Object.assign(x, { status: 'active', pausedAt: null });
  } else if (x.status === 'active') x.checkDismissed = true;
  else throw new MockError('ENDED', '이미 끝난 공부예요');
  return sessionView(s, x);
}

export function finishSession(id) {
  const s = db.get();
  const x = sessionOf(s, id);
  if (x.status !== 'ended') endSession(s, x);
  return sessionView(s, x);
}

// ── 더 풀기 (QZ-11) ───────────────────────────────────────
// 같은 단원 5문항. mock은 그 단원 퀴즈 문항에서 골라요 (AI 출제 자리)
const MORE_COUNT = 5;
export function makeMoreQuiz(subjectId, unitNo) {
  const s = db.get();
  const base = s.quizResults[quizKey(s, subjectId)];
  if (!base) throw new MockError('NO_RESULT', '오늘 퀴즈를 먼저 풀어 주세요');
  if (base.more?.some((m) => m.unitNo === unitNo))
    throw new MockError('ALREADY', '이 단원은 오늘 더 풀기를 했어요');
  const pool = Object.values(s.quizSets)
    .flatMap((day) => day[subjectId]?.questions ?? [])
    .filter((q) => q.unitNo === unitNo);
  if (!pool.length) throw new MockError('NO_QUESTIONS', '이 단원은 목업 문항이 아직 없어요', 404);
  const id = `m${Object.keys(s.customSets).length + 1}`;
  s.customSets[id] = {
    subjectId,
    moreOf: subjectId,
    unitNo,
    round: base.round ?? '1회독',
    difficulty: '하',
    composition: `${unitNo}단원 더 풀기 ${Math.min(MORE_COUNT, pool.length)}문항`,
    questions: pool.slice(0, MORE_COUNT).map((q) => ({
      ...q,
      tag: '더 풀기',
      mockFilled: [...new Set([...(q.mockFilled ?? []), 'more'])],
    })),
  };
  return { quizId: id, count: s.customSets[id].questions.length };
}

// ── 근거 원본 PDF (QZ-13) ─────────────────────────────────
// 데모 패키지 PDF (11/14 시드 교체). 과목 강의자료는 자료 id로, S3에 올린 패키지 파일은 이름으로 찾아요
export const MOCK_PDF = {
  'ai-main': '/mock/artificial_intelligence.pdf',
  'db-main': '/mock/database.pdf',
  'os-main': '/mock/operating_system.pdf',
};
export const PACKAGE_PDF = {
  'artificial_intelligence.pdf': '/mock/artificial_intelligence.pdf',
  'database.pdf': '/mock/database.pdf',
  'operating_system.pdf': '/mock/operating_system.pdf',
  'realtime_analysis.pdf': '/mock/realtime_analysis.pdf',
  'scanned_document.pdf': '/mock/scanned_document.pdf',
};

// ── AI 튜터 (TU-01 단일턴 · TU-02 쉬운 설명, 정의서 v2_2 4-14) ─────────
// 요청은 { question, history } (제안). 기본 질문은 history = [], 쉬운 설명은 직전 한 쌍 1개.
// 응답은 두 경우 모두 { answer, pages }. 질문·답은 한 쌍씩 저장하고, 쉬운 설명은 원래 답에 연결해요.
// mock: 키워드로 미리 써 둔 답을 골라요
const NO_ANSWER =
  '올린 강의자료에서 이 질문에 맞는 부분을 찾지 못했어요. 단원 이름이나 개념을 넣어서 다시 물어봐 주세요.';

function savePair(s, fields) {
  const sub = s.subjects.find((x) => x.id === fields.subjectId) ?? s.subjects[0];
  const pair = {
    id: `tq${s.tutorPairs.length + 1}`,
    subjectId: sub.id,
    subjectName: sub.name,
    parentId: null,
    saved: false,
    mockFilled: ['answer'],
    ...fields,
  };
  s.tutorPairs.push(pair);
  return pair;
}

export function askTutor({ question, history = [] }) {
  const s = db.get();
  const answers = s.tutorAnswers;
  // TU-02 쉬운 설명: 직전 질문·답 한 쌍을 받아 쉬운 말로 다시. 근거는 원래 답 그대로
  if (history.length) {
    const prev = history.at(-1);
    const parent = [...s.tutorPairs].reverse().find((p) => p.answer === prev.answer && !p.parentId);
    const hit = answers.find((a) => a.answer === prev.answer);
    return savePair(s, {
      subjectId: parent?.subjectId,
      parentId: parent?.id ?? null,
      question: question || '더 쉽게 설명해줘',
      answer:
        hit?.easy ??
        `쉽게 말하면 이래요. ${prev.answer.split('.')[0]}. 자료의 근거 페이지에 그림이 있으니 같이 보면 더 잘 보여요.`,
      pages: prev.pages ?? [],
    });
  }
  if (!String(question ?? '').trim()) throw new MockError('EMPTY', '질문을 입력해 주세요');
  const hit = answers.find((a) => a.keywords.some((k) => question.includes(k)));
  return savePair(s, {
    subjectId: hit?.subjectId,
    question,
    answer: hit?.answer ?? NO_ANSWER,
    pages: hit?.pages ?? [],
  });
}

// 저장된 결과 (NF-10): 응답이 늦거나 실패하면 화면이 따로 받아요. kind: basic(기본 답) | easy(쉬운 설명)
// 시연 백업은 저장된 답(saved) 하나의 기본 답과 쉬운 설명 (4-14). 새 시드는 아직 없어요 (seed.js tutorAnswers)
export function tutorBackup(kind = 'basic') {
  const s = db.get();
  const b = s.tutorAnswers.find((a) => a.saved);
  if (!b) throw new MockError('NO_BACKUP', '저장된 답이 아직 없어요', 404);
  return {
    id: `backup-${kind}`,
    subjectId: b.subjectId,
    subjectName: s.subjects.find((x) => x.id === b.subjectId).name,
    parentId: null,
    question: kind === 'easy' ? '더 쉽게 설명해줘' : b.question,
    answer: kind === 'easy' ? b.easy : b.answer,
    pages: b.pages,
    saved: true,
    mockFilled: ['answer'],
  };
}

// ── 캘린더 (S11 · ON-04·06·07) · 빈 시간 (P5 · ON-08) · 말로 일정 추가 (S6-4) ──────────
// 일정을 지워도 공부 블록은 지우지 않아요. 계획 변경은 미리보기 → 확인 → 적용 (4-12)
// mock: 데이터 세트에 시각이 없어서 블록 시각은 규칙으로 놓아요 (11/10 결정 A) —
//   저녁 고정 일정(알바·약속)이 없는 날은 19:00부터, 있는 날은 수업이 끝난 뒤(12시면 13:00, 15시면 15:30, 없으면 14:00)부터 이어 붙여요.
//   기준은 원래 주간 일정이라, 일정을 '이번만' 지워도 그날 블록은 그대로예요
const toMin = (hm) => {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
};
const toHM = (n) =>
  `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const dow = (date) => ((dayjs(date).day() + 6) % 7) + 1; // 1=월 … 7=일
const md = (date) => dayjs(date).format('M/D (dd)');
const KIND_TITLE = { class: '수업', job: '알바', meet: '약속', other: '일정' };
// 받침이 있으면 '을', 없으면 '를' (스터디를 · 조모임을)
const objParticle = (word) => {
  const c = word.charCodeAt(word.length - 1) - 0xac00;
  return c >= 0 && c <= 11171 && c % 28 ? '을' : '를';
};

// 그날의 고정 일정 (원래 주간 일정 / 지금 일정)
function fixedOn(s, date, { original = false } = {}) {
  const ed = s.scheduleEdits;
  const out = s.fixedSchedules
    .map((f, i) => ({ ...f, id: `fx${i}` }))
    .filter((f) => f.days.includes(dow(date)))
    .filter(
      (f) =>
        original ||
        (!ed.skips.some((k) => k.id === f.id && k.date === date) &&
          !(ed.untils[f.id] && date >= ed.untils[f.id])),
    )
    .map((f) => ({
      id: `${f.id}@${date}`,
      scheduleId: f.id,
      kind: f.kind,
      title: KIND_TITLE[f.kind],
      date,
      start: f.start,
      end: f.end,
      repeat: true,
    }));
  if (original) return out;
  const added = ed.added
    .filter((e) => (e.days ? e.days.includes(dow(date)) && date >= e.date : e.date === date))
    .map((e) => ({ ...e, id: `${e.id}@${date}`, scheduleId: e.id, date, repeat: Boolean(e.days) }));
  return [...out, ...added];
}

function baseStart(s, date) {
  const orig = fixedOn(s, date, { original: true });
  const evening = orig.some((f) => toMin(f.start) >= 17 * 60);
  if (!evening) return 19 * 60;
  const cls = orig.find((f) => f.kind === 'class');
  if (!cls) return 14 * 60;
  return cls.end === '12:00' ? 13 * 60 : toMin(cls.end) + 30;
}

// 그날 태스크 목록 (지난 날 · 오늘 · 다음 날 · 이번 주 계획). 바꿀 수 있는 원본 배열을 돌려줘요
function dayList(s, date) {
  if (date === s.today.date) return s.today.tasks;
  if (date < s.today.date) return s.pastTasks.filter((t) => t.date === date);
  if (s.nextDayTasks[date]) return s.nextDayTasks[date];
  return (s.weekPlan[date] ??= []);
}

// 블록 시각: 정해 둔 시각(옮긴 블록)은 그대로, 나머지는 기준 시각부터 이어 붙여요
function placeDay(s, date) {
  let cursor = baseStart(s, date);
  return dayList(s, date).map((t) => {
    const start = t.start ? toMin(t.start) : cursor;
    const end = start + t.minutes;
    if (!t.start) cursor = end;
    return { task: t, date, start, end };
  });
}

const blockView = (s, b) => {
  const sub = s.subjects.find((x) => x.id === b.task.subjectId);
  return {
    id: b.task.id,
    subjectId: sub.id,
    subjectName: sub.name,
    color: sub.color,
    title: b.task.title,
    from: b.task.from ?? null,
    to: b.task.to ?? null,
    date: b.date,
    start: toHM(b.start),
    end: toHM(b.end),
    minutes: b.task.minutes,
    reason: b.task.reason ?? null,
    supplement: Boolean(b.task.supplement),
    status: b.task.status ?? 'todo',
    moved: Boolean(b.task.start), // 옮겨 둔 블록
  };
};

const datesBetween = (from, to) => {
  const out = [];
  for (let d = dayjs(from); !d.isAfter(dayjs(to)); d = d.add(1, 'day'))
    out.push(d.format('YYYY-MM-DD'));
  return out;
};

export function weekCalendarView(from, to) {
  const s = db.get();
  const dates = datesBetween(from, to);
  const study = dates.flatMap((d) => placeDay(s, d).map((b) => blockView(s, b)));
  const summary = s.subjects.map((x) => {
    const mine = study.filter((b) => b.subjectId === x.id);
    return {
      subjectId: x.id,
      name: x.name,
      color: x.color,
      minutes: mine.reduce((n, b) => n + b.minutes, 0),
      count: mine.length,
    };
  });
  return {
    from,
    to,
    today: s.demo.today,
    exams: s.subjects
      .filter((x) => !x.removed && dates.includes(x.examDate))
      .map((x) => ({ subjectId: x.id, name: x.name, color: x.color, date: x.examDate })),
    fixed: dates.flatMap((d) => fixedOn(s, d)),
    study,
    summary,
  };
}

// 빈 시간 안 3개 (P5): ① 쉬기 ② 밀린 분량 당겨오기 ③ 다음 태스크 앞당기기(보충 먼저)
function emptyTimeView(s, slot) {
  const overdue = s.today.tasks.find((t) => t.carried && t.status === 'todo');
  const later = datesBetween(
    dayjs(slot.date).add(1, 'day').format('YYYY-MM-DD'),
    dayjs(slot.date).add(14, 'day').format('YYYY-MM-DD'),
  )
    .filter((d) => d >= s.today.date)
    .flatMap((d) => placeDay(s, d))
    .filter((b) => (b.task.status ?? 'todo') === 'todo');
  const next = later.find((b) => b.task.supplement) ?? later[0];
  const fits = next && next.task.minutes <= toMin(slot.end) - toMin(slot.start);
  const subOf = (t) => s.subjects.find((x) => x.id === t.subjectId);
  const range = (t) => (t.from ? ` p.${t.from}–${t.to}` : '');
  const exam = next && subOf(next.task).examDate;
  return {
    emptyTime: { ...slot, label: `${md(slot.date)} ${slot.start}–${slot.end}이 비었어요` },
    options: [
      {
        key: 'rest',
        title: '그대로 쉬기',
        desc: '계획은 그대로 두고 쉬어요',
        enabled: true,
        default: true,
      },
      {
        key: 'pull',
        title: '밀린 분량 당겨오기',
        desc: overdue
          ? `${subOf(overdue).name} ${overdue.title}${range(overdue)}을 이 시간에 넣어요`
          : '밀린 분량이 없어요',
        enabled: Boolean(overdue),
      },
      {
        key: 'advance',
        title: next?.task.supplement ? '보충 학습 앞당기기' : '다음 태스크 앞당기기',
        desc: fits
          ? `${md(next.date)} ${subOf(next.task).name} ${next.task.title}${range(next.task)} (${next.task.minutes}분)을 ${slot.start}–${toHM(toMin(slot.start) + next.task.minutes)}으로 앞당겨요`
          : '앞당길 태스크가 없어요',
        reason: fits
          ? `${subOf(next.task).name} 시험(${dayjs(exam).format('M/D')}) 전에 하루 여유가 생겨요`
          : null, // mock: AI 이유 문구
        enabled: Boolean(fits),
      },
    ],
  };
}

// 일정 삭제 (ON-07): once 이번만 · future 앞으로 모두. 공부 블록은 지우지 않아요 → 빈 시간 안 (P5)
export function deleteSchedule(occurrenceId, scope = 'once') {
  const s = db.get();
  const [scheduleId, date] = occurrenceId.split('@');
  const ed = s.scheduleEdits;
  const occ = fixedOn(s, date).find((f) => f.scheduleId === scheduleId);
  if (!occ) throw new MockError('SCHEDULE_NOT_FOUND', '일정을 찾지 못했어요', 404);
  const added = ed.added.find((e) => e.id === scheduleId);
  if (added && (!added.days || scope === 'future')) ed.added = ed.added.filter((e) => e !== added);
  else if (scope === 'future') ed.untils[scheduleId] = date;
  else ed.skips.push({ id: scheduleId, date });
  s.pendingEmpty = { date, start: occ.start, end: occ.end };
  return emptyTimeView(s, s.pendingEmpty);
}

function moveTask(s, task, fromDate, toDate, start) {
  const src = dayList(s, fromDate);
  src.splice(src.indexOf(task), 1);
  task.start = start;
  dayList(s, toDate).push(task);
}

export function applyEmptyTime(option) {
  const s = db.get();
  const slot = s.pendingEmpty;
  if (!slot) throw new MockError('NO_EMPTY_TIME', '적용할 빈 시간이 없어요');
  const view = emptyTimeView(s, slot);
  const opt = view.options.find((o) => o.key === option);
  if (!opt?.enabled) throw new MockError('BAD_OPTION', '고를 수 없는 안이에요');
  let moved = null;
  if (option === 'pull') {
    const t = s.today.tasks.find((x) => x.carried && x.status === 'todo');
    moveTask(s, t, s.today.date, slot.date, slot.start);
    moved = t.id;
  }
  if (option === 'advance') {
    const later = datesBetween(
      dayjs(slot.date).add(1, 'day').format('YYYY-MM-DD'),
      dayjs(slot.date).add(14, 'day').format('YYYY-MM-DD'),
    )
      .filter((d) => d >= s.today.date)
      .flatMap((d) => placeDay(s, d))
      .filter((b) => (b.task.status ?? 'todo') === 'todo');
    const next = later.find((b) => b.task.supplement) ?? later[0];
    moveTask(s, next.task, next.date, slot.date, slot.start);
    moved = next.task.id;
  }
  s.pendingEmpty = null;
  return { option, movedTaskId: moved };
}

// 말로 일정 추가 (ON-06 · S6-4): "목요일 저녁에 조모임 생겼어" → 미리보기 → 적용
// 문장 해석은 parseSchedule.js (S2와 같은 함수). 요일이 없으면 지금처럼 해석 실패
function parseVoiceEvent(s, text) {
  const r = parseSchedule(text);
  if (!r.days.length) return null;
  // 오늘 이후 가장 가까운 그 요일 (반복이면 고른 요일 중 가장 가까운 날부터)
  let d = dayjs(s.demo.today);
  while (!r.days.includes(dow(d.format('YYYY-MM-DD')))) d = d.add(1, 'day');
  return {
    title: r.title,
    date: d.format('YYYY-MM-DD'),
    start: r.start ?? '19:00', // 시각도 때도 없으면 저녁 기본값 (지금 규칙)
    end: r.end ?? '21:00',
    days: r.repeat ? r.days : null,
  };
}

// 겹치는 블록은 반으로 나눠 다음 공부일 이틀에 하나씩, 그날 마지막 블록 뒤로 (11/10 결정 A, 데이터 세트 '조모임')
function planMoves(s, ev) {
  const lastDay = dayjs(s.demo.today).add(6, 'day').format('YYYY-MM-DD');
  const dates = datesBetween(ev.date, lastDay).filter((d) =>
    ev.days ? ev.days.includes(dow(d)) : d === ev.date,
  );
  const moves = [];
  for (const d of dates) {
    for (const b of placeDay(s, d)) {
      if (!(b.start < toMin(ev.end) && b.end > toMin(ev.start))) continue;
      if ((b.task.status ?? 'todo') !== 'todo') continue;
      const targets = datesBetween(
        dayjs(d).add(1, 'day').format('YYYY-MM-DD'),
        dayjs(d).add(7, 'day').format('YYYY-MM-DD'),
      )
        .filter((x) => dayList(s, x).length)
        .slice(0, 2);
      if (targets.length < 2) continue;
      const t = b.task;
      const half = Math.ceil(t.minutes / 2);
      const mid = t.from ? t.from + Math.ceil((t.to - t.from + 1) / 2) - 1 : null;
      const pieces = targets.map((x, i) => {
        const last = placeDay(s, x).at(-1);
        return {
          date: x,
          start: toHM(last.end),
          end: toHM(last.end + (i === 0 ? half : t.minutes - half)),
          minutes: i === 0 ? half : t.minutes - half,
          from: t.from ? (i === 0 ? t.from : mid + 1) : null,
          to: t.from ? (i === 0 ? mid : t.to) : null,
        };
      });
      moves.push({ taskId: t.id, date: d, block: blockView(s, b), pieces });
    }
  }
  return moves;
}

export function previewVoiceEvent(text) {
  const s = db.get();
  const ev = parseVoiceEvent(s, String(text ?? ''));
  if (!ev)
    throw new MockError(
      'PARSE_FAILED',
      '요일을 찾지 못했어요. "목요일 저녁에 조모임 생겼어"처럼 말해 주세요',
    );
  const moves = planMoves(s, ev);
  const exam = s.subjects.find((x) => x.examDate === ev.date);
  s.pendingVoice = { ev, moves };
  return {
    event: {
      ...ev,
      label: `${md(ev.date)} ${ev.start}–${ev.end} ${ev.title}${objParticle(ev.title)} 추가할게요`,
      repeat: Boolean(ev.days),
    },
    moves,
    note: moves.length
      ? `${exam ? `${md(ev.date)}은 ${exam.name} 시험 당일이라 ` : ''}겹치는 공부를 다음 공부일 이틀로 나눠 옮겨요. 기록·퀴즈 점수·쌓인 책은 그대로예요.`
      : '겹치는 공부가 없어서 일정만 추가해요.',
  };
}

export function applyVoiceEvent() {
  const s = db.get();
  const p = s.pendingVoice;
  if (!p) throw new MockError('NO_PREVIEW', '적용할 미리보기가 없어요');
  s.scheduleEdits.added.push({
    id: `ad${s.scheduleEdits.added.length + 1}`,
    kind: 'other',
    ...p.ev,
    added: true,
  });
  for (const m of p.moves) {
    const src = dayList(s, m.date);
    const t = src.find((x) => x.id === m.taskId);
    src.splice(src.indexOf(t), 1);
    m.pieces.forEach((pc, i) => {
      dayList(s, pc.date).push({
        ...t,
        id: `${t.id}-${i + 1}`,
        from: pc.from,
        to: pc.to,
        minutes: pc.minutes,
        start: pc.start,
        reason: `${md(m.date)} 일정과 겹쳐서 나눠 옮겼어요`,
      });
    });
  }
  s.pendingVoice = null;
  return { added: p.ev, moved: p.moves.length };
}

// ── 속도 보정 (PL-07 · P4) ────────────────────────────────
// 과목별 최근 3일 집중 모드 1p당 시간이 예상과 20% 넘게 다르면 홈 접속 때 알림. 과목당 하루 한 번.
// mock: 11/9 기본 시드에서 '다음 날로' 한 11/10에만 첫 시험 과목 1.4배 (값은 MOCK, seed.js paceMock)
// TODO(확인필요): [기획 확인] 분배안(P2)과 같은 날 겹칠 때 어느 쪽이 먼저인지 (지금은 P2 먼저)
const PACE_DIFF = 0.2;
const DAY_WINDOW = [8 * 60, 23 * 60]; // 하루 공부 가능 시간 = 08–23시에서 고정 일정을 뺀 시간 (11/10 결정 A, S2 요약과 같은 기준)

function freeMinutes(s, date) {
  const busy = fixedOn(s, date).reduce(
    (n, f) =>
      n +
      Math.max(0, Math.min(toMin(f.end), DAY_WINDOW[1]) - Math.max(toMin(f.start), DAY_WINDOW[0])),
    0,
  );
  return DAY_WINDOW[1] - DAY_WINDOW[0] - busy;
}

function paceRows(s, m) {
  const dates = datesBetween(s.today.date, dayjs(s.today.date).add(6, 'day').format('YYYY-MM-DD'));
  return dates.flatMap((d) =>
    dayList(s, d)
      .filter((t) => t.subjectId === m.subjectId && (t.status ?? 'todo') === 'todo')
      .map((t) => ({
        taskId: t.id,
        date: d,
        title: t.title,
        from: t.from ?? null,
        to: t.to ?? null,
        now: t.minutes,
        // 페이지 기준이 아닌 태스크(총복습 등)는 그대로
        after: t.from ? Math.round(((t.to - t.from + 1) * m.perPage) / 5) * 5 : null,
      })),
  );
}

// 반영하면 하루 공부 가능 시간을 넘는 날
function overDays(s, rows) {
  const byDate = {};
  for (const r of rows) byDate[r.date] = (byDate[r.date] ?? 0) + ((r.after ?? r.now) - r.now);
  return Object.entries(byDate)
    .map(([date, extra]) => {
      const total = dayList(s, date).reduce((n, t) => n + t.minutes, 0) + extra;
      return { date, total, free: freeMinutes(s, date), over: total - freeMinutes(s, date) };
    })
    .filter((d) => d.over > 0);
}

function paceAlertView(s) {
  const m = s.paceMock;
  if (!m || s.today.date !== m.date || s.seedName !== m.seed) return null;
  if (s.paceDecided[`${s.today.date}:${m.subjectId}`]) return null;
  if (Math.abs(m.ratio - 1) < PACE_DIFF) return null;
  const sub = s.subjects.find((x) => x.id === m.subjectId);
  const rows = paceRows(s, m);
  return {
    subjectId: m.subjectId,
    subjectName: sub.name,
    ratio: m.ratio,
    perPage: m.perPage,
    expectedPerPage: m.expectedPerPage,
    days: m.days,
    sessions: m.sessions,
    rows,
    overDays: overDays(s, rows),
    mockFilled: ['ratio', 'perPage', 'sessions'],
  };
}

// [반영] 남은 태스크 시간 늘리기 · [그대로] 아무것도 바꾸지 않음. 넘는 날이 생기면 분배안(P2)으로
export function decidePace(subjectId, apply) {
  const s = db.get();
  const alert = paceAlertView(s);
  if (!alert || alert.subjectId !== subjectId)
    throw new MockError('NO_PACE', '지금은 속도 보정 알림이 없어요');
  s.paceDecided[`${s.today.date}:${subjectId}`] = apply ? 'apply' : 'keep';
  if (!apply) return { applied: false, overDays: [], replan: false };
  for (const r of alert.rows) {
    if (r.after == null) continue;
    const t = dayList(s, r.date).find((x) => x.id === r.taskId);
    if (t) t.minutes = r.after;
  }
  const over = alert.overDays;
  if (over.length) {
    // mock: P2 틀에 머리만 바꿔요. 안 A/B/C 문구는 기존 mock (11/10 결정 A)
    // TODO(확인필요): [기획 확인] 속도 보정으로 넘는 날의 분배안 문구
    const d = over[0];
    s.replan = {
      kind: 'pace',
      date: s.today.date,
      title: `속도를 반영하니 ${md(d.date)}에 ${d.over}분이 넘어요`,
      overdue: [],
      keepNote: s.replanKeepNote,
      options: s.plans,
    };
  }
  return { applied: true, overDays: over, replan: over.length > 0 };
}

// ── 계획 바꾸기 (S13 계획 추가 · S14 과목·계획 관리 · PL-10 오늘 계획) ───────────
// 모두 미리보기 → 확인 → 적용. 기록·퀴즈 점수·쌓인 책은 그대로 (4-12). mock 규칙은 11/10 결정 A
const MIN_PER_PAGE_PLAN = 2.5; // 데이터 세트 3장 "약 2.5분/페이지"
const planDays = (s) =>
  datesBetween(s.today.date, dayjs(s.today.date).add(6, 'day').format('YYYY-MM-DD'));
const isTodo = (t) => (t.status ?? 'todo') === 'todo';

function subjectView(s, x) {
  const r = s.readiness.find((y) => y.subjectId === x.id);
  // 단원: S4에서 고친 값이 있으면 그것, 시험 범위에서 뺀 단원은 빼요
  const out = s.setup.outOfExam[x.id] ?? [];
  const units = (s.setup.units[x.id] ?? x.units)
    .map((u, i) => ({ ...u, no: i + 1 }))
    .filter((u) => !out.includes(u.no) && u.from && u.to);
  return {
    id: x.id,
    name: x.name,
    color: x.color,
    examDate: x.examDate,
    dday: dayjs(x.examDate).diff(dayjs(s.demo.today), 'day'),
    goal: x.goal,
    target: r?.target ?? null,
    goalTotal: x.goalTotal,
    range: units.length
      ? {
          from: units[0].from,
          to: units.at(-1).to,
          pages: units.reduce((n, u) => n + u.to - u.from + 1, 0),
        }
      : null,
    progress:
      r?.studiedPages != null
        ? { studied: r.studiedPages, total: r.totalPages, rate: r.progressRate }
        : null,
    readiness: r?.readiness ?? null,
    removed: Boolean(x.removed),
    archived: dayjs(x.examDate).isBefore(dayjs(s.demo.today), 'day'), // 시험 끝난 과목은 자동 보관
    materials: [
      {
        id: x.file.id,
        name: x.file.name,
        pages: x.file.pages,
        toc: units.map(({ no, title, from, to }) => ({ no, title, from, to })),
      },
      ...(s.extraMaterials[x.id] ?? []).map((m) => ({ ...m, mock: true })),
    ],
  };
}

export const subjectsView = () => {
  const s = db.get();
  return { today: s.demo.today, subjects: s.subjects.map((x) => subjectView(s, x)) };
};

const subjectOf = (s, id) => {
  const x = s.subjects.find((y) => y.id === id);
  if (!x || x.removed) throw new MockError('SUBJECT_NOT_FOUND', '과목을 찾지 못했어요', 404);
  return x;
};
const remember = (s, kind, payload, view) => {
  s.pendingPlan = { kind, payload, view };
  return view;
};
const takePending = (s, kind) => {
  const p = s.pendingPlan;
  if (!p || p.kind !== kind) throw new MockError('NO_PREVIEW', '먼저 바뀌는 것을 미리 봐 주세요');
  s.pendingPlan = null;
  return p;
};

// 시험일 · 목표 바꾸기 미리보기 (PL-11)
// 목표: 목표 점수·목표선·'목표까지 부족'만 바뀌고 계획은 그대로. 시험일: 앞당기면 새 시험일 이후 태스크를 그 전 가장 한가한 날 끝으로
export function previewSubjectEdit(id, patch) {
  const s = db.get();
  const x = subjectOf(s, id);
  const r = s.readiness.find((y) => y.subjectId === id);
  const changes = [];
  const moves = [];
  if (patch.goal != null || patch.target != null) {
    const goal = patch.goal ?? x.goal;
    const target = Number(patch.target ?? r.target);
    if (!(target > 0 && target <= 100))
      throw new MockError('BAD_TARGET', '목표 점수는 1~100 사이로 적어 주세요');
    changes.push(
      { label: '목표', before: `${x.goal} (${r.target}점)`, after: `${goal} (${target}점)` },
      { label: '준비도 목표선', before: `${r.target}%`, after: `${target}%` },
      {
        label: '목표까지',
        before: `${Math.max(0, r.target - r.readiness)}% 부족`,
        after: `${Math.max(0, target - r.readiness)}% 부족`,
      },
    );
  }
  if (patch.examDate && patch.examDate !== x.examDate) {
    const d = patch.examDate;
    if (d <= s.today.date) throw new MockError('BAD_DATE', '시험일은 내일 이후로 골라 주세요');
    changes.push(
      { label: '시험일', before: md(x.examDate), after: md(d) },
      {
        label: 'D-day',
        before: `D-${dayjs(x.examDate).diff(dayjs(s.demo.today), 'day')}`,
        after: `D-${dayjs(d).diff(dayjs(s.demo.today), 'day')}`,
      },
    );
    if (d < x.examDate) {
      const before = planDays(s).filter((y) => y < d);
      const load = Object.fromEntries(
        before.map((y) => [y, dayList(s, y).reduce((n, t) => n + t.minutes, 0)]),
      );
      for (const day of planDays(s).filter((y) => y >= d))
        for (const t of dayList(s, day).filter((t) => t.subjectId === id && isTodo(t))) {
          const to = before.sort((a, b) => load[a] - load[b] || b.localeCompare(a))[0];
          if (!to) throw new MockError('NO_DAY', '새 시험일 전에 옮길 날이 없어요');
          load[to] += t.minutes;
          moves.push({ taskId: t.id, title: t.title, minutes: t.minutes, from: day, to });
        }
    }
  }
  if (!changes.length) throw new MockError('NO_CHANGE', '바뀌는 것이 없어요');
  return remember(
    s,
    'subject-edit',
    { id, patch },
    {
      subjectName: x.name,
      changes,
      days: moves.map((m) => ({
        date: m.from,
        text: `${md(m.from)} ${m.title}(${m.minutes}분) → ${md(m.to)}`,
      })),
      moves,
      note: moves.length
        ? '새 시험일 이후 태스크를 그 전 가장 한가한 날 끝으로 옮겨요.'
        : '바뀌는 날은 없어요 · 계획은 그대로예요',
    },
  );
}

export function applySubjectEdit(id) {
  const s = db.get();
  const { payload, view } = takePending(s, 'subject-edit');
  if (payload.id !== id) throw new MockError('NO_PREVIEW', '먼저 바뀌는 것을 미리 봐 주세요');
  const x = subjectOf(s, id);
  const r = s.readiness.find((y) => y.subjectId === id);
  if (payload.patch.goal != null) x.goal = payload.patch.goal;
  if (payload.patch.target != null) r.target = Number(payload.patch.target);
  if (payload.patch.goal != null) r.targetLabel = payload.patch.goal;
  if (payload.patch.examDate) x.examDate = payload.patch.examDate;
  for (const m of view.moves) {
    const src = dayList(s, m.from);
    const t = src.find((y) => y.id === m.taskId);
    if (!t) continue;
    src.splice(src.indexOf(t), 1);
    delete t.start;
    dayList(s, m.to).push(t);
  }
  return subjectView(s, x);
}

// 과목 빼기 미리보기 → 적용 → 빈 시간 안 (P5). 남은 태스크는 보충까지 빼고 기록·점수·책은 그대로 (11/10 결정 A)
export function previewSubjectRemove(id) {
  const s = db.get();
  const x = subjectOf(s, id);
  const removed = planDays(s).flatMap((d) =>
    placeDay(s, d)
      .filter((b) => b.task.subjectId === id && isTodo(b.task))
      .map((b) => ({
        date: d,
        taskId: b.task.id,
        title: b.task.title,
        minutes: b.task.minutes,
        start: toHM(b.start),
        end: toHM(b.end),
      })),
  );
  return remember(
    s,
    'subject-remove',
    { id },
    {
      subjectName: x.name,
      changes: [
        { label: '과목', before: `${x.name} · 시험 ${md(x.examDate)}`, after: '계획에서 빠짐' },
        { label: '남은 태스크', before: `${removed.length}개`, after: '0개' },
      ],
      days: removed.map((r) => ({
        date: r.date,
        text: `${md(r.date)} ${r.title}(${r.minutes}분) 빠짐`,
      })),
      removed,
      note: '기록·퀴즈 점수·쌓인 책은 그대로예요. 빈 시간은 다음 팝업에서 어떻게 쓸지 골라요.',
    },
  );
}

export function applySubjectRemove(id) {
  const s = db.get();
  const { payload, view } = takePending(s, 'subject-remove');
  if (payload.id !== id) throw new MockError('NO_PREVIEW', '먼저 바뀌는 것을 미리 봐 주세요');
  const x = subjectOf(s, id);
  for (const r of view.removed) {
    const list = dayList(s, r.date);
    const t = list.find((y) => y.id === r.taskId);
    if (t) list.splice(list.indexOf(t), 1);
  }
  x.removed = true;
  const first = view.removed[0];
  if (!first) return { emptyTime: null };
  s.pendingEmpty = { date: first.date, start: first.start, end: first.end };
  return emptyTimeView(s, s.pendingEmpty);
}

// S13 계획 추가 (PL-09): 확인 전에는 계획 그대로, 확인 뒤 빈 시간에만 (기존 블록 뒤로)
export function previewAddition(body) {
  const s = db.get();
  const x = subjectOf(s, body.subjectId);
  const mat = subjectView(s, x).materials.find((m) => m.id === body.materialId);
  if (!mat) throw new MockError('NO_MATERIAL', '자료를 골라 주세요');
  const from = Number(body.from);
  const to = Number(body.to);
  const perDay = Number(body.minutesPerDay);
  if (!(from >= 1 && to >= from && to <= mat.pages))
    throw new MockError('BAD_RANGE', `p.1–${mat.pages} 안에서 골라 주세요`);
  if (!(perDay >= 15 && perDay <= 180))
    throw new MockError('BAD_MINUTES', '하루 15~180분 사이로 적어 주세요');
  const dates = datesBetween(body.startDate, body.endDate).filter(
    (d) => d >= s.today.date && body.days.includes(dow(d)),
  );
  if (!dates.length) throw new MockError('NO_DAYS', '기간 안에 고른 요일이 없어요');
  const perDayPages = Math.max(1, Math.floor(perDay / MIN_PER_PAGE_PLAN));
  const placements = [];
  let cur = from;
  for (const d of dates) {
    if (cur > to) break;
    const end = Math.min(to, cur + perDayPages - 1);
    const minutes = Math.round(((end - cur + 1) * MIN_PER_PAGE_PLAN) / 5) * 5;
    const last = placeDay(s, d).at(-1);
    const start = last ? last.end : baseStart(s, d);
    placements.push({
      date: d,
      start: toHM(start),
      end: toHM(start + minutes),
      from: cur,
      to: end,
      minutes,
      reason: last ? '기존 공부 뒤 빈 시간' : '수업·알바를 피한 빈 시간',
    });
    cur = end + 1;
  }
  const conflicts = placements.filter((p) =>
    fixedOn(s, p.date).some((f) => toMin(p.start) < toMin(f.end) && toMin(p.end) > toMin(f.start)),
  ).length;
  const pages = to - from + 1;
  const left = cur <= to ? to - cur + 1 : 0;
  return remember(s, 'addition', body, {
    summary: {
      subjectName: x.name,
      materialName: mat.name,
      from,
      to,
      pages,
      minutesPerDay: perDay,
      totalMinutes: Math.round(pages * MIN_PER_PAGE_PLAN),
      days: body.days,
      startDate: body.startDate,
      endDate: body.endDate,
    },
    placements,
    conflicts,
    leftPages: left,
    note: `겹치는 일정 ${conflicts}개 · 기존 계획은 그대로예요${left ? ` · 기간 안에 ${left}쪽이 남아요` : ''}`,
  });
}

export function applyAddition() {
  const s = db.get();
  const { payload, view } = takePending(s, 'addition');
  const short = view.summary.materialName
    .replace(/\.pdf$/i, '')
    .split('_')
    .at(-1);
  view.placements.forEach((p, i) => {
    dayList(s, p.date).push({
      id: `pa${Object.keys(s.weekPlan).length}${Date.now() % 10000}${i}`,
      subjectId: payload.subjectId,
      unitNo: null,
      title: short,
      from: p.from,
      to: p.to,
      minutes: p.minutes,
      start: p.start,
      reason: `계획 추가 · 하루 ${view.summary.minutesPerDay}분`,
      status: 'todo',
      donePages: 0,
      added: true,
    });
  });
  return { added: view.placements.length };
}

// PL-10 오늘 계획 (Could, mock): 30분 더 · 오늘 쉬기 · 태스크 미루기(그 과목 다음 공부일 첫 태스크로). 다시 만들기는 막아 둠
function nextStudyDay(s, subjectId) {
  const later = datesBetween(
    dayjs(s.today.date).add(1, 'day').format('YYYY-MM-DD'),
    dayjs(s.today.date).add(7, 'day').format('YYYY-MM-DD'),
  );
  return later.find((d) => dayList(s, d).some((t) => t.subjectId === subjectId)) ?? later[0];
}

function todayPlanMoves(s, action, taskId) {
  const todo = s.today.tasks.filter(isTodo);
  if (action === 'more30') {
    const t = todo.at(-1);
    if (!t) throw new MockError('NO_TASK', '오늘 남은 태스크가 없어요');
    return {
      changes: [{ label: t.title, before: `${t.minutes}분`, after: `${t.minutes + 30}분` }],
      moves: [],
      extend: t.id,
    };
  }
  const targets = action === 'rest' ? todo : todo.filter((t) => t.id === taskId);
  if (!targets.length)
    throw new MockError(
      'NO_TASK',
      action === 'rest' ? '오늘 남은 태스크가 없어요' : '미룰 태스크를 골라 주세요',
    );
  const moves = targets.map((t) => ({
    taskId: t.id,
    title: t.title,
    minutes: t.minutes,
    to: nextStudyDay(s, t.subjectId),
  }));
  return {
    changes: moves.map((m) => ({
      label: m.title,
      before: `오늘 ${md(s.today.date)}`,
      after: `${md(m.to)} 첫 태스크`,
    })),
    moves,
  };
}

export function previewTodayPlan(action, taskId) {
  const s = db.get();
  if (action === 'rebuild')
    throw new MockError('NOT_READY', '계획 다시 만들기는 기획 확인 중이에요', 501);
  const m = todayPlanMoves(s, action, taskId);
  return remember(
    s,
    'today',
    { action, taskId },
    {
      action,
      changes: m.changes,
      days: m.moves.map((x) => ({
        date: x.to,
        text: `${x.title}(${x.minutes}분) → ${md(x.to)} 첫 태스크`,
      })),
      moves: m.moves,
      extend: m.extend ?? null,
      note: '기록·퀴즈 점수·쌓인 책은 그대로예요',
    },
  );
}

export function applyTodayPlan(action) {
  const s = db.get();
  const { payload, view } = takePending(s, 'today');
  if (payload.action !== action)
    throw new MockError('NO_PREVIEW', '먼저 바뀌는 것을 미리 봐 주세요');
  if (view.extend) s.today.tasks.find((t) => t.id === view.extend).minutes += 30;
  for (const m of view.moves) {
    const t = s.today.tasks.find((y) => y.id === m.taskId);
    if (!t) continue;
    s.today.tasks.splice(s.today.tasks.indexOf(t), 1);
    delete t.start;
    dayList(s, m.to).unshift({ ...t, carried: false, reason: '오늘에서 미뤘어요' });
  }
  if (s.notice?.type === 'carry' && !s.today.tasks.some((t) => t.carried)) s.notice = null;
  return { action, moved: view.moves.length };
}

// ── 월간 보기 (S15 · MO-01·02) · 월간 리포트 (S15-1 · MO-03) ───────────
// 하루 = 세워 꽂힌 책 1권. 높이 = 한 페이지 ÷ 계획 페이지 (보충 포함, 100% 상한). 집계는 서버, 숫자만
const pagesOfTask = (t) => (t.from && t.to ? t.to - t.from + 1 : 0);
function dayRecord(s, date) {
  const log = s.monthLog.find((l) => l.date === date);
  if (log) {
    const plan = Object.values(log.pages).reduce((n, x) => n + x, 0);
    return {
      plan,
      done: plan,
      minutes: log.minutes,
      bySubject: log.pages,
      review: Boolean(log.review),
      estimated: Boolean(log.estimated),
    };
  }
  // 읽기만 해요 (dayList는 빈 날 칸을 만들어서 쓰지 않아요)
  const tasks =
    date === s.today.date
      ? s.today.tasks
      : date < s.today.date
        ? s.pastTasks.filter((t) => t.date === date)
        : (s.nextDayTasks[date] ?? s.weekPlan[date] ?? []);
  if (!tasks.length) return null;
  const bySubject = {};
  for (const t of tasks) bySubject[t.subjectId] = (bySubject[t.subjectId] ?? 0) + pagesOfTask(t);
  return {
    plan: tasks.reduce((n, t) => n + pagesOfTask(t), 0),
    done: date <= s.today.date ? tasks.reduce((n, t) => n + (t.donePages ?? 0), 0) : 0,
    minutes: tasks.reduce((n, t) => n + t.minutes, 0),
    bySubject,
    review: tasks.some((t) => !t.from || /총복습/.test(t.title)),
    estimated: false,
  };
}

export function monthlyView(month) {
  const s = db.get();
  const first = dayjs(`${month}-01`);
  const start = first.subtract((first.day() + 6) % 7, 'day'); // 그 주 월요일
  const last = first.endOf('month');
  const end = last.add((7 - last.day()) % 7, 'day'); // 그 주 일요일
  const days = datesBetween(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')).map((date) => {
    const r = dayRecord(s, date);
    const future = date > s.today.date;
    const exams = s.subjects.filter((x) => !x.removed && x.examDate === date).map((x) => x.name);
    return {
      date,
      inMonth: date.slice(0, 7) === month,
      today: date === s.today.date,
      future,
      planned: Boolean(r),
      plan: r?.plan ?? 0,
      done: r?.done ?? 0,
      rate: r && !future && r.plan ? Math.min(100, Math.round((r.done / r.plan) * 100)) : null,
      bySubject: r
        ? Object.entries(r.bySubject)
            .filter(([, n]) => n > 0)
            .map(([subjectId, pages]) => ({ subjectId, pages }))
        : [],
      labels: [...(r?.review ? ['총복습'] : []), ...exams.map((n) => `${n} 시험`)],
      estimated: r?.estimated ?? false,
    };
  });
  return {
    month,
    today: s.demo.today,
    subjects: s.subjects.map(({ id, name, color }) => ({ id, name, color })),
    days,
    note: s.monthLog.some((l) => l.estimated) ? '11/8 보충 17p는 추정값이에요' : null,
  };
}

export function monthlyReportView(month) {
  const s = db.get();
  const start = s.planCreatedAt ?? s.demo.planCreatedAt;
  const until = s.today.date;
  const dates = datesBetween(start, until).filter((d) => d.slice(0, 7) === month);
  const recs = dates.map((d) => dayRecord(s, d)).filter(Boolean);
  const plan = recs.reduce((n, r) => n + r.plan, 0);
  const done = recs.reduce((n, r) => n + r.done, 0);
  const measured = Object.values(s.studySessions)
    .filter((x) => x.status === 'ended' && x.date.slice(0, 7) === month)
    .reduce((n, x) => n + x.minutes, 0);
  const studied = s.readiness.map((r) => ({ subjectId: r.subjectId, pages: r.studiedPages ?? 0 }));
  const studiedTotal = studied.reduce((n, x) => n + x.pages, 0);
  const grades = s.subjects.flatMap((x) =>
    (s.bookshelf[x.id] ?? [])
      .filter((u) => u.grade)
      .map((u) => ({
        subjectId: x.id,
        unitNo: u.unitNo,
        title: x.units.find((y) => y.no === u.unitNo)?.title ?? '',
        before: null, // 11/3 계획 시작 때는 퀴즈 전
        after: { grade: u.grade, score: u.score },
      })),
  );
  return {
    month,
    from: start,
    until,
    studyDays: recs.filter((r) => r.done > 0).length,
    plannedDays: recs.length,
    achievement: { done, plan, rate: plan ? Math.round((done / plan) * 100) : 0 },
    time: { measuredMinutes: measured, plannedMinutes: recs.reduce((n, r) => n + r.minutes, 0) },
    quiz: s.monthQuiz,
    subjects: studied.map((x) => ({
      ...x,
      share: studiedTotal ? Math.round((x.pages / studiedTotal) * 100) : 0,
    })),
    grades,
    mockFilled: ['measuredMinutes', 'quiz'], // 측정 합계는 시드 측정 시간을 받기 전 · 퀴즈 수는 v2-plan 값
  };
}

// ── 다시 나누기 (S5-1 · S5-2, PL-06) ─────────────────────
// mock: 정해 둔 안 3개 중 하나를 골라요. 실제로는 AI가 요청을 읽고 태스크 분할 · 날짜 배치를 새로 짜요.
// TODO(확인필요): [백엔드 확정 필요] 요청 해석 · 후속 질문 기준 · 새 안 만들기는 AI 몫이에요.
// 기존 안: 날짜별 공부 시간(분) 11/3 화 ~ 11/16 월 — 백엔드 demo_data.PLAN (11/14 시드 교체)
const PLAN_2W = [25, 25, 25, 0, 0, 0, 75, 25, 25, 25, 0, 0, 25, 25];
const PLAN_START = '2026-11-03';
// 안마다 바뀌는 날의 과목별 증감(분). S5 첫 주 미리보기에도 같은 값을 더해요
// TODO(확인필요): [기획 확인] 새 시드(11/14)의 다시 나누기 비교안이 없어서 비워 뒀어요. 옛 안은 자료구조 2주 계획 기준이었어요
const RESPLITS = {
  weekday: { moves: {}, reasons: [] },
  sunday: { moves: {}, reasons: [] },
  other: { moves: {}, reasons: [] },
};
const RESPLIT_ASK = {
  text: '토요일 분량은 평일에 나눌까요, 일요일로 옮길까요?',
  choices: ['평일에 나눠서', '일요일로'],
};
const SAVED_REQUEST = '토요일은 약속 있어서 쉬고 싶어 · 평일에 나눠서';

const sumMoves = (m) => Object.values(m ?? {}).reduce((n, v) => n + v, 0);
// S5 첫 주 미리보기에 승인한 안을 더해요
export function resplitMinutes(date, minutes) {
  const m = RESPLITS[db.get().setup.resplit]?.moves[date];
  if (!m) return minutes;
  const out = { ...minutes };
  for (const [k, v] of Object.entries(m)) out[k] = (out[k] ?? 0) + v;
  return out;
}

// 요청 한 줄 → 안 고르기. 비우면 다른 버전, 토요일만 말하고 옮길 곳이 없으면 후속 질문 1개 (최대 1번)
// ponytail: 키워드 몇 개만 봐요. 그 밖의 요청은 다른 버전으로 — 실제 해석은 AI
function resplitKind(request, answer) {
  const t = `${request} ${answer ?? ''}`;
  if (!request.trim() && !answer) return 'other';
  if (/일요일/.test(t)) return 'sunday';
  if (/평일|화·목|화요일|목요일/.test(t)) return 'weekday';
  if (/토요일|주말/.test(t)) return answer ? 'weekday' : null;
  return 'other';
}

export function requestResplit({ request = '', answer, saved }) {
  const s = db.get();
  if (saved) {
    s.setup.pendingResplit = { kind: 'weekday', request: SAVED_REQUEST, saved: true };
    return { ready: true };
  }
  const kind = resplitKind(request, answer);
  if (!kind) return { question: RESPLIT_ASK };
  const text = [request.trim(), answer].filter(Boolean).join(' · ') || '다른 버전으로';
  s.setup.pendingResplit = { kind, request: text, saved: false };
  return { ready: true };
}

export function resplitView() {
  const s = db.get();
  const p = s.setup.pendingResplit;
  if (!p) throw new MockError('NO_RESPLIT', '비교할 새 안이 없어요', 404);
  const base = RESPLITS[s.setup.resplit]?.moves ?? {};
  const next = RESPLITS[p.kind].moves;
  const days = PLAN_2W.map((min, i) => {
    const date = dayjs(PLAN_START).add(i, 'day').format('YYYY-MM-DD');
    const before = min + sumMoves(base[date]);
    const after = min + sumMoves(next[date]);
    return { date, before, after, changed: before !== after };
  });
  const total = (k) => days.reduce((n, d) => n + d[k], 0);
  const max = (k) => Math.max(...days.map((d) => d[k]));
  const sat = (k) => days.filter((d) => dayjs(d.date).day() === 6).reduce((n, d) => n + d[k], 0);
  return {
    request: p.request,
    keep: '분량 조정 · 목표 · 일정 · 단원',
    saved: p.saved,
    days,
    stats: [
      { label: '2주 공부 시간', unit: 'min', before: total('before'), after: total('after') },
      { label: '가장 긴 날', unit: 'min', before: max('before'), after: max('after') },
      { label: '토요일 공부', unit: 'min', before: sat('before'), after: sat('after') },
      { label: '바뀐 날', unit: 'day', before: 0, after: days.filter((d) => d.changed).length },
    ],
    reasons: RESPLITS[p.kind].reasons,
  };
}

export function applyResplit() {
  const setup = db.get().setup;
  if (!setup.pendingResplit) throw new MockError('NO_RESPLIT', '비교할 새 안이 없어요', 404);
  setup.resplit = setup.pendingResplit.kind;
  setup.pendingResplit = null;
  return { applied: setup.resplit };
}

export function cancelResplit() {
  db.get().setup.pendingResplit = null;
  return { applied: db.get().setup.resplit };
}
