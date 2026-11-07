// 서버 값 → 화면 표시명은 이 파일에서만 바꿔요.
// TODO(확인필요): [백엔드 확정 필요] 서버 enum 값이 나오면 어댑터에서 아래 키로 바꿔 줘요.

// 블록(책) 상태 6개 — 정의서 4-5
export const BLOCK_STATE = {
  planned: { label: '예정' },
  doing: { label: '진행 중' },
  done: { label: '완료 (퀴즈 전)' },
  stable: { label: '안정', signal: '초록불' },
  shaky: { label: '흔들림', signal: '노란불' },
  risk: { label: '붕괴 위기', signal: '빨간불' },
};

// 단원 등급 — 정의서 4-2
export const GRADE = {
  risk: { label: '붕괴 위기', signal: '빨간불' },
  shaky: { label: '흔들림', signal: '노란불' },
  stable: { label: '안정', signal: '초록불' },
  perfect: { label: '완벽' },
};

export const RECORD_RESULT = { done: '완료', partial: '부분 완료', none: '못 함' };
export const QUIZ_TYPE = { choice: '객관식', ox: 'OX', short: '단답형', essay: '서술형' };
export const CONFIDENCE = { sure: '확실', unsure: '애매' };
export const DIFFICULTY = { low: '하', mid: '중', high: '상' };
export const PLAN_OPTION = { A: '시간 늘리기', B: '범위 줄이기', C: '압축하기' }; // RC-03
export const SCHEDULE_KIND = { class: '수업', job: '알바', meet: '약속', other: '일정' };
