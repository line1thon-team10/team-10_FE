// TanStack Query 키는 여기서만 정해요.
export const QK = {
  session: ['session'],
  demoState: ['demo', 'state'],
  today: ['today'],
  onboarding: ['onboarding'],
  calendar: ['onboarding', 'calendar'],
  materials: ['materials'],
  units: (subjectId) => ['units', subjectId],
  planDraft: ['plan', 'draft'],
  quizToday: ['quiz', 'today'],
  quizSet: (subjectId) => ['quiz', 'set', subjectId],
  quizResult: (subjectId) => ['quiz', 'result', subjectId],
  books: ['books'],
  activeSession: ['study', 'active'],
  studySession: (id) => ['study', 'session', id],
  notes: (group) => ['review', 'notes', group],
};
