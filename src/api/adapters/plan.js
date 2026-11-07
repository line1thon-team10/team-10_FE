// 서버 응답 → 화면 모양 (S3 자료 · S3-2 목차 · S4 단원 · S5 분량)
// TODO(확인필요): [백엔드 확정 필요] PDF 분해 JSON(김현민)과 분석 작업 진행 형식(백엔드 B)이 나오면 여기만 맞춰요.

export const toMaterials = (raw) => ({
  subjects: raw.subjects.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    files: s.files.map((f) => ({
      id: f.id,
      name: f.name,
      pages: f.pages,
      status: f.status,
      jobId: f.jobId,
      quizless: f.quizless,
    })),
  })),
});

export const toUploadStarted = (raw) => ({ materialId: raw.materialId, jobId: raw.jobId });

export const toJob = (raw) => ({
  jobId: raw.jobId,
  materialId: raw.materialId,
  subjectId: raw.subjectId,
  status: raw.status, // running | done | failed
  steps: raw.steps,
  current: raw.current,
  failedStep: raw.failedStep,
  progress: raw.progress,
  reused: raw.reused, // PDF-06 저장된 결과 재사용
  reason: raw.reason,
});

export const toUnit = (raw) => ({
  id: raw.id,
  no: raw.no,
  title: raw.title,
  concepts: raw.concepts ?? [],
  from: raw.from,
  to: raw.to,
  difficulty: raw.difficulty ?? null, // low | mid | high (AI 추정)
  quizless: Boolean(raw.quizless), // 목차 직접 입력 범위 (퀴즈 없음)
  evidence: raw.evidence ?? [], // PDF를 어떻게 나눴는지 근거 문장
});

export const toUnits = (raw) => ({
  subjectId: raw.subjectId,
  file: raw.file,
  units: raw.units.map(toUnit),
});
export const toTocUnits = (raw) =>
  raw.units.map((u) => ({ no: u.no, title: u.title, from: u.from, to: u.to }));

export const toPlanDraft = (raw) => ({
  today: raw.today,
  summary: raw.summary,
  allocation: raw.allocation,
  firstWeek: raw.firstWeek,
  reasons: raw.reasons,
});

// 화면 → 서버로 보낼 때 (evidence는 서버가 만드는 값이라 빼요)
export const fromUnit = (u) => ({
  id: u.id,
  no: u.no,
  title: u.title,
  concepts: u.concepts,
  from: u.from,
  to: u.to,
  difficulty: u.difficulty,
  quizless: u.quizless,
});
