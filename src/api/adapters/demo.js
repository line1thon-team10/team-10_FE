// TODO(확인필요): [백엔드 확정 필요] 데모 상태 응답 필드
// today: 'YYYY-MM-DD' 데모 날짜 · firstExam: 가장 가까운 시험 (D-day 기준), 시험이 없으면 null (C19) · seed: 지금 시드 이름
// judgment: '다음 날로' 직후 자정 판정 결과 — carry(이월) | replan(분배안) | none
export const toDemoState = (raw) => ({
  today: raw.today,
  firstExam: raw.firstExam && {
    subjectId: raw.firstExam.subjectId,
    name: raw.firstExam.name,
    examDate: raw.firstExam.examDate,
  },
  seed: raw.seed ?? null,
  seeds: raw.seeds ?? {},
  hasPlan: raw.hasPlan ?? true,
  judgment: raw.judgment ?? null,
});
