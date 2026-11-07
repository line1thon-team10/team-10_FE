// 앱 이름과 정책 값은 이 파일 한 곳에서만 정해요.
// 수치 출처: 요구사항 정의서 4장. 판정·계산은 서버가 하고, 프론트는 안내 문구에만 써요.

export const APP_NAME = '피뢰침';

export const POLICY = {
  quizOpenRate: 70, // 오늘 계획 페이지의 70% 이상 기록하면 퀴즈가 열림 (4-4)
  essayPassScore: 85, // 서술형 85점 이상이면 정답 (4-1)
  carryThresholdRate: 50, // 밀린 페이지가 하루 평균의 50% 이상이면 분배안 (4-8)
  gradeStable: 80, // 80~99 안정 (4-2)
  gradeShaky: 50, // 50~79 흔들림, 50 미만 붕괴 위기 (4-2)
  taskMinMinutes: 15,
  taskMaxMinutes: 60,
};

// AI 응답 대기 화면 기준 — [임시] 제안안 값 (8초 지나면 안내, 30초 지나면 다시 시도)
export const AI_WAIT = { slowMs: 8_000, retryMs: 30_000 };
