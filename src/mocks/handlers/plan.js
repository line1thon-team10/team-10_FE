import dayjs from 'dayjs';
import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { db } from '../db.js';
import { fail, ok } from './respond.js';

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
  return {
    subjectId,
    file: { name: sub.file.name, pages: sub.file.pages },
    units: units.map((u) => ({
      ...u,
      evidence: u.quizless
        ? ['목차를 직접 입력한 범위예요 (퀴즈 없음)']
        : evidenceOf(main, main.indexOf(u)),
    })),
  };
}

// S5 첫 주(11/3 화 ~ 11/9 월) 과목별 공부 시간(분). 데이터 세트 3장 날짜별 범위 × 약 2.5분/쪽, 하루 합계는 데이터 세트 값에 맞춘 mock
const FIRST_WEEK = [
  ['2026-11-03', { ds: 45, os: 50, net: 0 }],
  ['2026-11-04', { ds: 40, os: 0, net: 0 }],
  ['2026-11-05', { ds: 60, os: 0, net: 20 }],
  ['2026-11-06', { ds: 0, os: 40, net: 0 }],
  ['2026-11-07', { ds: 30, os: 30, net: 0 }],
  ['2026-11-08', { ds: 40, os: 25, net: 35 }],
  ['2026-11-09', { ds: 60, os: 45, net: 30 }],
];

function draftView() {
  const s = db.get();
  const first = [...s.subjects].sort((a, b) => a.examDate.localeCompare(b.examDate))[0];
  const target = s.onboardingScript.goalTargets;
  const goalLabel = {
    ds: `A+ (커트라인 ${target.ds}점)`,
    os: `B+ 이상 (${target.os}점)`,
    net: `통과 (${target.net}점)`,
  };
  return {
    today: s.onboardingDate,
    summary: {
      totalPages: s.planSummary.totalPages,
      taskCount: s.planSummary.taskCount,
      dailyAvgMinutes: s.planSummary.dailyAvgMinutes,
      daysToFirstExam: dayjs(first.examDate).diff(dayjs(s.onboardingDate), 'day'),
    },
    allocation: s.subjects.map((x) => ({
      subjectId: x.id,
      name: x.name,
      color: x.color,
      goalLabel: goalLabel[x.id],
      pages: x.file.pages,
      tasks: x.taskCount,
    })),
    firstWeek: FIRST_WEEK.map(([date, minutes]) => ({ date, minutes })),
    // 와이어프레임 S5 '이렇게 나눈 이유'
    reasons: [
      '자료구조는 시험이 가장 빠르고 목표가 높아 비중을 높였어요',
      '알바가 있는 수·금은 40분으로 줄이고, 일요일에 몰았어요',
      '3·4단원은 난이도가 높아 태스크를 더 잘게 나눴어요',
    ],
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
    return ok(unitsView(subjectId));
  }),
  http.get(EP.planDraft, () => ok(draftView(), 400)),
  http.post(EP.planApprove, () => {
    setup().approved = true;
    return ok({ approved: true }, 600);
  }),
];
