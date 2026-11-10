// 서버 응답 → 화면 모양 (S8 오늘의 퀴즈 · S8-2 결과)
// TODO(확인필요): [백엔드 확정 필요] 퀴즈 문항 JSON(김현민)과 채점 결과 형식(백엔드 B)이 나오면 여기만 맞춰요.

export const toQuizToday = (raw) => ({
  date: raw.date,
  rate: raw.rate, // 오늘 계획 진행률 (S8-1 머리)
  open: raw.open, // 오늘 계획 70% 이상 → 전체 열림
  openRate: raw.openRate,
  subjects: raw.subjects.map((s) => ({
    subjectId: s.subjectId,
    name: s.name,
    color: s.color,
    count: s.count,
    rate: s.rate, // 과목별 오늘 진행률
    open: s.open, // 전체 70% 또는 과목별 70%를 넘으면 열림 (QZ-02)
    hasQuestions: s.hasQuestions,
    lines: s.lines ?? [], // 구성 줄 (예: 3단원 새 문제 5 (p.72–88))
    round: s.round ?? null,
    difficulty: s.difficulty ?? null,
    essayCount: s.essayCount ?? null,
    result: s.result, // 이미 풀었으면 { correct, total }
  })),
});

export const toQuizSet = (raw) => ({
  subjectId: raw.subjectId,
  name: raw.name,
  round: raw.round, // 1회독 · 2회독 …
  difficulty: raw.difficulty, // 1회독은 하 고정 (QZ-09)
  composition: raw.composition,
  questions: raw.questions.map((q) => ({
    id: q.id,
    type: q.type, // choice(객관식·OX) | short(단답형) | essay(서술형)
    tag: q.tag, // '어제 오답' 등
    unitNo: q.unitNo,
    page: q.page, // 근거 페이지 (QZ-03)
    prompt: q.prompt,
    options: q.options,
    mockFilled: q.mockFilled ?? [], // mock: 목업에서 채운 항목
  })),
});

// 화면 → 서버: 답 + 확신도 (QZ-05)
export const fromAnswers = (answers) =>
  Object.entries(answers).map(([questionId, a]) => ({
    questionId,
    choice: a.choice ?? null,
    text: a.text ?? null,
    confidence: a.confidence ?? null,
  }));

const toBookSide = (b) => ({ score: b.score, grade: b.grade, blocks: b.blocks });

export const toQuizResult = (raw) => ({
  subjectId: raw.subjectId,
  name: raw.name,
  essayGrading: raw.essayGrading ?? 'ai', // ai | saved (저장된 채점, NF-10)
  summary: raw.summary, // { total, correct, sureCorrect, unsureCorrect, wrong }
  items: raw.items.map((i) => ({
    questionId: i.questionId,
    no: i.no,
    unitNo: i.unitNo,
    type: i.type,
    tag: i.tag,
    prompt: i.prompt,
    page: i.page,
    confidence: i.confidence,
    correct: i.correct,
    score: i.score, // 서술형 0~100
    feedback: i.feedback, // 서술형 { good, miss }
    explanation: i.explanation, // 해설 (QZ-08, v2는 모든 문항)
    mockFilled: i.mockFilled ?? [],
  })),
  unitChanges: raw.unitChanges.map((c) => ({
    unitNo: c.unitNo,
    title: c.title,
    before: c.before,
    after: c.after,
    grade: c.grade,
    note: c.note ?? null,
  })),
  // P3 퀴즈 후 책 쌓기 (BK-08): 단원마다 퀴즈 전·후 책 더미. S9와 같은 값
  bookChanges: (raw.bookChanges ?? []).map((c) => ({
    unitNo: c.unitNo,
    title: c.title,
    before: toBookSide(c.before),
    after: toBookSide(c.after),
    recovering: c.recovering,
  })),
  wrongAdded: raw.wrongAdded, // 오답 노트에 들어간 문항 [{ no, reason }]
});
