// 서버 응답 → 화면 모양 (S11 캘린더 · P5 빈 시간 · S6-4 말로 일정 추가)
// TODO(확인필요): [백엔드 확정 필요] 캘린더 · 빈 시간 안 · 재배치 미리보기 형식 (백엔드 A · AI)

export const toStudyBlock = (b) => ({
  id: b.id,
  subjectId: b.subjectId,
  subjectName: b.subjectName,
  color: b.color,
  title: b.title,
  from: b.from, // 쪽 범위 (총복습처럼 없으면 null)
  to: b.to,
  date: b.date,
  start: b.start,
  end: b.end,
  minutes: b.minutes,
  reason: b.reason, // 배치 이유 (AI)
  supplement: b.supplement,
  status: b.status,
  moved: b.moved, // 옮겨 둔 블록
});

export const toWeekCalendar = (raw) => ({
  from: raw.from,
  to: raw.to,
  today: raw.today,
  exams: raw.exams,
  // 고정 일정: id = '일정id@날짜', repeat = 반복 일정 (삭제 범위를 물어봐요)
  fixed: raw.fixed.map((f) => ({
    id: f.id,
    scheduleId: f.scheduleId,
    kind: f.kind,
    title: f.title,
    date: f.date,
    start: f.start,
    end: f.end,
    repeat: f.repeat,
    added: Boolean(f.added),
  })),
  study: raw.study.map(toStudyBlock),
  summary: raw.summary, // 이번 주 과목별 { minutes, count }
});

// P5 빈 시간 안 3개
export const toEmptyTime = (raw) => ({
  emptyTime: raw.emptyTime, // { date, start, end, label }
  options: raw.options.map((o) => ({
    key: o.key, // rest | pull | advance
    title: o.title,
    desc: o.desc,
    reason: o.reason ?? null,
    enabled: o.enabled,
    default: Boolean(o.default),
  })),
});

// S6-4 미리보기: 추가할 일정 + 옮길 태스크(지금 → 새 시간)
export const toVoicePreview = (raw) => ({
  event: raw.event, // { title, date, start, end, repeat, label }
  moves: raw.moves.map((m) => ({
    taskId: m.taskId,
    block: toStudyBlock(m.block),
    pieces: m.pieces, // [{ date, start, end, minutes, from, to }]
  })),
  note: raw.note,
});

// S15 월간 책장: 하루 = 책 1권 (rate = 한 페이지 ÷ 계획 페이지, 100% 상한)
export const toMonthly = (raw) => ({
  month: raw.month,
  today: raw.today,
  subjects: raw.subjects,
  days: raw.days.map((d) => ({
    date: d.date,
    inMonth: d.inMonth,
    today: d.today,
    future: d.future, // 오늘 이후 → 점선 칸
    planned: d.planned, // 계획 없던 날 → 빈 칸
    plan: d.plan,
    done: d.done,
    rate: d.rate,
    bySubject: d.bySubject, // [{ subjectId, pages }] 과목 비율 막대
    labels: d.labels, // 총복습 · 시험
    estimated: d.estimated, // 추정값 (11/8 보충)
  })),
  note: raw.note,
});

// S15-1 월간 리포트 (숫자만)
export const toMonthlyReport = (raw) => ({
  month: raw.month,
  from: raw.from,
  until: raw.until,
  studyDays: raw.studyDays,
  plannedDays: raw.plannedDays,
  achievement: raw.achievement, // { done, plan, rate }
  time: raw.time, // { measuredMinutes, plannedMinutes }
  quiz: raw.quiz, // { total, wrong, unsureRight }
  subjects: raw.subjects, // [{ subjectId, pages, share }] 새로 끝낸 범위
  grades: raw.grades, // [{ subjectId, unitNo, title, before, after: { grade, score } }]
  mockFilled: raw.mockFilled ?? [],
});
