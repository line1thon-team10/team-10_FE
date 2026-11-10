// 서버 응답 → 화면 모양 (온보딩 S1·S2)
// TODO(확인필요): [백엔드 확정 필요] AI 해석 결과(일정·시험·목표) 형식은 김현민님 출력 형식이 나오면 맞춰요.

// 일정 한 개. days(1=월…7=일)가 있으면 매주 반복, date가 있으면 하루짜리
export const toEvent = (raw) => ({
  id: raw.id,
  kind: raw.kind, // class | job | meet | other
  title: raw.title,
  days: raw.days ?? null,
  date: raw.date ?? null,
  start: raw.start,
  end: raw.end,
  added: Boolean(raw.added), // 방금 말로 추가한 일정
});

export const toOnboarding = (raw) => ({
  messages: raw.messages.map((m) => ({ role: m.role, text: m.text })),
  chips: raw.chips ?? [],
  subjects: raw.subjects.map((s) => ({
    id: s.id,
    name: s.name,
    examDate: s.examDate,
    goal: s.goal, // 목표 학점 (없으면 null → 화면에 [목표 학점])
    goalTotal: s.goalTotal, // 시험 총 목표 (커트라인·합격 기준)
    goalEtc: s.goalEtc, // 기타 정보 (반영 비율·교수님 강조 범위)
    target: s.target, // 내부 목표 점수 (4-6)
    status: s.status, // pending | asking | confirmed
  })),
  schedules: raw.schedules.map(toEvent),
  done: raw.done, // 모든 과목 목표 확정 → 다음 단계로 갈 수 있음 (ON-03)
});

export const toCalendar = (raw) => ({
  weekStart: raw.weekStart,
  today: raw.today,
  events: raw.events.map(toEvent),
  exams: raw.exams.map((e) => ({ subjectId: e.subjectId, name: e.name, examDate: e.examDate })),
  summary: { fixedMinutes: raw.summary.fixedMinutes, freeMinutes: raw.summary.freeMinutes },
  addedId: raw.addedId ?? null,
});
