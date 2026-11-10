import type {
  ChatExample,
  CompareStat,
  CompareWeek,
  PlanMaterial,
  PlanSubject,
  PlanUnit,
  PlanWeek,
  RepeatItem,
  TaskGroup,
  TaskSubject,
} from "@/pages/plan/types";

export const planSubjects: PlanSubject[] = [
  {
    id: "sub-data",
    name: "자료구조",
    examDate: "11/12",
    goal: "A+",
    totalGoal: "상대평가 상위 15% · 커트라인 90점",
    extraInfo: "중간 40% · 기말 40% · 교수님 강조 3단원 트리",
    status: "ready",
  },
  {
    id: "sub-os",
    name: "운영체제",
    examDate: "11/16",
    goal: "B+ 이상",
    totalGoal: "80점 이상",
    extraInfo: "기말 50%",
    status: "asking",
  },
  {
    id: "sub-network",
    name: "컴퓨터네트워크",
    examDate: "11/18",
    goal: "통과",
    totalGoal: "60점 이상",
    extraInfo: "기말 60%",
    status: "pending",
  },
];

export const planRepeats: RepeatItem[] = [
  { id: "rep-1", label: "월·수", time: "10:00–12:00 수업" },
  { id: "rep-2", label: "화·목", time: "13:00–15:00 수업" },
  { id: "rep-3", label: "월·수·금", time: "18:00–22:00 알바" },
  { id: "rep-4", label: "토", time: "18:00–21:00 약속" },
];

export const planChatExamples: ChatExample[] = [
  {
    role: "user",
    text: "월수금 저녁 6시부터 10시까지 카페 알바, 화요일이랑 목요일 오후에 수업 있어. 토요일 저녁엔 친구 약속. 기말은 자료구조 11월 12일, 운영체제 16일, 컴퓨터네트워크 18일. 자료구조는 A+ 받고 싶어.",
  },
  {
    role: "assistant",
    text: "자료구조 A+ 기준을 조금만 더 알려 줄래? 상대평가야, 절대평가야? A+는 몇 점 이상이야? 상황 모르면 %야? 기말 반영 비율이나 교수님이 강조한 범위도 있으면 알려 줘.",
  },
  {
    role: "user",
    text: "상대평가야. 수업에 나온 자료구조 1~5단원 전체가 시험 범위고 40% 반영이야.",
  },
];

export const planQuickExamples = [
  "운영체제 11/16 B+",
  "자료구조 11/12 A+",
  "컴퓨터네트워크 11/18 A0",
];

export const planWeeks: PlanWeek[] = [
  {
    label: "11월 2주차",
    range: "11/9 – 11/15",
    blocks: [
      { id: "w1-mon-c", day: 0, start: "10:00", end: "12:00", title: "수업", kind: "class" },
      { id: "w1-mon", day: 0, start: "18:00", end: "22:00", title: "알바", kind: "fixed" },
      { id: "w1-tue", day: 1, start: "13:00", end: "15:00", title: "수업", kind: "class" },
      { id: "w1-wed-c", day: 2, start: "10:00", end: "12:00", title: "수업", kind: "class" },
      { id: "w1-wed", day: 2, start: "18:00", end: "22:00", title: "알바", kind: "fixed" },
      { id: "w1-thu", day: 3, start: "13:00", end: "15:00", title: "수업", kind: "class" },
      {
        id: "w1-thu-2",
        day: 3,
        start: "19:00",
        end: "21:00",
        title: "팀플 회의 · 변경·추가",
        kind: "appointment",
        dashed: true,
      },
      { id: "w1-fri", day: 4, start: "18:00", end: "22:00", title: "알바", kind: "fixed" },
      { id: "w1-sat", day: 5, start: "18:00", end: "21:00", title: "약속", kind: "appointment" },
    ],
  },
  {
    label: "11월 3주차",
    range: "11/16 – 11/22",
    blocks: [
      { id: "w2-mon-c", day: 0, start: "10:00", end: "12:00", title: "수업", kind: "class" },
      { id: "w2-mon", day: 0, start: "18:00", end: "22:00", title: "알바", kind: "fixed" },
      { id: "w2-tue", day: 1, start: "13:00", end: "15:00", title: "수업", kind: "class" },
      { id: "w2-wed-c", day: 2, start: "10:00", end: "12:00", title: "수업", kind: "class" },
      { id: "w2-wed", day: 2, start: "18:00", end: "22:00", title: "알바", kind: "fixed" },
      { id: "w2-thu", day: 3, start: "13:00", end: "15:00", title: "수업", kind: "class" },
      { id: "w2-fri", day: 4, start: "18:00", end: "22:00", title: "알바", kind: "fixed" },
      { id: "w2-sun", day: 6, start: "13:00", end: "16:00", title: "스터디", kind: "appointment" },
    ],
  },
  {
    label: "11월 4주차",
    range: "11/23 – 11/29",
    blocks: [
      { id: "w3-mon-c", day: 0, start: "10:00", end: "12:00", title: "수업", kind: "class" },
      { id: "w3-mon", day: 0, start: "18:00", end: "22:00", title: "알바", kind: "fixed" },
      { id: "w3-tue", day: 1, start: "13:00", end: "15:00", title: "수업", kind: "class" },
      { id: "w3-wed-c", day: 2, start: "10:00", end: "12:00", title: "수업", kind: "class" },
      { id: "w3-wed", day: 2, start: "18:00", end: "22:00", title: "알바", kind: "fixed" },
      { id: "w3-sat", day: 5, start: "18:00", end: "21:00", title: "약속", kind: "appointment" },
    ],
  },
];

