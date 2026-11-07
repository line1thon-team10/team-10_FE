import dayjs from 'dayjs';
import { SEED } from './data/seed.js';

// mock: 브라우저 메모리에만 있는 가짜 DB예요. 새로고침하면 처음 상태(11/9 오후 5시)로 돌아가요.

const freshOnboarding = () => ({
  stage: 0, // 0 첫 입력 전 · 1 자료구조 추가 질문 · 2 나머지 목표 질문 · 3 완료
  messages: [{ role: 'ai', text: SEED.onboardingScript.first }],
  chips: [],
  subjects: [],
  events: [],
  materials: {}, // { subjectId: [{ id, name, pages, status, jobId, quizless }] }
  jobs: {}, // { jobId: { startedAt, fail, subjectId, materialId } }
  units: {}, // { subjectId: [단원] } 사용자가 고친 결과
  approved: false,
});

// 시드 3개 (NF-09, 11/7 결정)
// empty: 빈 계정 — 11/3 계획 만들기 / day9: 11/9 오후 5시 (기본) / overdue: 11/9, 1·4번을 못 한 밀림 시나리오
export const SEEDS = {
  empty: '빈 계정 · 계획 만들기 (11/3)',
  day9: '11/9 오후 5시 (기본)',
  overdue: '밀림 시나리오 (11/9, 1·4번 못 함)',
};

function build(name) {
  const s = {
    ...structuredClone(SEED),
    setup: freshOnboarding(),
    seedName: name,
    hasPlan: name !== 'empty',
    pastTasks: [], // 지난 날의 태스크 (책 상태 계산용)
    notice: null, // 다음 접속 때 보여줄 이월 안내 (S6-2)
    replan: null, // 다음 접속 때 띄울 분배안 (P2)
    quizResults: {}, // { 'YYYY-MM-DD:subjectId': 결과 }
  };
  if (name === 'empty') s.demo.today = s.onboardingDate;
  if (name === 'overdue') {
    for (const t of s.today.tasks)
      if (t.id === 't1' || t.id === 't4')
        Object.assign(t, { status: 'todo', donePages: 0, doneTo: null });
  }
  return s;
}

let state = build('day9');

export const db = {
  get: () => state,
  seed: (name) => {
    state = build(SEEDS[name] ? name : 'day9');
    return state;
  },
  reset: () => db.seed('day9'),
  firstExam: () => {
    const upcoming = state.subjects
      .filter((s) => !dayjs(s.examDate).isBefore(state.demo.today, 'day'))
      .sort((a, b) => a.examDate.localeCompare(b.examDate));
    const s = upcoming[0] ?? state.subjects.at(-1);
    return { subjectId: s.id, name: s.name, examDate: s.examDate };
  },
};
