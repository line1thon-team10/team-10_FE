// 서버 응답 → 화면 모양 (S9 책 쌓기)
// TODO(확인필요): [백엔드 확정 필요] 단원별 블록(태스크) 목록과 등급·점수 형식 (BK-01~05, LV-02)

export const toBooks = (raw) => ({
  subjects: raw.subjects.map((s) => ({
    subjectId: s.subjectId,
    name: s.name,
    color: s.color,
    total: s.total, // 계획한 책(태스크) 수
    collected: s.collected, // 쌓인 책 수 (예정 제외)
    units: s.units.map((u) => ({
      no: u.no,
      title: u.title,
      from: u.from,
      to: u.to,
      grade: u.grade, // stable | shaky | risk | null (퀴즈 전)
      score: u.score, // 0~100, 없으면 null
      note: u.note,
      blocks: u.blocks.map((b) => ({ state: b.state, supplement: b.supplement, task: b.task })),
    })),
  })),
  readiness: raw.readiness.map((r) => ({
    subjectId: r.subjectId,
    readiness: r.readiness,
    target: r.target,
    targetLabel: r.targetLabel,
    progressRate: r.progressRate ?? null, // 진도율(%) = 공부한 페이지 ÷ 범위 (v2: 예상 완료율 → 진도율)
    mastery: r.mastery ?? null, // 숙달도(%), 없으면 null → 화면에 식을 안 보여요
    studiedPages: r.studiedPages ?? null, // 진도율 분자 (예: 88/140p)
    totalPages: r.totalPages ?? null,
  })),
});
