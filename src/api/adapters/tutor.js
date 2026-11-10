// 서버 응답 → 화면 모양 (S6-3 AI 튜터)
// TODO(확인필요): [백엔드 확정 필요] 요청 { question, history } 형식(정의서 '제안', 김현민 확인 전), pages 안 모양

export const toTutorAnswer = (raw) => ({
  id: raw.id,
  subjectId: raw.subjectId,
  subjectName: raw.subjectName,
  question: raw.question,
  parentId: raw.parentId ?? null, // 쉬운 설명이면 원래 답의 id (TU-02)
  answer: raw.answer,
  pages: raw.pages.map((p) => ({ materialId: p.materialId, from: p.from, to: p.to })), // 근거 칩
  saved: Boolean(raw.saved), // 응답이 없어서 보여준 저장된 답
  mockFilled: raw.mockFilled ?? [],
});

// 화면 → 서버 (정의서 v2_2 4-14 제안): 기본 질문은 history = [], 쉬운 설명은 직전 한 쌍 1개
export const fromTutorAsk = ({ question, history = [] }) => ({
  question,
  history: history.map((h) => ({ question: h.question, answer: h.answer, pages: h.pages })),
});
