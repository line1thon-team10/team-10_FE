// API 경로는 이 파일에서만 정해요.
// TODO(확인필요): [백엔드 확정 필요] 아래 경로는 전부 프론트 임시값이에요. 명세가 나오면 이 파일과 adapters/만 고쳐요.
export const EP = {
  session: '/api/session', // 익명 ID 발급 (NF-01)
  demoState: '/api/demo/state', // 데모 날짜와 첫 시험 (헤더 D-day)
  demoNextDay: '/api/demo/next-day', // 다음 날로: 자정 판정 실행 (NF-08)
  demoReset: '/api/demo/reset', // 시드 초기화 (NF-09)
};
