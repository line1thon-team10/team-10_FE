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
      // S1 카드 4칸: 시험 총 목표 · 기타 정보 (데이터 세트 1장 목표 문장을 두 칸으로 나눔)
      goalTotal: '상대평가 상위 15% · 커트라인 90점',
      goalEtc: '중간 40% · 기말 40% · 교수님 강조 3단원 트리',
      file: { id: 'ds-main', name: '자료구조_강의자료.pdf', pages: 140 },
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
      goalTotal: '80점 이상',
      goalEtc: '기말 50%',
      file: { id: 'os-main', name: '운영체제_강의자료.pdf', pages: 120 },
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
      goalTotal: '60점 이상',
      goalEtc: '기말 60%',
      file: { id: 'net-main', name: '컴퓨터네트워크_강의자료.pdf', pages: 100 },
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

  // 스캔본 (PDF-01·07, 와이어 S3): 글자 인식으로 분석 완료 · 이 파일 범위는 퀴즈 없음. 빈 계정 S3에 미리 올라가 있어요
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

  // 온보딩 목업 대본 (S1). 첫 질문·추가 질문 문구는 와이어프레임 S1, 답은 데이터 세트 1장.
  // TODO(확인필요): [기획 확인] 운영체제·컴퓨터네트워크 목표를 시연에서 어떻게 입력하는지는 대본에 없어서 직접 입력으로 뒀어요.
  onboardingScript: {
    first: '시험 일정이랑 평소 일정을 편하게 말해 줘.',
    askFirst:
      '자료구조 A+ 기준을 조금만 더 알려 줘. 상대평가야, 절대평가야? A+는 몇 점 이상이거나 상위 몇 %야? 기말 반영 비율이랑 교수님이 강조한 범위도 있으면 알려 줘.',
    askRest:
      '자료구조는 커트라인 90점 이상을 목표로 잡을게요. 운영체제랑 컴퓨터네트워크 목표도 알려 줘. 합격 기준이나 반영 비율도 같이 말해 주면 좋아요.',
    done: '운영체제는 80점 이상(기말 50%), 컴퓨터네트워크는 60점 이상(기말 60%)으로 정리했어요. 이제 캘린더에서 일정을 확인해 주세요.',
    goalTargets: { ds: 90, os: 80, net: 60 }, // 내부 목표 점수 (데이터 세트 준비도 목표선)
  },
  onboardingDate: '2026-11-03', // 계획 만드는 날 (화)
  onboardingWeekStart: '2026-11-02',

  // 집중 모드 문구 (HM-10) — 디자인 studySession 10개. 들어올 때마다 서버가 하나 골라요
  // TODO(확인필요): [기획 확인] 계획 운영 시나리오 3장 문구와 같은지
  focusQuotes: [
    '벼락치기 말고, 피뢰침.',
    '지금은 이 범위만 보면 돼요.',
    '오늘 한 페이지가 시험 날의 한 문제예요.',
    '다 못 해도 괜찮아요. 한 만큼 쌓여요.',
    '밀려도 무너지지 않아요. 다시 맞추면 돼요.',
    '천천히 읽은 페이지가 오래 남아요.',
    '오늘의 블록 하나, 지금 쌓는 중이에요.',
    '어려운 곳에서 멈춘 것도 공부예요.',
    '한 번 더 본 개념은 덜 흔들려요.',
    '시험은 한 번, 준비는 매일 조금씩.',
  ],

  // AI 튜터 (TU-01 · S6-3) — mock 답변. AI 출력 형식은 김현민님 확인 전
  // TODO(확인필요): [백엔드 확정 필요] 요청 { question, history } (정의서 '제안'), pages 안 모양
  tutorSuggestions: [
    'AVL 트리 회전은 언제 해?',
    'BST에서 자식이 2개인 노드는 어떻게 지워?',
    '편향 트리는 왜 느려?',
  ],
  tutorAnswers: [
    {
      keywords: ['AVL', '회전'],
      question: 'AVL 트리 회전은 언제 해?', // 저장된 답을 보여줄 때 질문 말풍선
      subjectId: 'ds',
      answer:
        'AVL 트리는 노드를 넣거나 지운 뒤 어떤 노드의 균형 인수(왼쪽 높이 − 오른쪽 높이)가 -1, 0, 1을 벗어나면 회전해요. 왼쪽-왼쪽으로 기울면 LL 회전, 오른쪽-오른쪽이면 RR 회전 한 번이고, LR·RL은 자식을 먼저 돌린 뒤 부모를 다시 돌리는 이중 회전이에요.',
      pages: [
        { materialId: 'ds-main', from: 90, to: 90 },
        { materialId: 'ds-main', from: 91, to: 93 },
      ],
      saved: true, // 응답이 없을 때 보여주는 저장된 답 (시연 백업: 기본 답 + 쉬운 설명)
      // TODO(확인필요): [기획 확인] 시연 백업 쉬운 설명 문구 (mock)
      easy: '시소를 떠올려 보세요. 한쪽에 사람이 너무 많이 타서 기울면 가운데 받침을 옮겨 다시 평평하게 만들죠. AVL 트리도 넣거나 지운 뒤 한쪽이 두 칸 넘게 무거워지면, 무거운 쪽 노드를 위로 끌어올리는 회전으로 다시 평평하게 맞춰요. 한쪽으로 쭉 기울면 한 번, 꺾여서 기울면 두 번 돌려요.',
    },
    {
      keywords: ['삭제', '지워', 'BST'],
      subjectId: 'ds',
      answer:
        '자식이 2개인 노드는 오른쪽 서브트리의 가장 작은 값(후속자)으로 값을 바꾼 뒤, 후속자를 원래 자리에서 지워요. 후속자는 왼쪽 자식이 없어서 자식이 0개나 1개인 경우로 처리하면 돼요.',
      pages: [{ materialId: 'ds-main', from: 82, to: 82 }],
      easy: '반 대표를 바꾸는 상황이라고 생각해 보세요. 대표가 빠지면, 바로 다음 번호(오른쪽에서 가장 작은 값) 학생이 대표 자리로 올라오고, 그 학생이 원래 있던 자리는 비워 주면 돼요. 그 학생은 왼쪽 친구가 없어서 비우기가 쉬워요.',
    },
    {
      keywords: ['편향'],
      subjectId: 'ds',
      answer:
        '한쪽으로만 노드가 붙은 편향 트리는 연결 리스트와 모양이 같아서, 탐색할 때 노드를 하나씩 다 따라가야 해요. 그래서 최악의 경우 O(n)이에요. 균형이 잡히면 한 번 비교할 때마다 절반씩 줄어서 O(log n)이에요.',
      pages: [
        { materialId: 'ds-main', from: 79, to: 79 },
        { materialId: 'ds-main', from: 76, to: 76 },
      ],
      easy: '줄을 한 줄로 길게 선 상황이에요. 찾는 사람이 맨 끝에 있으면 앞에서부터 한 명씩 다 물어봐야 하죠. 편향 트리가 딱 그래서 느려요. 반대로 사람들이 두 갈래로 고르게 나뉘어 서 있으면 매번 절반을 건너뛸 수 있어서 빨라요.',
    },
  ],

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

  // 오늘의 퀴즈 문항 수 (어제 오답 전부 + 오늘 공부한 단원당 5문항) — 날짜별. 데이터 세트 4장은 11/9만 있어요.
  // 운영체제 13 = 3단원 새 문제 5 · 어제 취약 7 · 3일 만에 다시 보는 문제 1 (정의서 v2 · 와이어 S8-1)
  // TODO(확인필요): [기획 확인] 컴퓨터네트워크 문항 수는 데이터 세트 v2를 받으면 맞춰요 (지금 5는 v1 값)
  quizCounts: { '2026-11-09': { ds: 7, os: 13, net: 5 } },
  // S8-1 과목 카드 구성 줄 (와이어 S8-1 · 정의서 v2). 컴퓨터네트워크는 데이터 세트 v2 전이라 비워 둬요
  quizLines: {
    '2026-11-09': {
      ds: ['3단원 새 문제 5 (p.72–88)', '어제 틀린 문제 2'],
      os: ['3단원 새 문제 5', '어제 취약 7', '3일 만에 다시 보는 문제 1'],
    },
  },

  // 과목별 하루 평균 계획 페이지 (밀림 기준, 4-8). 자료구조·컴퓨터네트워크는 데이터 세트 4장,
  // 운영체제는 데이터 세트에 없어서 2주 계획 표로 계산한 mock 값이에요.
  dailyAvgPages: { ds: 18, os: 13, net: 17 },

  // 최근 7일 쌓은 책 (홈). 블록 1개 = 그날 태스크 1개, 상태는 그 단원의 등급을 따름.
  // 데이터 세트 2주 계획(3장)과 단원 상태(4장)를 맞춰 만든 mock 값이에요. 오늘(11/9) 블록은 할 일 목록에서 만들어요.
  recentDays: [
    { date: '2026-11-03', blocks: ['stable', 'stable'] }, // 자료구조 1단원 · 운영체제 1단원
    { date: '2026-11-04', blocks: ['stable'] }, // 자료구조 1단원
    { date: '2026-11-05', blocks: ['shaky', 'stable'] }, // 자료구조 2단원 · 컴퓨터네트워크 1단원
    { date: '2026-11-06', blocks: ['risk'] }, // 운영체제 2단원
    { date: '2026-11-07', blocks: ['stable', 'risk'] }, // 자료구조 3단원 앞부분 · 운영체제 2단원
    { date: '2026-11-08', blocks: ['shaky', 'risk', 'stable'] }, // 자료구조 1·2단원 오답 복습 · 운영체제 2단원 · 컴퓨터네트워크 1단원
  ],

  // 책 쌓기 (BK-01): 단원 = 책 더미, 책 1권 = 태스크 1개. 'done'은 끝난 태스크, 'planned'는 남은 계획,
  // { taskId }는 오늘(이후) 할 일과 연결된 책이에요. 끝난 책의 색은 그 단원 등급을 따라요 (4-5).
  // mock: 단원별 권 수는 데이터 세트에 없어서 과목 태스크 수(18·15·12)와 참고 이미지 6의 권 수(9/18·7/15·3/12)에 맞췄어요.
  // 단원 점수 (정의서 v2 · 와이어 P3): 자료구조 1단원 96 · 2단원 69 · 3단원 83, 운영체제 2단원 40 (11/9 보충)
  // mock: 점수가 데이터 세트에 없는 단원(운영체제 1단원, 컴퓨터네트워크 1단원)은 등급 구간 안의 임의 값이에요.
  bookshelf: {
    ds: [
      { unitNo: 1, grade: 'stable', score: 96, blocks: ['done', 'done', 'done'] },
      {
        unitNo: 2,
        grade: 'shaky',
        score: 69,
        round: 2, // 11/8 보충 완료 → 2회독 (정의서 4-2)
        note: '어제 오답 2개가 오늘 퀴즈에 다시 나와요',
        blocks: ['done', 'done', 'done', 'done'],
      },
      {
        unitNo: 3,
        grade: 'stable',
        score: 83,
        blocks: ['done', { taskId: 't1' }, 'planned', 'planned'],
      },
      {
        unitNo: 4,
        grade: null,
        score: null,
        blocks: [{ taskId: 't5' }, 'planned', 'planned', 'planned'],
      },
      { unitNo: 5, grade: null, score: null, blocks: ['planned', 'planned', 'planned'] },
    ],
    os: [
      { unitNo: 1, grade: 'stable', score: 86, blocks: ['done', 'done'] }, // mock: 점수
      {
        unitNo: 2,
        grade: 'risk',
        score: 40,
        round: 2, // 11/9 보충 완료 → 2회독 (정의서 4-2)
        note: '어제 이해도가 낮아 오늘 보충 학습이 붙었어요',
        blocks: ['done', 'done', 'done', { taskId: 't3', supplement: true }],
      },
      {
        unitNo: 3,
        grade: null,
        score: null,
        blocks: [{ taskId: 't2' }, 'planned', 'planned', 'planned'],
      },
      {
        unitNo: 4,
        grade: null,
        score: null,
        blocks: ['planned', 'planned', 'planned', 'planned', 'planned'],
      },
    ],
    net: [
      { unitNo: 1, grade: 'stable', score: 88, blocks: ['done', 'done'] }, // mock: 점수
      { unitNo: 2, grade: null, score: null, blocks: [{ taskId: 't4' }, 'planned', 'planned'] },
      { unitNo: 3, grade: null, score: null, blocks: ['planned', 'planned', 'planned', 'planned'] },
      { unitNo: 4, grade: null, score: null, blocks: ['planned', 'planned', 'planned'] },
    ],
  },

  // 시험 준비도 (KP-01, KP-02) — 정의서 v2. 준비도 = 진도율 × 숙달도, 숙달도는 자료구조만 있어요.
  // 진도율 = 공부한 페이지 ÷ 범위 (자료구조 88/140 · 운영체제 67/120 · 컴퓨터네트워크 36/100)
  readiness: [
    {
      subjectId: 'ds',
      readiness: 51,
      target: 90,
      targetLabel: 'A+',
      progressRate: 62.9,
      mastery: 80.7,
      studiedPages: 88,
      totalPages: 140,
    },
    {
      subjectId: 'os',
      readiness: 33,
      target: 80,
      targetLabel: 'B+',
      progressRate: 55.8,
      mastery: null,
      studiedPages: 67,
      totalPages: 120,
    },
    {
      subjectId: 'net',
      readiness: 34,
      target: 60,
      targetLabel: '통과',
      progressRate: 36.0,
      mastery: null,
      studiedPages: 36,
      totalPages: 100,
    },
  ],

  // 오답 노트 (RV-01) — 데이터 세트 오답 6건 중 11/9 오늘 퀴즈 오답 2건(편향 트리·BST 삭제)은 빼고,
  // 오늘 퀴즈를 제출하면 오답·애매 정답이 여기에 생겨요 (11/10 결정 A).
  // result: sureWrong 확실 오답 · unsureWrong 애매 오답 · unsureRight 애매 정답 · resolved 해결 (서술형은 score)
  // mock: 지난 오답의 확실/애매는 데이터 세트에 없어서 '확실 오답'으로 넣었어요 (mockFilled: confidence)
  // questionId: 오늘의 퀴즈 문항과 같은 문제 (다시 풀기에 써요). concept: 단원 개념 목록 기준 (mock)
  wrongNotes: [
    {
      id: 'w1',
      subjectId: 'ds',
      unitNo: 2,
      concept: '스택',
      questionId: 'q2',
      question: '빈 스택에서 pop',
      page: 40,
      type: 'choice',
      wrongCount: 2,
      lastDate: '2026-11-08',
      result: 'sureWrong',
      history: [
        { date: '2026-11-05', result: 'sureWrong' },
        { date: '2026-11-08', result: 'sureWrong' },
      ],
      mockFilled: ['confidence'],
    },
    {
      id: 'w2',
      subjectId: 'ds',
      unitNo: 2,
      concept: '후위 표기식',
      questionId: 'q1',
      question: '후위 표기식 계산',
      page: 52,
      type: 'short',
      wrongCount: 1,
      lastDate: '2026-11-08',
      result: 'sureWrong',
      history: [{ date: '2026-11-08', result: 'sureWrong' }],
      mockFilled: ['confidence'],
    },
    {
      id: 'w3',
      subjectId: 'ds',
      unitNo: 3,
      concept: '순회',
      questionId: 'q4',
      question: '중위 순회 결과',
      page: 68,
      type: 'choice',
      wrongCount: 1,
      lastDate: '2026-11-08',
      result: 'resolved',
      history: [
        { date: '2026-11-07', result: 'sureWrong' },
        { date: '2026-11-08', result: 'sureRight' },
      ],
      mockFilled: ['confidence'],
    },
    {
      id: 'w6',
      subjectId: 'os',
      unitNo: 2,
      concept: '동기화',
      questionId: null, // 운영체제 문항 데이터가 없어서 다시 풀기는 막아 둬요
      question: '뮤텍스와 세마포어 차이',
      page: 44,
      type: 'essay',
      score: 62,
      wrongCount: 1,
      lastDate: '2026-11-08',
      result: 'sureWrong',
      history: [{ date: '2026-11-08', result: 'sureWrong', score: 62 }],
      mockFilled: ['confidence'],
    },
  ],

  // 오늘의 퀴즈 문항 (S8) — 11/9 자료구조 7문항 = 3단원 5 + 어제 오답 2 (와이어프레임 S8·S8-2)
  // mock 표시(mockFilled): 와이어프레임에 없어서 제가 채운 값이에요. 김현민님 퀴즈 JSON이 오면 이 블록만 바꿔요.
  // answer·accepts·explanation은 서버만 아는 값이에요 (목업 채점용, 화면에 보내지 않아요).
  quizSets: {
    '2026-11-09': {
      ds: {
        round: '1회독',
        difficulty: '하',
        composition: '3단원 5 + 어제 틀린 문제 2 (전부)',
        questions: [
          {
            id: 'q1',
            // mock: 근거 문장 (목업 PDF public/mock/ds-lecture-mock.pdf에 같은 문장이 있어요)
            evidence: {
              materialId: 'ds-main',
              page: 52,
              quote: '후위 표기식은 피연산자를 스택에 넣고 연산자를 만나면 두 개를 꺼내 계산한다.',
            },
            concept: '후위 표기식', // mock: 개념
            type: 'short',
            tag: '어제 오답',
            unitNo: 2,
            page: 'p.52',
            prompt: '후위 표기식 3 4 + 2 * 의 계산 결과는?',
            accepts: ['14'],
            explanation: '3 + 4를 먼저 계산해 7, 여기에 2를 곱해 14예요.',
            mockFilled: ['answer', 'explanation'],
          },
          {
            id: 'q2',
            // mock: 근거 문장 (목업 PDF public/mock/ds-lecture-mock.pdf에 같은 문장이 있어요)
            evidence: {
              materialId: 'ds-main',
              page: 40,
              quote: '비어 있는 스택에서 pop을 하면 스택 언더플로가 발생한다.',
            },
            concept: '스택', // mock: 개념
            type: 'choice',
            tag: '어제 오답',
            unitNo: 2,
            page: 'p.40',
            prompt: '스택이 비어 있을 때 pop을 하면 어떻게 될까요?',
            options: [
              '0이 반환된다',
              '스택 언더플로(오류)가 발생한다',
              '마지막으로 꺼낸 값이 다시 나온다',
              '스택 크기가 -1이 된다',
            ],
            answer: 1,
            explanation: '꺼낼 값이 없어서 스택 언더플로가 나요.',
            mockFilled: ['explanation'],
          },
          {
            id: 'q3',
            // mock: 근거 문장 (목업 PDF public/mock/ds-lecture-mock.pdf에 같은 문장이 있어요)
            evidence: {
              materialId: 'ds-main',
              page: 82,
              quote: '자식이 두 개인 노드는 후속자로 값을 바꾼 뒤 후속자를 원래 자리에서 삭제한다.',
            },
            concept: '이진 탐색 트리', // mock: 개념
            type: 'essay',
            tag: null,
            unitNo: 3,
            page: 'p.82',
            prompt: 'BST에서 자식이 2개인 노드를 삭제하는 과정을 설명하시오',
            demoScore: 70,
            good: '후속자(오른쪽 서브트리의 최솟값)로 바꾸는 건 맞아요.',
            miss: '후속자를 원래 자리에서 지우는 단계가 빠졌어요. 후속자는 왼쪽 자식이 없어서 자식이 0개나 1개인 경우로 처리하면 돼요.',
            mockFilled: ['score'],
          },
          {
            id: 'q4',
            // mock: 근거 문장 (목업 PDF public/mock/ds-lecture-mock.pdf에 같은 문장이 있어요)
            evidence: {
              materialId: 'ds-main',
              page: 68,
              quote: '이진 탐색 트리를 중위 순회하면 값이 오름차순으로 방문된다.',
            },
            concept: '순회', // mock: 개념
            type: 'choice',
            tag: null,
            unitNo: 3,
            page: 'p.68',
            prompt: '이진 탐색 트리를 중위 순회하면 어떤 순서로 방문하나요?',
            options: [
              '값이 작은 것부터 오름차순',
              '값이 큰 것부터 내림차순',
              '노드를 넣은 순서대로',
              '위에서 아래로 층마다',
            ],
            answer: 0,
            explanation: '중위 순회는 왼쪽 → 루트 → 오른쪽 순서라 BST에서는 오름차순이 돼요.',
            mockFilled: ['options', 'explanation'],
          },
          {
            id: 'q5',
            // mock: 근거 문장 (목업 PDF public/mock/ds-lecture-mock.pdf에 같은 문장이 있어요)
            evidence: {
              materialId: 'ds-main',
              page: 79,
              quote: '한쪽으로 치우친 편향 트리에서 탐색은 최악의 경우 O(n)이다.',
            },
            concept: '이진 탐색 트리', // mock: 개념
            type: 'choice',
            tag: null,
            unitNo: 3,
            page: 'p.79',
            prompt: '편향 트리에서 탐색의 최악 시간 복잡도는?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            answer: 2,
            explanation: '정답은 O(n)이에요. 한쪽으로 치우치면 연결 리스트와 같아져요.',
            mockFilled: ['options'],
          },
          {
            id: 'q6',
            // mock: 근거 문장 (목업 PDF public/mock/ds-lecture-mock.pdf에 같은 문장이 있어요)
            evidence: {
              materialId: 'ds-main',
              page: 74,
              quote: '이진 탐색 트리에서 가장 작은 값은 가장 왼쪽 노드에 있다.',
            },
            concept: '이진 탐색 트리', // mock: 개념
            type: 'short',
            tag: null,
            unitNo: 3,
            page: 'p.74',
            prompt: 'BST에서 가장 작은 값은 어디에 있나요?',
            accepts: ['가장왼쪽노드', '맨왼쪽노드', '가장왼쪽', '맨왼쪽', '왼쪽끝', '왼쪽끝노드'],
            explanation: '왼쪽으로 끝까지 내려간 노드가 가장 작아요.',
            mockFilled: ['answer', 'explanation', 'page'],
          },
          {
            id: 'q7',
            // mock: 근거 문장 (목업 PDF public/mock/ds-lecture-mock.pdf에 같은 문장이 있어요)
            evidence: {
              materialId: 'ds-main',
              page: 76,
              quote: '균형 잡힌 이진 탐색 트리의 탐색은 평균 O(log n)이다.',
            },
            concept: '이진 탐색 트리', // mock: 개념
            type: 'choice',
            tag: null,
            unitNo: 3,
            page: 'p.76',
            prompt: 'BST 탐색의 평균 시간 복잡도는?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
            answer: 1,
            explanation: '균형이 잡혀 있으면 한 번 비교할 때마다 절반씩 줄어서 O(log n)이에요.',
            mockFilled: ['options', 'explanation', 'page'],
          },
        ],
        // 퀴즈 후 단원 이해도 변화 (정의서 v2 · 와이어 P3). 계산은 서버(LV-01) 몫이라 mock은 고정값이에요.
        unitChanges: [
          { unitNo: 3, before: 83, after: 73, grade: 'shaky' },
          {
            unitNo: 2,
            before: 69,
            after: 70,
            grade: 'shaky',
            recovering: true, // 와이어 P3 '흔들림 유지 · 회복 중'
            note: '2단원은 회복 중이라 하루 최대 +5점까지만 올라요. 재학습 + 문제 뽑기를 하면 최대 +15점',
          },
        ],
      },
    },
  },

  // 11/10 (화) 계획 — 데이터 세트 3장: 자료구조 4단원 p.96–120, 1시간
  nextDayTasks: {
    '2026-11-10': [
      {
        id: 't5',
        subjectId: 'ds',
        unitNo: 4,
        title: '4단원 그래프',
        from: 96,
        to: 120,
        minutes: 60,
        reason: null,
        status: 'todo',
        donePages: 0,
      },
    ],
  },

  // 이번 주 남은 계획 (S11 캘린더) — 데이터 세트 3장 11/11~11/15. '다음 날로'는 11/10까지라 캘린더에만 써요 (11/10 결정 A)
  // mock: 배치 이유 문구 · 총복습 범위(자료구조)는 데이터 세트에 없어서 채운 값이에요
  weekPlan: {
    '2026-11-11': [
      {
        id: 'w11a',
        subjectId: 'ds',
        unitNo: 5,
        title: '5단원 정렬',
        from: 121,
        to: 140,
        minutes: 50,
        reason: '자료구조 시험 전날 · 마지막 단원',
      },
      {
        id: 'w11b',
        subjectId: 'ds',
        unitNo: null,
        title: '총복습',
        from: null,
        to: null,
        minutes: 60,
        reason: '시험 전날에는 총복습을 넣어요',
      },
    ],
    '2026-11-12': [
      {
        id: 'w12a',
        subjectId: 'os',
        unitNo: 3,
        title: '3단원 CPU 스케줄링',
        from: 68,
        to: 85,
        minutes: 45,
        reason: '자료구조 시험 뒤 운영체제로 넘어가요',
      },
    ],
    '2026-11-13': [
      {
        id: 'w13a',
        subjectId: 'os',
        unitNo: 4,
        title: '4단원 메모리 관리',
        from: 86,
        to: 100,
        minutes: 40,
        reason: '알바 있는 날이라 짧게',
      },
    ],
    '2026-11-14': [
      {
        id: 'w14a',
        subjectId: 'os',
        unitNo: 4,
        title: '4단원 메모리 관리',
        from: 101,
        to: 120,
        minutes: 50,
        reason: '약속 전 오후 빈 시간',
      },
    ],
    '2026-11-15': [
      {
        id: 'w15a',
        subjectId: 'net',
        unitNo: null,
        title: '총복습 2·3단원',
        from: 37,
        to: 60,
        minutes: 120,
        reason: '일요일이라 길게 · 컴퓨터네트워크 시험(11/18) 전 총복습',
      },
    ],
  },

  // 속도 보정 (PL-07 · P4) — mock: 11/9 기본 시드에서 '다음 날로' 한 11/10에만 자료구조 1.4배 알림
  paceMock: {
    date: '2026-11-10',
    seed: 'day9',
    subjectId: 'ds',
    ratio: 1.4,
    perPage: 3.5,
    expectedPerPage: 2.5,
    days: 3,
    sessions: 3,
  },

  // 분배안 (P2, RC-03) — 와이어프레임 P2 문구 · 데이터 세트 4장 · B안은 결정 로그 6장
  replanKeepNote: '운영체제 2단원 보충 학습은 미루지 않고 그대로 둬요',
  plans: [
    {
      key: 'A',
      lines: ['11/10·11/11 하루 40분씩 추가', '범위는 그대로'],
      effect: '범위 100% 유지',
      preview: '11/10 (화) 15:00–15:40 자료구조 · 3단원 p.72–95 추가 · 적용하면 회복 박스 팝업',
    },
    {
      key: 'B',
      lines: [
        '자료구조 5단원 힙 정렬(p.135–140, 6p) 제외',
        '운영체제 4단원 세그멘테이션 사례(p.103–106, 4p) 제외',
      ],
      effect: '시간 유지 · 10p 제외',
      preview:
        '자료구조 5단원 힙 정렬(6p)과 운영체제 4단원 세그멘테이션 사례(4p)를 계획에서 빼요 · 적용하면 회복 박스 팝업',
    }, // mock: 미리보기 문구
    {
      key: 'C',
      lines: ['밀린 태스크를 핵심 요약 위주로', '태스크 시간 30% 단축'],
      effect: '1회독 깊이 얕아짐',
      preview:
        '11/10 (화) 자료구조 · 3단원 p.72–95를 42분으로 줄여 넣어요 · 적용하면 회복 박스 팝업',
    }, // mock: 미리보기 문구
  ],
  // mock: 분배안을 고른 뒤 11/10에 붙는 태스크. 실제 재배치는 백엔드 A(RC-03·04)가 계산해요.
  replanTasks: {
    A: {
      id: 'tA',
      subjectId: 'ds',
      unitNo: 3,
      title: '3단원 이진 탐색 트리·AVL 트리 (어제 몫)',
      from: 72,
      to: 95,
      minutes: 40,
      reason: '분배안 A · 공부 시간 40분 추가',
    },
    B: {
      id: 'tB',
      subjectId: 'ds',
      unitNo: 3,
      title: '3단원 이진 탐색 트리·AVL 트리 (어제 몫)',
      from: 72,
      to: 95,
      minutes: 60,
      reason: '분배안 B · 힙 정렬·세그멘테이션 사례 범위를 뺀 자리에 넣었어요', // mock: 문구
    },
    C: {
      id: 'tC',
      subjectId: 'ds',
      unitNo: 3,
      title: '3단원 이진 탐색 트리·AVL 트리 (핵심 요약)',
      from: 72,
      to: 95,
      minutes: 42,
      reason: '분배안 C · 핵심 요약 위주로 30% 단축',
    },
  },
};
