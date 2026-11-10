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

export function recordTask(taskId, result, toPage) {
  const s = db.get();
  const task = s.today.tasks.find((t) => t.id === taskId);
  if (!task) throw new MockError('TASK_NOT_FOUND', '태스크를 찾지 못했어요', 404);
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
    custom: Boolean(set.subjectId), // 문제 뽑기로 만든 세트
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

  // 단원 점수 (mock): 확실 정답 +1 · 오답 −1, 회복 모드 하루 상한
  const unit = unitOf(s, n.subjectId, n.unitNo);
  let unitChange = null;
  if (unit?.score != null) {
    const delta = r === 'sureRight' ? 1 : correct ? 0 : -1;
    const key = `${s.today.date}:${n.subjectId}:${n.unitNo}`;
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
    unitChange = { unitNo: n.unitNo, before, after: { score: next, grade } };
  }
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
