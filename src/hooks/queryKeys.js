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
};
