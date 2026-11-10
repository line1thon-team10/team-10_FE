// 서버 응답 → 화면 모양 (S12 집중 모드 · S12-1 공부 끝)
// TODO(확인필요): [백엔드 확정 필요] 측정 세션 형식 (백엔드 A)

export const toSession = (raw) =>
  raw && {
    id: raw.id,
    taskId: raw.taskId,
    subjectId: raw.subjectId,
    subjectName: raw.subjectName,
    task: raw.task, // { title, from, to, pages, minutes(예상) }
    status: raw.status, // active | paused | ended
    quote: raw.quote, // 들어올 때 고른 문구 1개 (HM-10)
    material: raw.material, // [자료 열기] { id, page }
    minutes: raw.minutes, // 서버가 잰 공부 시간 (멈춘 시간 뺌)
    pausedMinutes: raw.pausedMinutes,
    checkIn: raw.checkIn, // 예상 2배 지남 → '아직 공부 중이에요?' (HM-09)
    autoStopped: raw.autoStopped, // 알림 뒤 10분 무응답 → 알림 시점에서 멈춤
    excludeFromPace: raw.excludeFromPace, // 속도 보정(PL-07)에서 뺀 기록
    recorded: raw.recorded,
    todayMinutes: raw.todayMinutes,
    subjectMinutes: raw.subjectMinutes,
  };
