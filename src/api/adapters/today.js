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
  carried: Boolean(raw.carried), // 어제에서 이월된 태스크 (S6-2)
  measuredMinutes: raw.measuredMinutes ?? null, // 집중 모드로 잰 시간 (기록에 붙은 것)
  pendingSessionId: raw.pendingSessionId ?? null, // 재고 아직 기록 안 한 측정 ('기록 전 · N분')
  pendingMinutes: raw.pendingMinutes ?? null,
});

// 다음 접속 때 보여줄 안내 (S6-2 이월 · 분배안 적용 뒤)
const toNotice = (raw) =>
  raw && {
    type: raw.type, // carry | replanned
    planKey: raw.key ?? null,
    items: (raw.items ?? []).map((i) => ({
      subjectId: i.subjectId,
      from: i.from,
      to: i.to,
      pages: i.pages,
      dailyAvg: i.dailyAvg,
      ratio: i.ratio,
    })),
  };

// 분배안 (P2, RC-02·03). 기준을 넘었을 때만 와요
const toReplan = (raw) =>
  raw && {
    date: raw.date,
    totalPages: raw.totalPages,
    overdue: raw.overdue.map((o) => ({
      subjectId: o.subjectId,
      pages: o.pages,
      dailyAvg: o.dailyAvg,
    })),
    keepNote: raw.keepNote,
    options: raw.options.map((o) => ({
      key: o.key,
      lines: o.lines,
      effect: o.effect,
      preview: o.preview,
    })),
  };

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
  notice: toNotice(raw.notice),
  tutorSuggestions: raw.tutorSuggestions ?? [],
  replan: toReplan(raw.replan),
});

// 기록 저장 결과: 어떤 연출을 띄울지 (BK-03). box = 박스 팝업(P1), toast = 가벼운 알림(P1-1)
// reason: dayClose(하루 마무리) · unitDone · recover(회복) | record · rate70(알림)
export const toRecordResult = (raw) => ({
  event: raw.event
    ? {
        type: raw.event.type,
        reason: raw.event.reason,
        message: raw.event.message ?? null,
        detail: raw.event.detail ?? null,
        rate: raw.event.rate ?? null,
        planKey: raw.event.planKey ?? null, // 회복 박스: 적용한 분배안
        recordedCount: raw.event.recordedCount ?? null, // 하루 마무리: 기록한 태스크 수
        totalCount: raw.event.totalCount ?? null,
        donePages: raw.event.donePages ?? null,
        totalPages: raw.event.totalPages ?? null,
        opened: raw.event.opened ?? [], // 이번 기록으로 새로 열린 과목 퀴즈 [{ subjectId, count }]
      }
    : null,
});

export const toFixResult = (raw) => ({
  taskId: raw.taskId,
  status: raw.status,
  doneTo: raw.doneTo,
  rate: raw.rate,
});

export const toInterpret = (raw) => ({ from: raw.from, to: raw.to, label: raw.label });
