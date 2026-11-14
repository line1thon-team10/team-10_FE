import dayjs from 'dayjs';
import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { db } from '../db.js';
import {
  applyResplit,
  cancelResplit,
  requestResplit,
  resplitMinutes,
  resplitView,
} from '../logic.js';
import { aiRun, fail, ok, run } from './respond.js';

// mock: 단원(S4)·분량(S5). 근거 문구는 와이어프레임 S4 문장 틀을 따라 만든 mock이에요.
// TODO(확인필요): [백엔드 확정 필요] 근거 위치(목차 쪽·시작 쪽·좌표)는 김현민님 PDF 분해 결과 형식에 맞춰요.
const setup = () => db.get().setup;

function evidenceOf(units, i) {
  const u = units[i];
  const next = units[i + 1];
  return [
    `p.2 목차의 「${u.no}. ${u.title}」 항목과 일치`,
    `p.${u.from} 큰 제목 「Chapter ${u.no} ${u.title}」에서 시작`,
    next
      ? `p.${next.from} 다음 단원 제목 직전까지 (p.${u.from}–${u.to})`
      : `자료 마지막 쪽까지 (p.${u.from}–${u.to})`,
    u.concepts?.length
      ? `개념: 페이지별 소제목 ${u.concepts.map((c) => `「${c}」`).join('')}에서 추출`
      : null,
  ].filter(Boolean);
}

function unitsView(subjectId) {
  const sub = db.get().subjects.find((s) => s.id === subjectId);
  if (!sub) return null;
  const saved = setup().units[subjectId];
  const units = (saved ?? sub.units).map((u, i) => ({
    id: u.id ?? `${subjectId}-u${u.no}`,
    quizless: false,
    ...u,
    no: i + 1,
  }));
  const main = units.filter((u) => !u.quizless);
  const out = setup().outOfExam[subjectId] ?? [];
  return {
    subjectId,
    file: { name: sub.file.name, pages: sub.file.pages },
    units: units.map((u) => ({
      ...u,
      inExam: !out.includes(u.no),
      evidence: u.quizless
        ? ['목차를 직접 입력한 범위예요 (퀴즈 없음)']
        : evidenceOf(main, main.indexOf(u)),
    })),
  };
}

// S5 첫 주(11/3 화 ~ 11/9 월) 과목별 공부 시간(분) — 백엔드 demo_data.PLAN (11/14 시드 교체)
const FIRST_WEEK = [
  ['2026-11-03', { ai: 25, db: 0, os: 0 }],
  ['2026-11-04', { ai: 0, db: 25, os: 0 }],
  ['2026-11-05', { ai: 0, db: 0, os: 25 }],
  ['2026-11-06', { ai: 0, db: 0, os: 0 }],
  ['2026-11-07', { ai: 0, db: 0, os: 0 }],
  ['2026-11-08', { ai: 0, db: 0, os: 0 }],
  ['2026-11-09', { ai: 25, db: 25, os: 25 }],
];

// S5 분량 (PDF-05): 시험 범위에 든 단원만 더해요.
// mock: 과목 태스크 수 = 시드 태스크 수 × 남은 쪽 ÷ 전체 쪽 (11/10 결정 A). 단원별 블록 수는 시드 책 더미 권 수
const pagesOf = (u) => (u.from && u.to ? u.to - u.from + 1 : 0);
function allocationOf(sub) {
  const units = unitsView(sub.id).units.filter((u) => u.inExam && pagesOf(u) > 0);
  const pages = units.reduce((n, u) => n + pagesOf(u), 0);
  const perPage = sub.taskCount / sub.file.pages;
  const shelf = db.get().bookshelf[sub.id];
  return {
    pages,
    tasks: Math.round(sub.taskCount * (pages / sub.file.pages)),
    units: units.map((u) => ({
      no: u.no,
      title: u.title,
      pages: pagesOf(u),
      tasks:
        shelf.find((x) => x.unitNo === u.no)?.blocks.length ??
        Math.max(1, Math.round(pagesOf(u) * perPage)),
    })),
  };
}

function draftView() {
  const s = db.get();
  const first = [...s.subjects].sort((a, b) => a.examDate.localeCompare(b.examDate))[0];
  const alloc = Object.fromEntries(s.subjects.map((x) => [x.id, allocationOf(x)]));
  const all = Object.values(alloc);
  return {
    today: s.onboardingDate,
    summary: {
      totalPages: all.reduce((n, a) => n + a.pages, 0),
      taskCount: all.reduce((n, a) => n + a.tasks, 0),
      dailyAvgMinutes: s.planSummary.dailyAvgMinutes,
      daysToFirstExam: dayjs(first.examDate).diff(dayjs(s.onboardingDate), 'day'),
    },
    allocation: s.subjects.map((x) => ({
      subjectId: x.id,
      name: x.name,
      color: x.color,
      goalLabel: x.goalLabel,
      ...alloc[x.id],
    })),
    // 다시 나누기를 승인했으면 그 안을 더해요 (S5-2)
    firstWeek: FIRST_WEEK.map(([date, minutes]) => ({
      date,
      minutes: resplitMinutes(date, minutes),
    })),
    // 와이어프레임 S5 '이렇게 나눈 이유'
    // TODO(확인필요): [기획 확인] 새 시드(11/14)의 S5 이유 문구가 없어서 비워 뒀어요 (옛 문구는 자료구조 기준)
    reasons: [],
  };
}

export const planHandlers = [
  http.get(EP.units, ({ request }) => {
    const v = unitsView(new URL(request.url).searchParams.get('subjectId'));
    return v ? ok(v) : fail('SUBJECT_NOT_FOUND', '과목을 찾지 못했어요', 404);
  }),
  http.put(EP.units, async ({ request }) => {
    const { subjectId, units } = await request.json();
    setup().units[subjectId] = units;
    (setup().unitsEdited ??= {})[subjectId] = true; // S3 패키지 분석 결과가 고친 단원을 덮지 않게
    return ok(unitsView(subjectId));
  }),
  // S5 계획 생성 (AI): ?saved=1이면 미리 만든 2주 계획 (NF-10)
  http.get(EP.planDraft, ({ request }) => {
    const saved = new URL(request.url).searchParams.get('saved') === '1';
    return aiRun('plan', () => ({ ...draftView(), saved }), 1800, { saved });
  }),
  // S5-1 다시 나누기 요청 (AI): { question } 후속 질문 1개 또는 { ready } → S5-2 비교. saved면 저장된 결과
  http.post(EP.resplit, async ({ request }) => {
    const body = await request.json();
    return aiRun('plan', () => requestResplit(body), 1800, { saved: body.saved });
  }),
  // S5-2 기존 안 · 새 안 2주 비교
  http.get(EP.resplit, () => run(resplitView)),
  http.post(`${EP.resplit}/apply`, () => run(applyResplit)),
  http.delete(EP.resplit, () => run(cancelResplit)), // 되돌리기
  // 승인하면 시연일(11/9 오후 5시) 시드로 넘어가요 (11/7 결정: 계획 만들기 → 시연일로 점프)
  http.post(EP.planApprove, () => {
    db.seed('day9');
    return ok({ approved: true }, 600);
  }),
];
