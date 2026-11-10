import type {
  ManageSubject,
  OptionItem,
  PaceRow,
  PlanPreviewBlock,
  RescheduleMove,
} from "@/pages/manage/types";

export const manageSubjects: ManageSubject[] = [
  {
    id: "mg-ds",
    name: "자료구조",
    examDate: "11/12 (목)",
    dDay: "D-3",
    goal: "A+ (커트라인 90점)",
    range: "5단원 · 140p",
    progressPages: 88,
    totalPages: 140,
    accent: "green",
  },
  {
    id: "mg-os",
    name: "운영체제",
    examDate: "11/16 (월)",
    dDay: "D-7",
    goal: "B+ 이상 (80점)",
    range: "4단원 · 120p",
    progressPages: 67,
    totalPages: 120,
    accent: "amber",
  },
  {
    id: "mg-net",
    name: "컴퓨터네트워크",
    examDate: "11/18 (수)",
    dDay: "D-9",
    goal: "통과 (60점)",
    range: "4단원 · 100p",
    progressPages: 36,
    totalPages: 100,
    accent: "blue",
  },
];

/** 캘린더에서 고정 일정(11/13 알바)을 지워 생긴 빈 시간. 값이 있을 때만 빈 시간 칩을 보여줍니다. */
export const pendingEmptyTime = {
  slotLabel: "11/13 (금) 18:00–22:00",
  reason: "11/13 알바 삭제",
};

export const todayPlanNote =
  "30분 더 = 그 과목 다음 태스크 1개를 오늘로 · 오늘 쉬기 = 오늘 태스크를 남은 날에 나눠 넣고, 안 들어가면 분배안 · 다시 만들기 = 기록은 두고 남은 범위만 S5부터";

export const finishedSubjectsNote =
  "시험이 끝난 과목은 다음 날 자동으로 '끝난 과목'으로 옮겨지고 책 쌓기는 보관해요. 지금은 없음.";

export const initialAddedPlans = [
  {
    id: "ap-net-practice",
    subject: "컴퓨터네트워크",
    range: "p.15–45 · 31p",
    minutes: 78,
    days: "화·목 19:00–19:40",
  },
];

export const planPreviewBlocks: PlanPreviewBlock[] = [
  {
    id: "pb-1",
    date: "11/10 (화)",
    time: "19:00–19:40",
    range: "p.15–30",
    pages: "16p",
    minutes: "40분",
  },
  {
    id: "pb-2",
    date: "11/12 (목)",
    time: "19:00–19:40",
    range: "p.31–45",
    pages: "15p",
    minutes: "40분",
  },
];

export const planPreviewNote =
  "화·목은 수업이 15시에 끝나고 알바가 없어서 저녁이 비어요. 겹치는 일정 0개 · 기존 계획은 그대로예요.";

export const paceRows: PaceRow[] = [
  { id: "pr-1", task: "11/10 4단원 p.96–120 + 이월 p.89–95", now: "80분", after: "112분" },
  { id: "pr-2", task: "11/11 5단원 p.121–140", now: "50분", after: "70분" },
  { id: "pr-3", task: "11/11 총복습", now: "60분", after: "그대로 (페이지 기준 아님)" },
];

export const paceNote =
  "하루 공부 가능 시간을 넘는 태스크는 옆 날로 옮겨요. 넘치는 날이 생기면 [반영] 뒤에 분배안(P2)으로 이어져요.";

export const paceFootnote =
  "예상과 20% 이상 차이 날 때만, 과목당 하루 한 번 떠요. [그대로]면 아무것도 안 바뀌어요.";

export const catchUpOptions: OptionItem[] = [
  {
    id: "cu-a",
    title: "A · 시간 늘리기",
    note: "",
    bullets: ["11/10·11/11 하루 40분씩 추가", "범위는 그대로"],
    chip: "범위 100% 유지",
  },
  {
    id: "cu-b",
    title: "B · 범위 줄이기",
    note: "",
    bullets: [
      "자료구조 5단원 힙 정렬(p.135–140, 6p) 제외",
      "운영체제 4단원 세그멘테이션 사례(p.103–106, 4p) 제외",
    ],
    chip: "시간 유지 · 10p 제외",
  },
  {
    id: "cu-c",
    title: "C · 압축하기",
    note: "",
    bullets: ["밀린 태스크를 핵심 요약 위주로", "태스크 시간 30% 단축"],
    chip: "1회독 깊이 낮춤",
  },
];

export const catchUpPreviews: Record<string, string> = {
  "cu-a": "11/10 (화) 15:00–15:40 자료구조 · 3단원 p.72–95 추가 · 적용하면 남은 일정이 다시 그려져요",
  "cu-b": "11/10 (화) 15:00–15:40 자료구조 · 3단원 p.72–95 추가 · 시험 전 힙 정렬은 요약본으로 대체해요",
  "cu-c": "11/10 (화) 15:00–15:40 자료구조 · 3단원 요약 태스크 추가 · 태스크마다 30% 짧게 잡아요",
};

export const rescheduleMoves: RescheduleMove[] = [
  {
    id: "rs-1",
    subject: "운영체제",
    task: "3단원 p.68–76",
    from: "목 19:00",
    to: "금 15:00",
  },
  {
    id: "rs-2",
    subject: "운영체제",
    task: "3단원 p.77–85",
    from: "목 19:20",
    to: "토 14:00",
  },
];

export const rescheduleNote =
  "운영체제 시험(11/16) 전 완료 예상은 그대로예요 · 보충 학습은 옮기지 않았어요";

export const emptyTimeOptions: OptionItem[] = [
  {
    id: "et-rest",
    title: "① 그대로 쉬기 (기본)",
    note: "계획은 바뀌지 않아요.",
  },
  {
    id: "et-pull",
    title: "② 밀린 분량 당겨오기",
    note: "지금 밀리거나 이월된 분량이 없어요.",
    disabled: true,
  },
  {
    id: "et-move",
    title: "③ 다음 태스크 앞당기기",
    note:
      "운영체제 4단원 p.101–120 (50분)을 11/14(토)에서 11/13 18:00–18:50으로. 운영체제 시험 D-3이고, 토요일은 저녁 약속이 있어 미리 해두면 여유가 생겨요.",
  },
];

export const askBarPrompts = [
  "AVL 트리 회전은 언제 해?",
  "3단원 트리에서 뭐부터 봐야 해?",
];