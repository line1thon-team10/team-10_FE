import dayjs from 'dayjs';
import { SEED } from './data/seed.js';

// mock: 브라우저 메모리에만 있는 가짜 DB예요. 새로고침하거나 "시드 초기화"를 누르면 처음 상태로 돌아가요.
let state = structuredClone(SEED);

export const db = {
  get: () => state,
  reset: () => {
    state = structuredClone(SEED);
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
