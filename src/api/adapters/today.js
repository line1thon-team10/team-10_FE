// 서버 응답 → 화면 모양 (홈 · 공부 기록)
// TODO(확인필요): [백엔드 확정 필요] 아래 왼쪽(화면) 이름은 그대로 두고, 오른쪽 raw 필드만 명세에 맞춰 바꿔요.

export const toSubject = (raw) => ({
  id: raw.id,
  name: raw.name,
  color: raw.color,
  examDate: raw.examDate,
});

export const toTask = (raw) => ({
  id: raw.id,
  subjectId: raw.subjectId,
  unitNo: raw.unitNo,
  title: raw.title,
  from: raw.from,
  to: raw.to,
  pages: raw.to - raw.from + 1,
  minutes: raw.minutes,
  reason: raw.reason, // 배치 이유 (PL-06, AI 문구)
  status: raw.status, // todo | partial | done | none
  donePages: raw.donePages,
  doneTo: raw.doneTo ?? null, // 부분 완료면 어디까지 했는지
});

export const toToday = (raw) => ({
  date: raw.date,
  subjects: raw.subjects.map(toSubject),
  tasks: raw.tasks.map(toTask),
  progress: {
    doneCount: raw.progress.doneCount,
    totalCount: raw.progress.totalCount,
    donePages: raw.progress.donePages,
    totalPages: raw.progress.totalPages,
    rate: raw.progress.rate, // 서버가 계산한 오늘 진행률(%)
  },
  quiz: {
    openRate: raw.quiz.openRate,
    open: raw.quiz.open,
    remainPages: raw.quiz.remainPages, // 70%까지 남은 페이지
    openSubjects: raw.quiz.openSubjects, // [{ subjectId, count }] 과목별 70%를 넘겨 먼저 풀 수 있는 퀴즈
    totalCount: raw.quiz.totalCount,
  },
  exams: raw.exams.map((e) => ({ subjectId: e.subjectId, dday: e.dday, readiness: e.readiness })),
  recentDays: raw.recentDays.map((d) => ({
    date: d.date,
    blocks: d.blocks.map((b) => ({ state: b.state, taskId: b.taskId ?? null })),
  })),
  streakDays: raw.streakDays,
});

// 기록 저장 결과: 어떤 연출을 띄울지 (BK-03). box = 박스 팝업(P1), toast = 가벼운 알림(P1-1)
export const toRecordResult = (raw) => ({
  event: raw.event
    ? {
        type: raw.event.type,
        reason: raw.event.reason,
        message: raw.event.message,
        rate: raw.event.rate,
      }
    : null,
});

export const toInterpret = (raw) => ({ from: raw.from, to: raw.to, label: raw.label });