export const examSchedule = [
  { id: "ex-1", date: "11/12 (목)", subject: "자료구조" },
  { id: "ex-2", date: "11/16 (월)", subject: "운영체제" },
  { id: "ex-3", date: "11/18 (수)", subject: "컴퓨터네트워크" },
];

export const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"];

export const planMaterials: PlanMaterial[] = [
  { id: "mat-ds", subjectId: "sub-data", name: "자료구조_강의자료.pdf", pages: 140, sizeLabel: "4.2MB", status: "ready" },
  {
    id: "mat-ds-scan",
    subjectId: "sub-data",
    name: "자료구조_필기_스캔본.pdf",
    pages: 18,
    sizeLabel: "2.1MB",
    status: "scan-low",
    scanned: true,
  },
  { id: "mat-os", subjectId: "sub-os", name: "운영체제_강의자료.pdf", pages: 120, sizeLabel: "3.2MB", status: "ready" },
  { id: "mat-net", subjectId: "sub-network", name: "컴퓨터네트워크_강의자료.pdf", pages: 100, sizeLabel: "2.8MB", status: "ready" },
  {
    id: "mat-net-scan",
    subjectId: "sub-network",
    name: "컴퓨터네트워크_보충자료_스캔본.pdf",
    pages: 12,
    sizeLabel: "1.4MB",
    status: "failed",
    scanned: true,
  },
];

export const planUnits: PlanUnit[] = [
  { id: "u-ds-1", subjectId: "sub-data", title: "1단원 배열과 리스트", startPage: 1, endPage: 35, confirmed: true },
  { id: "u-ds-2", subjectId: "sub-data", title: "2단원 스택과 큐", startPage: 36, endPage: 60, confirmed: true },
  { id: "u-ds-3", subjectId: "sub-data", title: "3단원 트리와 이진 탐색", startPage: 61, endPage: 95, confirmed: true },
  { id: "u-ds-4", subjectId: "sub-data", title: "4단원 그래프", startPage: 96, endPage: 120, confirmed: true },
  { id: "u-ds-5", subjectId: "sub-data", title: "5단원 정렬", startPage: 121, endPage: 140, confirmed: true },
  { id: "u-os-1", subjectId: "sub-os", title: "1단원 운영체제 개요", startPage: 1, endPage: 20, confirmed: true },
  { id: "u-os-2", subjectId: "sub-os", title: "2단원 프로세스와 스레드", startPage: 21, endPage: 55, confirmed: true },
  { id: "u-os-3", subjectId: "sub-os", title: "3단원 CPU 스케줄링", startPage: 56, endPage: 85, confirmed: true },
  { id: "u-os-4", subjectId: "sub-os", title: "4단원 메모리 관리", startPage: 86, endPage: 120, confirmed: true },
  {
    id: "u-net-1",
    subjectId: "sub-network",
    title: "1단원 네트워크 개요와 OSI 7계층",
    startPage: 1,
    endPage: 22,
    confirmed: true,
  },
  { id: "u-net-2", subjectId: "sub-network", title: "2단원 데이터 링크 계층", startPage: 23, endPage: 45, confirmed: true },
  { id: "u-net-3", subjectId: "sub-network", title: "3단원 네트워크 계층", startPage: 46, endPage: 75, confirmed: true },
  { id: "u-net-4", subjectId: "sub-network", title: "4단원 전송 계층", startPage: 76, endPage: 100, confirmed: true },
];

export const planTaskSubjects: TaskSubject[] = [
  { id: "sub-data", label: "자료구조", pages: 140, tasks: 18 },
  { id: "sub-os", label: "운영체제", pages: 120, tasks: 15 },
  { id: "sub-network", label: "컴퓨터네트워크", pages: 100, tasks: 12 },
];

