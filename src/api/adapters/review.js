// 서버 응답 → 화면 모양 (S10 복습·오답)
// TODO(확인필요): [백엔드 확정 필요] 오답 노트·다시 풀기·문제 뽑기 형식 (백엔드 B · 김현민)

export const toNote = (n) => ({
  id: n.id,
  subjectId: n.subjectId,
  subjectName: n.subjectName,
  unitNo: n.unitNo,
  unitTitle: n.unitTitle,
  concept: n.concept, // 개념 ID (예: DS2-1 스택)
  question: n.question,
  page: n.page,
  type: n.type,
  wrongCount: n.wrongCount, // 틀린 횟수
  lastDate: n.lastDate,
  result: n.result, // sureWrong | unsureWrong | unsureRight | resolved
  score: n.score, // 서술형 점수
  streak: n.streak, // 확실 정답 연속 (2면 해결)
  canRetry: n.canRetry,
  history: n.history,
  mockFilled: n.mockFilled ?? [],
});

export const toNotes = (raw) => ({
  group: raw.group,
  total: raw.total,
  groups: raw.groups.map((g) => ({ key: g.key, label: g.label, items: g.items.map(toNote) })),
  weakConcepts: raw.weakConcepts.map((w) => ({
    subjectId: w.subjectId,
    subjectName: w.subjectName,
    concept: w.concept,
    count: w.count,
  })),
});

export const toRetryQuestion = (raw) => ({
  noteId: raw.noteId,
  type: raw.type,
  prompt: raw.prompt,
  options: raw.options,
  mockFilled: raw.mockFilled ?? [],
});

export const toRetryResult = (raw) => ({
  note: toNote(raw.note),
  correct: raw.correct,
  confidence: raw.confidence,
  score: raw.score,
  explanation: raw.explanation,
  wrongCountBefore: raw.wrongCountBefore,
  unitChange: raw.unitChange, // { unitNo, before: { score, grade }, after } 이해도 반영
});

export const toCustomQuiz = (raw) => ({
  quizId: raw.quizId, // /quiz?subject=quizId 로 풀어요
  count: raw.count,
  difficulty: raw.difficulty,
  note: raw.note,
});

export const toRelearn = (raw) => ({
  subjectId: raw.subjectId,
  unitNo: raw.unitNo,
  round: raw.round,
  relearnedOn: raw.relearnedOn,
});
