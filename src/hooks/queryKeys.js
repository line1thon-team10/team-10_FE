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
  resplit: ['plan', 'resplit'],
  quizToday: ['quiz', 'today'],
  quizSet: (subjectId) => ['quiz', 'set', subjectId],
  quizResult: (subjectId) => ['quiz', 'result', subjectId],
  books: ['books'],
  subjects: ['subjects'],
  week: (from) => ['week', from],
  month: (m) => ['week', 'month', m], // 'week'로 묶어서 계획이 바뀌면 같이 다시 받아요
  monthReport: (m) => ['week', 'report', m],
  activeSession: ['study', 'active'],
  studySession: (id) => ['study', 'session', id],
  notes: (group) => ['review', 'notes', group],
};
