import dayjs from 'dayjs';
import { SEED } from './data/seed.js';

// mock: 가짜 DB예요. 탭을 닫을 때까지 sessionStorage에 남아서 새로고침해도 이어져요 (11/10 Q6 A).
// 처음으로 돌리는 건 데모 메뉴의 시드 고르기·초기화뿐이에요. 저장하는 건 익명 데모 데이터뿐이고
// PDF 파일 원본은 여기 없어요 (materialStore 메모리에만).
const STORE_KEY = 'mock-db';

const freshOnboarding = () => ({
  stage: 0, // 0 첫 입력 전 · 1 자료구조 추가 질문 · 2 나머지 목표 질문 · 3 완료
  messages: [{ role: 'ai', text: SEED.onboardingScript.first }],
  chips: [],
  subjects: [],
  events: [],
  // { subjectId: [{ id, name, pages, status, jobId, quizless, ocr }] } — 스캔본은 미리 분석 완료 (와이어 S3)
  materials: {
    [SEED.scanFile.subjectId]: [
      {
        id: 'mscan',
        name: SEED.scanFile.name,
        size: null,
        pages: SEED.scanFile.pages,
        status: 'done',
        jobId: null,
        quizless: true,
        ocr: true,
      },
    ],
  },
  jobs: {}, // { jobId: { startedAt, fail, subjectId, materialId } }
  units: {}, // { subjectId: [단원] } 사용자가 고친 결과
  outOfExam: {}, // { subjectId: [단원 번호] } S4에서 시험 범위 체크를 뺀 단원 (PDF-08)
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
    dayClosedOn: null, // 하루 마무리 박스(P1)를 띄운 날 — 하루 한 번
  };
  if (name === 'empty') s.demo.today = s.onboardingDate;
  if (name === 'overdue') {
    for (const t of s.today.tasks)
      if (t.id === 't1' || t.id === 't4')
        Object.assign(t, { status: 'todo', donePages: 0, doneTo: null });
  }
  return s;
}

function load() {
  try {
    const saved = sessionStorage.getItem(STORE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // 저장소를 못 쓰면 기본 시드로 시작해요
  }
  return build('day9');
}

let state = load();

// 응답을 만들 때마다 상태가 바뀔 수 있어서 페이지를 떠날 때 한 번 저장해요
addEventListener('pagehide', () => {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    // 저장 실패해도 시연은 이어져요 (새로고침하면 기본 시드)
  }
});

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
