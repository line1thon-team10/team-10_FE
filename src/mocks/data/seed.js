// mock: 가짜 데이터예요. 실제 서버 응답이 아니에요.
// 값 출처: 「1호선톤 데모 시나리오 데이터 세트」 (계획 11/3, 시연일 11/9 월 오후 5시 상태)
// TODO(확인필요): [백엔드 확정 필요] 필드 이름·구조는 프론트 임시값이에요. 명세가 나오면 어댑터와 이 파일을 맞춰요.
// 데이터 세트에 없는 값(퀴즈 보기 등)은 일부러 비워 뒀어요. 지어내지 않아요.

export const SEED = {
  demo: {
    today: '2026-11-09', // 시연 중심 날짜 (월)
    planCreatedAt: '2026-11-03',
    time: '17:00',
  },

  subjects: [
    {
      id: 'ds',
      name: '자료구조',
      color: '#4F46E5', // Indigo (가안)
      examDate: '2026-11-12',
      goal: 'A+',
      goalDetail:
        '상대평가 상위 15% · 커트라인 90점 · 중간 40% · 기말 40% · 교수님 강조 3단원 트리',
      file: { name: '자료구조_강의자료.pdf', pages: 140 },
      taskCount: 18,
      units: [
        {
          no: 1,
          title: '배열과 리스트',
          from: 1,
          to: 35,
          difficulty: 'low',
          concepts: ['배열', '연결 리스트', '시간 복잡도'],
        },
        {
          no: 2,
          title: '스택과 큐',
          from: 36,
          to: 60,
          difficulty: 'mid',
          concepts: ['스택', '큐', '덱', '후위 표기식'],
        },
        {
          no: 3,
          title: '트리와 이진 탐색',
          from: 61,
          to: 95,
          difficulty: 'high',
          concepts: ['이진 트리', '순회', '이진 탐색 트리', 'AVL 트리'],
        },
        {
          no: 4,
          title: '그래프',
          from: 96,
          to: 120,
          difficulty: 'high',
          concepts: ['그래프 표현', 'DFS·BFS', '최단 경로'],
        },
        {
          no: 5,
          title: '정렬',
          from: 121,
          to: 140,
          difficulty: 'mid',
          concepts: ['퀵 정렬', '병합 정렬', '힙 정렬'],
        },
      ],
    },
    {
      id: 'os',
      name: '운영체제',
      color: '#2563EB', // Blue (가안)
      examDate: '2026-11-16',
      goal: 'B+ 이상',
      goalDetail: '80점 이상 · 기말 50%',
      file: { name: '운영체제_강의자료.pdf', pages: 120 },
      taskCount: 15,
      units: [
        {
          no: 1,
          title: '운영체제 개요',
          from: 1,
          to: 20,
          difficulty: 'low',
          concepts: ['커널', '시스템 콜'],
        },
        {
          no: 2,
          title: '프로세스와 스레드',
          from: 21,
          to: 55,
          difficulty: 'mid',
          concepts: ['프로세스', '스레드', '동기화'],
        },
        {
          no: 3,
          title: 'CPU 스케줄링',
          from: 56,
          to: 85,
          difficulty: 'mid',
          concepts: ['FCFS', 'SJF', '라운드 로빈'],
        },
        {
          no: 4,
          title: '메모리 관리',
          from: 86,
          to: 120,
          difficulty: 'high',
          concepts: ['페이징', '세그멘테이션', '가상 메모리'],
        },
      ],
    },
    {
      id: 'net',
      name: '컴퓨터네트워크',
      color: '#7C3AED', // Purple (가안)
      examDate: '2026-11-18',
      goal: '통과',
      goalDetail: '60점 이상 · 기말 60%',
      file: { name: '컴퓨터네트워크_강의자료.pdf', pages: 100 },
      taskCount: 12,
      units: [
        {
          no: 1,
          title: '네트워크 개요와 OSI 7계층',
          from: 1,
          to: 22,
          difficulty: 'low',
          concepts: ['계층 구조', '캡슐화'],
        },
        {
          no: 2,
          title: '데이터 링크 계층',
          from: 23,
          to: 45,
          difficulty: 'mid',
          concepts: ['프레임', 'MAC 주소', '오류 검출'],
        },
        {
          no: 3,
          title: '네트워크 계층',
          from: 46,
          to: 75,
          difficulty: 'high',
          concepts: ['IP 주소', '서브넷', '라우팅'],
        },
        {
          no: 4,
          title: '전송 계층',
          from: 76,
          to: 100,
          difficulty: 'mid',
          concepts: ['TCP', 'UDP', '혼잡 제어'],
        },
      ],
    },
  ],

  // 스캔본 실패 시연용 (S3-2)
  scanFile: { subjectId: 'net', name: '컴퓨터네트워크_보충자료_스캔본.pdf', pages: 12 },

  // 고정 일정 (day: 1=월 … 7=일)
  fixedSchedules: [
    { kind: 'class', days: [1, 3], start: '10:00', end: '12:00' },
    { kind: 'class', days: [2, 4], start: '13:00', end: '15:00' },
    { kind: 'job', days: [1, 3, 5], start: '18:00', end: '22:00' },
    { kind: 'meet', days: [6], start: '18:00', end: '21:00' },
  ],

  // S1 입력 문장과 빠른 선택 칩
  onboarding: {
    sentence:
      '월수금 저녁 6시부터 10시까지 카페 알바, 월수 오전이랑 화목 오후에 수업 있어. 토요일 저녁엔 친구 약속. 기말은 자료구조 11월 12일, 운영체제 16일, 컴퓨터네트워크 18일. 자료구조는 A+ 받고 싶어.',
    goalChips: ['중간고사 40%', '기말고사 40%', '교수님 강조: 3단원 트리', '커트라인 90점'],
  },

  // S5 요약
  planSummary: { totalPages: 360, taskCount: 45, dailyAvgMinutes: 75 },

  // 11/9 (월) 오늘 할 일 — 오후 5시 상태: 2·3·4번 완료(33p/57p = 58%)
  today: {
    date: '2026-11-09',
    tasks: [
      {
        id: 't1',
        subjectId: 'ds',
        unitNo: 3,
        title: '3단원 이진 탐색 트리·AVL 트리',
        from: 72,
        to: 95,
        minutes: 60,
        reason: '시험 D-3, 교수님 강조 단원',
        status: 'todo',
        donePages: 0,
      },
      {
        id: 't2',
        subjectId: 'os',
        unitNo: 3,
        title: '3단원 CPU 스케줄링',
        from: 56,
        to: 67,
        minutes: 30,
        reason: '수업 끝난 오후 빈 시간',
        status: 'done',
        donePages: 12,
      },
      {
        id: 't3',
        subjectId: 'os',
        unitNo: 2,
        title: '2단원 동기화 보충',
        from: 40,
        to: 46,
        minutes: 15,
        reason: '어제 이해도 2점 · 오답 1개',
        status: 'done',
        donePages: 7,
        supplement: true,
      },
      {
        id: 't4',
        subjectId: 'net',
        unitNo: 2,
        title: '2단원 데이터 링크 계층',
        from: 23,
        to: 36,
        minutes: 30,
        reason: '첫 회독, 난이도 중',
        status: 'done',
        donePages: 14,
      },
    ],
  },

  // 시험 준비도 (책 쌓기 탭)
  readiness: [
    {
      subjectId: 'ds',
      readiness: 71,
      target: 90,
      targetLabel: 'A+',
      expectedCompletion: 80,
      mastery: 89,
    },
    { subjectId: 'os', readiness: 65, target: 80, targetLabel: 'B+' },
    { subjectId: 'net', readiness: 42, target: 60, targetLabel: '통과' },
  ],

  // 단원별 상태 (블록 1개 = 태스크 1개). 블록 개수는 데이터 세트에 없어서 S9 작업 때 정해요.
  unitStates: [
    { subjectId: 'ds', unitNo: 1, grade: 'stable', score: 92 },
    { subjectId: 'ds', unitNo: 2, grade: 'shaky', score: 68 },
    { subjectId: 'ds', unitNo: 3, grade: null, progress: 'doing' }, // 앞부분 안정, 오늘 분량 진행 중
    { subjectId: 'ds', unitNo: 4, grade: null, progress: 'planned' },
    { subjectId: 'ds', unitNo: 5, grade: null, progress: 'planned' },
    { subjectId: 'os', unitNo: 1, grade: 'stable' },
    { subjectId: 'os', unitNo: 2, grade: 'risk' }, // 오늘 보충 후 흔들림
    { subjectId: 'os', unitNo: 3, grade: null, progress: 'done' },
    { subjectId: 'os', unitNo: 4, grade: null, progress: 'planned' },
    { subjectId: 'net', unitNo: 1, grade: 'stable' },
    { subjectId: 'net', unitNo: 2, grade: null, progress: 'done' },
    { subjectId: 'net', unitNo: 3, grade: null, progress: 'planned' },
    { subjectId: 'net', unitNo: 4, grade: null, progress: 'planned' },
  ],

  // 오답 노트 6건
  wrongNotes: [
    {
      id: 'w1',
      subjectId: 'ds',
      question: '빈 스택에서 pop',
      page: 40,
      type: 'choice',
      status: '오답 2회 (11/5, 11/8)',
    },
    {
      id: 'w2',
      subjectId: 'ds',
      question: '후위 표기식 계산',
      page: 52,
      type: 'short',
      status: '오답 1회 (11/8)',
    },
    {
      id: 'w3',
      subjectId: 'ds',
      question: '중위 순회 결과',
      page: 68,
      type: 'choice',
      status: '해결 (11/7 오답 → 11/8 정답)',
    },
    {
      id: 'w4',
      subjectId: 'ds',
      question: '편향 트리 탐색 복잡도',
      page: 79,
      type: 'choice',
      status: '오답 1회 (11/9)',
    },
    {
      id: 'w5',
      subjectId: 'ds',
      question: 'BST 노드 삭제 (자식 2개)',
      page: 82,
      type: 'essay',
      status: '서술형 70점 · 오답 (11/9)',
    },
    {
      id: 'w6',
      subjectId: 'os',
      question: '뮤텍스와 세마포어 차이',
      page: 44,
      type: 'essay',
      status: '서술형 62점 · 오답 (11/8)',
    },
  ],

  // 분배안 (밀린 38p: 자료구조 24p + 컴퓨터네트워크 14p)
  plans: [
    {
      key: 'A',
      detail: '11/10·11/11 공부 시간을 하루 40분씩 늘려요.',
      effect: '범위 100% 유지 · 하루 +40분',
    },
    {
      key: 'B',
      detail: '중요도 낮은 자료구조 5단원 힙 정렬(6p)과 네트워크 1단원 부록(4p)을 빼요.',
      effect: '시간 유지 · 10p 제외',
    },
    {
      key: 'C',
      detail: '같은 범위를 핵심 개념 요약 위주로 빠르게 봐요. 밀린 태스크 시간을 30% 줄여요.',
      effect: '시간 유지 · 범위 유지 · 1회독 깊이 낮아짐',
    },
  ],
};
