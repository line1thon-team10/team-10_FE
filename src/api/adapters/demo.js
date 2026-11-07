// TODO(확인필요): [백엔드 확정 필요] 데모 상태 응답 필드 (today, firstExam)
// today: 'YYYY-MM-DD' (데모 날짜), firstExam: 가장 가까운 시험 (D-day 기준)
export const toDemoState = (raw) => ({
  today: raw.today,
  firstExam: {
    subjectId: raw.firstExam.subjectId,
    name: raw.firstExam.name,
    examDate: raw.firstExam.examDate,
  },
});
