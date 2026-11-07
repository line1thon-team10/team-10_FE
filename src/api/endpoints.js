// API 경로는 이 파일에서만 정해요.
// TODO(확인필요): [백엔드 확정 필요] 아래 경로는 전부 프론트 임시값이에요. 명세가 나오면 이 파일과 adapters/만 고쳐요.
export const EP = {
  // 공통 · 데모
  session: '/api/session', // 익명 ID 발급 (NF-01)
  demoState: '/api/demo/state', // 데모 날짜와 첫 시험 (헤더 D-day)
  demoNextDay: '/api/demo/next-day', // 다음 날로: 자정 판정 실행 (NF-08)
  demoReset: '/api/demo/reset', // 시드 초기화 (NF-09)
  demoSeed: '/api/demo/seed', // 시드 불러오기: empty · day9 · overdue (NF-09)

  // 온보딩 (최초 1회)
  onboarding: '/api/onboarding', // S1 대화 상태 · 정리된 과목·일정
  onboardingMessage: '/api/onboarding/message', // S1 메시지 보내기 → AI 해석·추가 질문 (ON-01~03)
  calendar: '/api/onboarding/calendar', // S2 주간 일정 · 시험 · 이번 주 요약 (ON-04)
  events: '/api/onboarding/events', // S2 일정 추가 (POST) / 수정 (PATCH :id) / 삭제 (DELETE :id)
  eventsVoice: '/api/onboarding/events/voice', // S2 말로 일정 추가 (AI)
  materials: '/api/materials', // S3 과목별 자료 목록 · 업로드 (PDF-01)
  materialJob: '/api/materials/jobs', // S3 분석 진행 상태 (PDF-03) — /:jobId
  toc: '/api/materials/toc', // S3-2 목차 붙여넣기 → 단원 정리 (PDF-07)
  units: '/api/units', // S4 단원·개념·페이지 (PDF-04) — ?subjectId=
  planDraft: '/api/plan/draft', // S5 분량·배분 미리보기 (PDF-05)
  planApprove: '/api/plan/approve', // S5 승인 → 계획 확정

  // 홈 · 공부 기록
  today: '/api/today', // 오늘 할 일 · 진행률 · 퀴즈 열림 · 시험까지 · 최근 7일 책
  records: '/api/records', // 공부 기록 저장 (HM-02, HM-03)
  recordInterpret: '/api/records/interpret', // 말로 한 기록 → 페이지 (HM-04, AI)
  replan: '/api/plan/replan', // 분배안 적용 (RC-04)

  // 퀴즈 · 책 쌓기
  quizToday: '/api/quiz/today', // 과목별 오늘의 퀴즈 · 열림 여부 (QZ-02)
  quiz: '/api/quiz', // /:subjectId 문항 · /:subjectId/submit 제출 · /:subjectId/result 결과
  books: '/api/books', // 과목별 단원 책 더미 · 준비도 (BK-01~05, KP-01)
};
