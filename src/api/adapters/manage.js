// 서버 응답 → 화면 모양 (S13 계획 추가 · S14 과목·계획 관리 · PL-10 오늘 계획)
// TODO(확인필요): [백엔드 확정 필요] 과목 카드 · 바뀜 미리보기 · 계획 추가 배치 형식 (백엔드 A · AI)

export const toSubjectCard = (x) => ({
  id: x.id,
  name: x.name,
  color: x.color,
  examDate: x.examDate,
  dday: x.dday,
  goal: x.goal,
  target: x.target, // 목표 점수 (커트라인)
  goalTotal: x.goalTotal,
  range: x.range, // { from, to, pages } 시험 범위
  progress: x.progress, // { studied, total, rate } 진도
  readiness: x.readiness,
  removed: x.removed,
  archived: x.archived, // 시험 끝 → 자동 보관
  materials: x.materials.map((m) => ({
    id: m.id,
    name: m.name,
    pages: m.pages,
    toc: m.toc,
    mock: Boolean(m.mock),
  })),
});

export const toSubjects = (raw) => ({
  today: raw.today,
  subjects: raw.subjects.map(toSubjectCard),
});

// 바뀌는 것 미리보기 (S14 오른쪽 · PL-10): 지금 → 바뀐 값 + 바뀌는 날
export const toPlanPreview = (raw) => ({
  subjectName: raw.subjectName ?? null,
  changes: raw.changes, // [{ label, before, after }]
  days: raw.days ?? [], // [{ date, text }]
  note: raw.note,
});

// S13 ⑤ 미리보기
export const toAdditionPreview = (raw) => ({
  summary: raw.summary,
  placements: raw.placements, // [{ date, start, end, from, to, minutes, reason }]
  conflicts: raw.conflicts,
  leftPages: raw.leftPages,
  note: raw.note,
});