export const planTaskGroups: Record<string, TaskGroup[]> = {
  "sub-data": [
    { id: "ds-g1", title: "1. 배열과 리스트", pages: 35, tasks: 3, heights: [16, 16, 16] },
    { id: "ds-g2", title: "2. 스택과 큐", pages: 25, tasks: 4, heights: [14, 16, 14, 16] },
    {
      id: "ds-g3",
      title: "3. 트리와 이진 탐색",
      pages: 35,
      tasks: 5,
      note: "교수님 강조",
      heights: [14, 15, 16, 17, 18],
    },
    { id: "ds-g4", title: "4. 그래프", pages: 25, tasks: 3, heights: [16, 14, 16] },
    { id: "ds-g5", title: "5. 정렬", pages: 20, tasks: 3, heights: [17, 18, 19] },
  ],
  "sub-os": [
    { id: "os-g1", title: "1. 운영체제 개요", pages: 20, tasks: 3, heights: [16, 17, 18] },
    { id: "os-g2", title: "2. 프로세스와 스레드", pages: 35, tasks: 4, heights: [14, 15, 16, 17] },
    {
      id: "os-g3",
      title: "3. CPU 스케줄링",
      pages: 30,
      tasks: 4,
      note: "교수님 강조",
      heights: [16, 17, 18, 19],
    },
    { id: "os-g4", title: "4. 메모리 관리", pages: 35, tasks: 4, heights: [15, 16, 17, 18] },
  ],
  "sub-network": [
    { id: "net-g1", title: "1. 네트워크 개요와 OSI 7계층", pages: 22, tasks: 3, heights: [15, 16, 17] },
    { id: "net-g2", title: "2. 데이터 링크 계층", pages: 23, tasks: 3, heights: [16, 17, 18] },
    {
      id: "net-g3",
      title: "3. 네트워크 계층",
      pages: 30,
      tasks: 4,
      note: "교수님 강조",
      heights: [17, 18, 19, 18],
    },
    { id: "net-g4", title: "4. 전송 계층", pages: 25, tasks: 3, heights: [16, 17, 18] },
  ],
};

export const planCompareStats: CompareStat[] = [
  { id: "cs-1", label: "바뀐 날", before: "–", after: "5일" },
  { id: "cs-2", label: "토요일 공부", before: "1h", after: "0h" },
  { id: "cs-3", label: "화·목 하루 공부", before: "1.3h", after: "1.8h" },
  { id: "cs-4", label: "시험 전 완료 예상", before: "100%", after: "100%" },
];

export const planCompareWeeks: CompareWeek[] = [
  {
    id: "before",
    label: "기존 안",
    range: "11/2 ~ 11/15",
    days: [
      { id: "b-1", label: "월", hours: 0, changed: false },
      { id: "b-2", label: "화", hours: 1.6, changed: false },
      { id: "b-3", label: "수", hours: 0.7, changed: false },
      { id: "b-4", label: "목", hours: 1.3, changed: false },
      { id: "b-5", label: "금", hours: 0.7, changed: false },
      { id: "b-6", label: "토", hours: 1, changed: false },
      { id: "b-7", label: "일", hours: 1.7, changed: false },
      { id: "b-8", label: "월", hours: 2.3, changed: false },
      { id: "b-9", label: "화", hours: 1, changed: false },
      { id: "b-10", label: "수", hours: 1.8, changed: false },
      { id: "b-11", label: "목", hours: 0.8, changed: false },
      { id: "b-12", label: "금", hours: 0.7, changed: false },
      { id: "b-13", label: "토", hours: 0.8, changed: false },
      { id: "b-14", label: "일", hours: 2, changed: false },
    ],
  },
  {
    id: "after",
    label: "AI 새 안",
    range: "11/2 ~ 11/15",
    days: [
      { id: "a-1", label: "월", hours: 0, changed: false },
      { id: "a-2", label: "화", hours: 2.1, changed: true },
      { id: "a-3", label: "수", hours: 0.7, changed: false },
      { id: "a-4", label: "목", hours: 1.8, changed: true },
      { id: "a-5", label: "금", hours: 0.7, changed: false },
      { id: "a-6", label: "토", hours: 0, changed: true },
      { id: "a-7", label: "일", hours: 1.7, changed: false },
      { id: "a-8", label: "월", hours: 2.3, changed: false },
      { id: "a-9", label: "화", hours: 1.4, changed: true },
      { id: "a-10", label: "수", hours: 1.8, changed: false },
      { id: "a-11", label: "목", hours: 0.8, changed: false },
      { id: "a-12", label: "금", hours: 0.7, changed: false },
      { id: "a-13", label: "토", hours: 0, changed: true },
      { id: "a-14", label: "일", hours: 2, changed: false },
    ],
  },
];

export const planCompareNotes: string[] = [
  "토요일(11/7 · 11/14) 분량을 0으로 했어요",
  "줄인 분량은 수업 끝난 화·목 오후에 30분씩 나눠 넣었어요",
  "시험 전날 총복습 날짜는 바꾸지 않았어요",
];