import dayjs from 'dayjs';
import { SEED } from './data/seed.js';

// mock: 브라우저 메모리에만 있는 가짜 DB예요. 새로고침하거나 "시드 초기화"를 누르면 처음 상태로 돌아가요.
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

const fresh = () => ({ ...structuredClone(SEED), setup: freshOnboarding() });
let state = fresh();

export const db = {
  get: () => state,
  reset: () => {
    state = fresh();
    return state;
  },
  nextDay: () => {
    // TODO(확인필요): 자정 판정(RC-01)·밀림 감지(RC-02) 결과는 백엔드 A가 계산해요. 목업은 날짜만 넘겨요.
    state.demo.today = dayjs(state.demo.today).add(1, 'day').format('YYYY-MM-DD');
    return state;
  },
  firstExam: () => {
    const upcoming = state.subjects
      .filter((s) => !dayjs(s.examDate).isBefore(state.demo.today, 'day'))
      .sort((a, b) => a.examDate.localeCompare(b.examDate));
    const s = upcoming[0] ?? state.subjects.at(-1);
    return { subjectId: s.id, name: s.name, examDate: s.examDate };
  },
};
