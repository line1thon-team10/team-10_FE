// mock: 가짜 데이터예요. 실제 서버 응답이 아니에요.
// 값 출처 (11/14 결정: 시드 = AI 데모 패키지, 위에 있는 것이 우선)
//   ① 서버 응답 (https://2026-line1.leehyowon14.dev, empty · day9 · overdue 시드) — 오늘 할 일 · 책 · 준비도 · 퀴즈 문항·해설 · 다음 날 · 분배안
//   ② 백엔드 app/seed (integration/contract-v1 브랜치: demo_data.py · package.py · package_questions.py · essay_examples.py) — 목표 · 색 · 고정 일정 · 2주 계획 · 정답 · 11/3~11/5 풀이 기록
//   ③ 데모 패키지 JSON (artificial_intelligence · database · operating_system · realtime_analysis · scanned_document) — 단원 · 개념 · 페이지
// 어디에도 없는 값은 지어내지 않아요. 비워 두거나 옛 값을 그대로 두고 표시했어요 (docs/policy-and-backend.md 11/14 결정).
// TODO(확인필요): [백엔드 확정 필요] 필드 이름·구조는 프론트 초안이에요. 명세가 바뀌면 어댑터와 이 파일을 맞춰요.

export const SEED = {
  demo: {
    today: '2026-11-09', // 시연 중심 날짜 (월)
    planCreatedAt: '2026-11-03',
    time: '17:00',
  },

  // 과목 · 단원 (② demo_data.SUBJECTS + ③ 패키지 sections). goalTotal은 ② loader의 passing_criteria, goalEtc는 ②에 없어요(null)
  subjects: [
    {
      id: 'ai',
      name: '인공지능',
      color: '#4F46E5',
      examDate: '2026-11-12',
      goal: 'A+',
      goalTotal: '시연 목표 90점',
      goalEtc: null,
      goalLabel: 'A+ (90점)',
      file: {
        id: 'ai-main',
        name: 'artificial_intelligence.pdf',
        pages: 30,
      },
      taskCount: 4,
      units: [
        {
          no: 1,
          title: '머신러닝 기초',
          from: 3,
          to: 11,
          difficulty: 'low',
          concepts: [
            '인공지능과 머신러닝',
            '특성과 레이블',
            '지도학습',
            '비지도학습',
            '강화학습',
            '학습·검증·테스트 분리',
            '데이터 전처리',
            '과적합과 과소적합',
            '편향과 분산',
          ],
        },
        {
          no: 2,
          title: '지도학습 알고리즘',
          from: 12,
          to: 20,
          difficulty: 'low',
          concepts: [
            '선형 회귀',
            '로지스틱 회귀',
            'k-최근접 이웃',
            '결정 트리',
            '랜덤 포레스트',
            '그래디언트 부스팅',
            '서포트 벡터 머신',
            '경사 하강법',
            '정규화 기법',
          ],
        },
        {
          no: 3,
          title: '모델 평가와 활용',
          from: 21,
          to: 29,
          difficulty: 'low',
          concepts: [
            '혼동 행렬',
            '정확도',
            '정밀도',
            '재현율',
            'F1 점수',
            '교차 검증',
            '데이터 누수',
            '모델 배포',
            '모델 모니터링',
          ],
        },
      ],
    },
    {
      id: 'db',
      name: '데이터베이스',
      color: '#2563EB',
      examDate: '2026-11-16',
      goal: 'B+',
      goalTotal: '시연 목표 80점',
      goalEtc: null,
      goalLabel: 'B+ (80점)',
      file: {
        id: 'db-main',
        name: 'database.pdf',
        pages: 30,
      },
      taskCount: 4,
      units: [
        {
          no: 1,
          title: '관계형 데이터베이스 기초',
          from: 3,
          to: 11,
          difficulty: 'low',
          concepts: [
            '데이터베이스와 DBMS',
            '테이블과 행·열',
            '기본 키',
            '외래 키',
            '관계와 카디널리티',
            '스키마와 인스턴스',
            '무결성 제약',
            'ER 모델',
            '인덱스의 개념',
          ],
        },
        {
          no: 2,
          title: 'SQL 조회와 조작',
          from: 12,
          to: 20,
          difficulty: 'low',
          concepts: [
            'SELECT 기본 문법',
            'WHERE 조건',
            'ORDER BY 정렬',
            '집계 함수',
            'GROUP BY',
            'HAVING 조건',
            'INNER JOIN',
            'LEFT JOIN',
            'INSERT·UPDATE·DELETE',
          ],
        },
        {
          no: 3,
          title: '정규화와 트랜잭션',
          from: 21,
          to: 29,
          difficulty: 'low',
          concepts: [
            '함수 종속',
            '제1정규형',
            '제2정규형',
            '제3정규형',
            '이상 현상',
            '트랜잭션 개념',
            'ACID 속성',
            'COMMIT과 ROLLBACK',
            '동시성 제어',
          ],
        },
      ],
    },
    {
      id: 'os',
      name: '운영체제',
      color: '#7C3AED',
      examDate: '2026-11-18',
      goal: '통과',
      goalTotal: '시연 목표 60점',
      goalEtc: null,
      goalLabel: '통과 (60점)',
      file: {
        id: 'os-main',
        name: 'operating_system.pdf',
        pages: 30,
      },
      taskCount: 4,
      units: [
        {
          no: 1,
          title: '프로세스와 스레드',
          from: 3,
          to: 11,
          difficulty: 'low',
          concepts: [
            '운영체제의 역할',
            '프로그램과 프로세스',
            '프로세스 상태',
            '프로세스 제어 블록',
            '문맥 교환',
            '스레드의 개념',
            '동시성과 병렬성',
            '임계 구역',
            '뮤텍스와 세마포어',
          ],
        },
        {
          no: 2,
          title: 'CPU 스케줄링',
          from: 12,
          to: 20,
          difficulty: 'low',
          concepts: [
            'CPU 스케줄링 목적',
            '선입선처리 FCFS',
            '최단 작업 우선 SJF',
            '최단 잔여 시간 우선 SRTF',
            '라운드 로빈 RR',
            '우선순위 스케줄링',
            '다단계 큐',
            '다단계 피드백 큐',
            '스케줄링 성능 지표',
          ],
        },
        {
          no: 3,
          title: '교착상태와 기아상태',
          from: 21,
          to: 29,
          difficulty: 'low',
          concepts: [
            '교착상태의 정의',
            '상호 배제 조건',
            '점유와 대기 조건',
            '비선점 조건',
            '순환 대기 조건',
            '자원 할당 그래프',
            '교착상태 예방',
            '교착상태 회피',
            '교착상태 탐지와 복구',
          ],
        },
      ],
    },
  ],

  // 스캔본 (PDF-01·07, 와이어 S3): ③ scanned_document (realtime_analysis.pdf 앞 6쪽을 이미지로 바꾼 운영체제 자료). 빈 계정 S3에 미리 올라가 있어요
  scanFile: { subjectId: 'os', name: 'scanned_document.pdf', pages: 6 },

  // 고정 일정 (② demo_data.EVENTS, day: 1=월 … 7=일)
  fixedSchedules: [
    { kind: 'class', days: [1, 3], start: '10:00', end: '12:00' },
    { kind: 'class', days: [2, 4], start: '13:00', end: '15:00' },
    { kind: 'job', days: [1, 3, 5], start: '18:00', end: '22:00' },
    { kind: 'meet', days: [6], start: '18:00', end: '21:00' },
  ],

  // S1 입력 문장과 빠른 선택 칩
  // TODO(확인필요): [기획 확인] 새 시드(인공지능 · 데이터베이스 · 운영체제)의 S1 시연 입력 문장과 칩이 없어서 옛 문장을 그대로 뒀어요 (11/14 지시문 6)
  onboarding: {
    sentence:
      '월수금 저녁 6시부터 10시까지 카페 알바, 월수 오전이랑 화목 오후에 수업 있어. 토요일 저녁엔 친구 약속. 기말은 자료구조 11월 12일, 운영체제 16일, 컴퓨터네트워크 18일. 자료구조는 A+ 받고 싶어.',
    goalChips: ['중간고사 40%', '기말고사 40%', '교수님 강조: 3단원 트리', '커트라인 90점'],
  },

  // 온보딩 목업 대본 (S1). 첫 질문·추가 질문 문구는 와이어프레임 S1
  // TODO(확인필요): [기획 확인] 새 시드 대본이 없어서 옛 문장을 그대로 뒀어요. goalTargets만 ② target_score
  onboardingScript: {
    first: '시험 일정이랑 평소 일정을 편하게 말해 줘.',
    askFirst:
      '자료구조 A+ 기준을 조금만 더 알려 줘. 상대평가야, 절대평가야? A+는 몇 점 이상이거나 상위 몇 %야? 기말 반영 비율이랑 교수님이 강조한 범위도 있으면 알려 줘.',
    askRest:
      '자료구조는 커트라인 90점 이상을 목표로 잡을게요. 운영체제랑 컴퓨터네트워크 목표도 알려 줘. 합격 기준이나 반영 비율도 같이 말해 주면 좋아요.',
    done: '운영체제는 80점 이상(기말 50%), 컴퓨터네트워크는 60점 이상(기말 60%)으로 정리했어요. 이제 캘린더에서 일정을 확인해 주세요.',
    goalTargets: { ai: 90, db: 80, os: 60 },
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
  // day9 시드의 42분 진행 중 집중 세션 (① 서버 day9 · 11/12 결정). 문구는 서버가 고른 값
  day9Session: { taskId: 't1', minutes: 42, quote: '시험은 한 번, 준비는 매일 조금씩.' },

  // AI 튜터 (TU-01 · S6-3). 추천 질문 칩은 ① 서버 today.tutorSuggestions
  // TODO(확인필요): [기획 확인] AI 명세(11/13)의 테스트 질문·답·쉬운 설명을 받으면 tutorAnswers에 넣어요. 지금은 비워 둬서 '찾지 못했어요' 안내가 나와요
  tutorSuggestions: [
    '인공지능의 지도학습 알고리즘 핵심 개념을 설명해 줘.',
    '데이터베이스의 SQL 조회와 조작 핵심 개념을 설명해 줘.',
    '운영체제의 CPU 스케줄링 핵심 개념을 설명해 줘.',
  ],
  tutorAnswers: [],

  // S5 요약: ② 2주 계획(PLAN 12개 · 300분)을 11/3~11/17 15일로 나눈 하루 평균
  planSummary: { totalPages: 81, taskCount: 12, dailyAvgMinutes: 20 },

  // 11/9 (월) 오늘 할 일 — ① 서버 day9: 2·3번 완료 (18p/27p = 67%), 1번(인공지능)은 집중 42분 진행 중
  today: {
    date: '2026-11-09',
    tasks: [
      {
        id: 't1',
        subjectId: 'ai',
        unitNo: 2,
        title: '2단원 지도학습 알고리즘',
        from: 12,
        to: 20,
        minutes: 25,
        reason: '시험 D-3, 지도학습 알고리즘',
        status: 'todo',
        donePages: 0,
      },
      {
        id: 't2',
        subjectId: 'db',
        unitNo: 2,
        title: '2단원 SQL 조회와 조작',
        from: 12,
        to: 20,
        minutes: 25,
        reason: 'SQL 조회와 조작',
        status: 'done',
        donePages: 9,
      },
      {
        id: 't3',
        subjectId: 'os',
        unitNo: 2,
        title: '2단원 CPU 스케줄링',
        from: 12,
        to: 20,
        minutes: 25,
        reason: 'CPU 스케줄링',
        status: 'done',
        donePages: 9,
      },
    ],
  },

  // 오늘의 퀴즈 문항 수 · 과목 카드 구성 줄 (① 서버 quiz/today)
  quizCounts: { '2026-11-09': { ai: 6, db: 8, os: 6 } },
  quizLines: {
    '2026-11-09': {
      ai: ['2단원 새 문제 5', '어제 틀린 문제 1'],
      db: ['2단원 새 문제 5', '어제 틀린 문제 3'],
      os: ['2단원 새 문제 5', '어제 틀린 문제 1'],
    },
  },

  // 과목별 하루 평균 계획 페이지 (밀림 기준, 4-8) — ① 서버 분배안 overdue.dailyAvg (과목 27p ÷ 태스크 4개)
  dailyAvgPages: { ai: 7, db: 7, os: 7 },

  // 최근 7일 쌓은 책 (홈) — ① 서버 today.recentDays. 오늘(11/9) 블록은 할 일 목록에서 만들어요
  recentDays: [
    { date: '2026-11-03', blocks: ['stable'] }, // 인공지능 1단원
    { date: '2026-11-04', blocks: ['risk'] }, // 데이터베이스 1단원
    { date: '2026-11-05', blocks: ['stable'] }, // 운영체제 1단원
    { date: '2026-11-06', blocks: [] },
    { date: '2026-11-07', blocks: [] },
    { date: '2026-11-08', blocks: [] },
  ],

  // 책 쌓기 (BK-01) — ① 서버 books. 단원 = 책 더미, 책 1권 = 태스크 1개.
  // 'done'은 끝난 태스크, 'planned'는 남은 계획, { taskId }는 오늘(이후) 할 일과 연결된 책이에요
  bookshelf: {
    ai: [
      { unitNo: 1, grade: 'stable', score: 90, blocks: ['done'] },
      { unitNo: 2, grade: null, score: null, blocks: [{ taskId: 't1' }] },
      { unitNo: 3, grade: null, score: null, blocks: [{ taskId: 't4' }] },
    ],
    db: [
      { unitNo: 1, grade: 'risk', score: 40, blocks: ['done'] },
      { unitNo: 2, grade: null, score: null, blocks: [{ taskId: 't2' }] },
      { unitNo: 3, grade: null, score: null, blocks: ['planned'] },
    ],
    os: [
      { unitNo: 1, grade: 'stable', score: 80, blocks: ['done'] },
      { unitNo: 2, grade: null, score: null, blocks: [{ taskId: 't3' }] },
      { unitNo: 3, grade: null, score: null, blocks: ['planned'] },
    ],
  },

  // 시험 준비도 (KP-01) — ① 서버 books.readiness (day9). overdue는 db.js에서 운영체제만 바꿔요
  readiness: [
    {
      subjectId: 'ai',
      readiness: 30,
      target: 90,
      targetLabel: 'A+',
      progressRate: 33.3,
      mastery: 90,
      studiedPages: 9,
      totalPages: 27,
    },
    {
      subjectId: 'db',
      readiness: 27,
      target: 80,
      targetLabel: 'B+',
      progressRate: 66.7,
      mastery: 40,
      studiedPages: 18,
      totalPages: 27,
    },
    {
      subjectId: 'os',
      readiness: 53,
      target: 60,
      targetLabel: '통과',
      progressRate: 66.7,
      mastery: 80,
      studiedPages: 18,
      totalPages: 27,
    },
  ],

  // 오답 노트 (RV-01) — ② 11/3~11/5 풀이 기록에서 틀렸거나 애매했던 문항 (= 오늘 퀴즈의 '어제 오답').
  // result: sureWrong 확실 오답 · unsureWrong 애매 오답 · unsureRight 애매 정답 · resolved 해결
  wrongNotes: [
    {
      id: 'w1',
      subjectId: 'ai',
      unitNo: 1,
      concept: '강화학습',
      questionId: 'ai-q1',
      question: '행동에 대한 보상을 이용해 정책을 학습하는 방법은?',
      page: 7,
      type: 'short',
      wrongCount: 0,
      lastDate: '2026-11-03',
      result: 'unsureRight',
      history: [
        {
          date: '2026-11-03',
          result: 'unsureRight',
        },
      ],
    },
    {
      id: 'w2',
      subjectId: 'db',
      unitNo: 1,
      concept: '기본 키',
      questionId: 'db-q1',
      question: '테이블에서 각 행을 식별하는 대표 키는?',
      page: 5,
      type: 'short',
      wrongCount: 1,
      lastDate: '2026-11-04',
      result: 'sureWrong',
      history: [
        {
          date: '2026-11-04',
          result: 'sureWrong',
        },
      ],
    },
    {
      id: 'w3',
      subjectId: 'db',
      unitNo: 1,
      concept: '외래 키',
      questionId: 'db-q2',
      question: '다른 테이블의 키를 참조해 관계를 표현하는 키는?',
      page: 6,
      type: 'short',
      wrongCount: 1,
      lastDate: '2026-11-04',
      result: 'sureWrong',
      history: [
        {
          date: '2026-11-04',
          result: 'sureWrong',
        },
      ],
    },
    {
      id: 'w4',
      subjectId: 'db',
      unitNo: 1,
      concept: '관계와 카디널리티',
      questionId: 'db-q3',
      question: '일대다 관계에서는 한 행에 여러 상대 행이 연결될 수 있다.',
      page: 7,
      type: 'choice',
      wrongCount: 1,
      lastDate: '2026-11-04',
      result: 'sureWrong',
      history: [
        {
          date: '2026-11-04',
          result: 'sureWrong',
        },
      ],
    },
    {
      id: 'w5',
      subjectId: 'os',
      unitNo: 1,
      concept: '문맥 교환',
      questionId: 'os-q1',
      question: '현재 실행 정보를 저장하고 다른 프로세스의 정보를 복원하는 작업은?',
      page: 7,
      type: 'short',
      wrongCount: 1,
      lastDate: '2026-11-05',
      result: 'sureWrong',
      history: [
        {
          date: '2026-11-05',
          result: 'sureWrong',
        },
      ],
    },
  ],

  // 오늘의 퀴즈 문항 (S8) — 문항·해설·근거 페이지는 ① 서버, 정답은 ② package_questions.py,
  // 서술형 70점·피드백은 ② essay_examples.py(서버 저장된 채점과 같음). 근거 문장(quote)은 서버도 null이에요.
  // unitChanges: 정답을 모두 고르고 서술형 시연 답안을 낸 ① 서버 결과 (11/14 결정 4 A)
  // answer·accepts·explanation은 서버만 아는 값이에요 (목업 채점용, 화면에 보내지 않아요).
  quizSets: {
    '2026-11-09': {
      ai: {
        round: '1회독',
        difficulty: '하',
        composition: '2단원 새 문제 5 + 어제 틀린 문제 1',
        questions: [
          {
            id: 'ai-q1',
            evidence: {
              materialId: 'ai-main',
              page: 7,
              quote: null,
            },
            concept: '강화학습',
            type: 'short',
            tag: '어제 오답',
            unitNo: 1,
            page: 'p.7',
            prompt: '행동에 대한 보상을 이용해 정책을 학습하는 방법은?',
            accepts: ['강화학습'],
            explanation:
              '강화학습은 에이전트가 환경과 상호작용하면서 보상을 최대화하는 행동 정책을 학습한다.',
          },
          {
            id: 'ai-q2',
            evidence: {
              materialId: 'ai-main',
              page: 12,
              quote: null,
            },
            concept: '선형 회귀',
            type: 'choice',
            tag: null,
            unitNo: 2,
            page: 'p.12',
            prompt: '선형 회귀는 연속형 목표값을 예측할 수 있다.',
            options: ['O', 'X'],
            answer: 0,
            explanation:
              '선형 회귀는 입력 특성과 연속형 목표값의 관계를 선형식으로 모델링한다. 평균제곱오차를 손실로 사용할 수 있다.',
          },
          {
            id: 'ai-q3',
            evidence: {
              materialId: 'ai-main',
              page: 13,
              quote: null,
            },
            concept: '로지스틱 회귀',
            type: 'choice',
            tag: null,
            unitNo: 2,
            page: 'p.13',
            prompt: '로지스틱 회귀는 분류에 사용할 수 없다.',
            options: ['O', 'X'],
            answer: 1,
            explanation:
              '로지스틱 회귀는 선형 결합 결과를 시그모이드 함수 등에 통과시켜 분류 확률을 추정한다.',
          },
          {
            id: 'ai-q4',
            evidence: {
              materialId: 'ai-main',
              page: 12,
              quote: null,
            },
            concept: '선형 회귀',
            type: 'short',
            tag: null,
            unitNo: 2,
            page: 'p.12',
            prompt: '선형 회귀에서 예측하는 목표값은 연속형과 범주형 중 무엇인가요?',
            accepts: ['연속형'],
            explanation:
              '선형 회귀는 입력 특성과 연속형 목표값의 관계를 선형식으로 모델링한다. 평균제곱오차를 손실로 사용할 수 있다.',
          },
          {
            id: 'ai-q5',
            evidence: {
              materialId: 'ai-main',
              page: 13,
              quote: null,
            },
            concept: '로지스틱 회귀',
            type: 'choice',
            tag: null,
            unitNo: 2,
            page: 'p.13',
            prompt: '로지스틱 회귀는 분류 확률을 추정한다.',
            options: ['O', 'X'],
            answer: 0,
            explanation:
              '로지스틱 회귀는 선형 결합 결과를 시그모이드 함수 등에 통과시켜 분류 확률을 추정한다.',
          },
          {
            id: 'ai-q6',
            evidence: {
              materialId: 'ai-main',
              page: 13,
              quote: null,
            },
            concept: '로지스틱 회귀',
            type: 'essay',
            tag: null,
            unitNo: 2,
            page: 'p.13',
            prompt: '로지스틱 회귀에서 선형 결합 결과를 어떻게 분류 확률로 바꾸는지 설명하세요.',
            demoScore: 70,
            good: '선형 결합 결과를 사용해 분류 확률을 추정한다는 설명이 맞아요.',
            miss: '선형 결합 결과를 시그모이드 함수 등에 통과시키는 변환 과정을 보완해 주세요.',
            explanation:
              '로지스틱 회귀는 선형 결합 결과를 시그모이드 함수 등에 통과시켜 분류 확률을 추정한다.',
          },
        ],
        unitChanges: [
          {
            unitNo: 1,
            before: 90,
            after: 92,
            grade: 'stable',
          },
          {
            unitNo: 2,
            before: null,
            after: 80,
            grade: 'stable',
          },
        ],
      },
      db: {
        round: '1회독',
        difficulty: '하',
        composition: '2단원 새 문제 5 + 어제 틀린 문제 3',
        questions: [
          {
            id: 'db-q1',
            evidence: {
              materialId: 'db-main',
              page: 5,
              quote: null,
            },
            concept: '기본 키',
            type: 'short',
            tag: '어제 오답',
            unitNo: 1,
            page: 'p.5',
            prompt: '테이블에서 각 행을 식별하는 대표 키는?',
            accepts: ['기본 키'],
            explanation:
              '기본 키는 각 행을 유일하게 식별하는 속성 또는 속성 집합이며 NULL을 허용하지 않는다.',
          },
          {
            id: 'db-q2',
            evidence: {
              materialId: 'db-main',
              page: 6,
              quote: null,
            },
            concept: '외래 키',
            type: 'short',
            tag: '어제 오답',
            unitNo: 1,
            page: 'p.6',
            prompt: '다른 테이블의 키를 참조해 관계를 표현하는 키는?',
            accepts: ['외래 키'],
            explanation:
              '외래 키는 다른 테이블의 키를 참조하여 테이블 사이의 관계를 표현한다. 참조 무결성 제약과 관련된다.',
          },
          {
            id: 'db-q3',
            evidence: {
              materialId: 'db-main',
              page: 7,
              quote: null,
            },
            concept: '관계와 카디널리티',
            type: 'choice',
            tag: '어제 오답',
            unitNo: 1,
            page: 'p.7',
            prompt: '일대다 관계에서는 한 행에 여러 상대 행이 연결될 수 있다.',
            options: ['O', 'X'],
            answer: 0,
            explanation:
              '테이블 사이에는 일대일, 일대다, 다대다 관계가 있다. 다대다 관계는 연결 테이블로 표현하는 경우가 많다.',
          },
          {
            id: 'db-q4',
            evidence: {
              materialId: 'db-main',
              page: 12,
              quote: null,
            },
            concept: 'SELECT 기본 문법',
            type: 'short',
            tag: null,
            unitNo: 2,
            page: 'p.12',
            prompt: '조회할 열을 지정하는 SQL 키워드는?',
            accepts: ['SELECT'],
            explanation: 'SELECT는 조회할 열을 지정하고 FROM은 조회할 테이블을 지정한다.',
          },
          {
            id: 'db-q5',
            evidence: {
              materialId: 'db-main',
              page: 13,
              quote: null,
            },
            concept: 'WHERE 조건',
            type: 'short',
            tag: null,
            unitNo: 2,
            page: 'p.13',
            prompt: '행을 조건에 따라 걸러 내는 SQL 절은?',
            accepts: ['WHERE'],
            explanation:
              'WHERE는 조회할 행을 조건에 따라 필터링한다. 비교 연산자와 논리 연산자를 사용할 수 있다.',
          },
          {
            id: 'db-q6',
            evidence: {
              materialId: 'db-main',
              page: 14,
              quote: null,
            },
            concept: 'ORDER BY 정렬',
            type: 'short',
            tag: null,
            unitNo: 2,
            page: 'p.14',
            prompt: '조회 결과를 정렬하는 SQL 절은?',
            accepts: ['ORDER BY'],
            explanation: 'ORDER BY는 결과를 지정한 열 기준으로 오름차순 또는 내림차순 정렬한다.',
          },
          {
            id: 'db-q7',
            evidence: {
              materialId: 'db-main',
              page: 15,
              quote: null,
            },
            concept: '집계 함수',
            type: 'choice',
            tag: null,
            unitNo: 2,
            page: 'p.15',
            prompt: 'COUNT는 집계 함수다.',
            options: ['O', 'X'],
            answer: 0,
            explanation:
              'COUNT, SUM, AVG, MIN, MAX는 여러 행을 집계한다. NULL 처리 규칙은 함수에 따라 다를 수 있다.',
          },
          {
            id: 'db-q8',
            evidence: {
              materialId: 'db-main',
              page: 16,
              quote: null,
            },
            concept: 'GROUP BY',
            type: 'short',
            tag: null,
            unitNo: 2,
            page: 'p.16',
            prompt: '같은 값을 기준으로 묶어 집계할 때 쓰는 SQL 절은?',
            accepts: ['GROUP BY'],
            explanation: 'GROUP BY는 같은 값을 가진 행을 그룹으로 묶어 집계한다.',
          },
        ],
        unitChanges: [
          {
            unitNo: 1,
            before: 40,
            after: 45,
            grade: 'risk',
            recovering: true,
            note: '회복 모드',
          },
          {
            unitNo: 2,
            before: null,
            after: 99,
            grade: 'stable',
          },
        ],
      },
      os: {
        round: '1회독',
        difficulty: '하',
        composition: '2단원 새 문제 5 + 어제 틀린 문제 1',
        questions: [
          {
            id: 'os-q1',
            evidence: {
              materialId: 'os-main',
              page: 7,
              quote: null,
            },
            concept: '문맥 교환',
            type: 'short',
            tag: '어제 오답',
            unitNo: 1,
            page: 'p.7',
            prompt: '현재 실행 정보를 저장하고 다른 프로세스의 정보를 복원하는 작업은?',
            accepts: ['문맥 교환'],
            explanation:
              '07 1. 프로세스와 스레드 / 05 문맥 교환 핵심 개념 문맥 교환은 CPU에서 실행할 프로세스를 바꾸며 이전 실행 상태를 저장하고 다음 상태를 복원하는 과정이다. 이 과정에는 오버헤드가 있다.',
          },
          {
            id: 'os-q2',
            evidence: {
              materialId: 'os-main',
              page: 12,
              quote: null,
            },
            concept: 'CPU 스케줄링 목적',
            type: 'choice',
            tag: null,
            unitNo: 2,
            page: 'p.12',
            prompt: 'CPU 스케줄러는 준비 큐에서 다음 실행 대상을 고른다.',
            options: ['O', 'X'],
            answer: 0,
            explanation:
              '12 2. CPU 스케줄링 / 01 CPU 스케줄링 목적 핵심 개념 CPU 스케줄링은 준비 큐의 프로세스 중 다음 실행 대상을 선택한다. CPU 이용률, 처리량, 응답 시간, 대기 시간 등이 평가 기준이다.',
          },
          {
            id: 'os-q3',
            evidence: {
              materialId: 'os-main',
              page: 13,
              quote: null,
            },
            concept: '선입선처리 FCFS',
            type: 'short',
            tag: null,
            unitNo: 2,
            page: 'p.13',
            prompt: '도착 순서대로 실행하는 스케줄링의 약자는?',
            accepts: ['FCFS'],
            explanation:
              '13 2. CPU 스케줄링 / 02 선입선처리 FCFS 핵심 개념 FCFS는 먼저 준비 큐에 들어온 프로세스를 먼저 실행하는 비선점 방식이다. 긴 작업 뒤에 짧은 작업이 기다리는 호위 효과 가 나타날 수 있다.',
          },
          {
            id: 'os-q4',
            evidence: {
              materialId: 'os-main',
              page: 14,
              quote: null,
            },
            concept: '최단 작업 우선 SJF',
            type: 'short',
            tag: null,
            unitNo: 2,
            page: 'p.14',
            prompt: '예상 실행 시간이 짧은 작업을 우선하는 비선점 방식의 약자는?',
            accepts: ['SJF'],
            explanation:
              '14 2. CPU 스케줄링 / 03 최단 작업 우선 SJF 핵심 개념 SJF는 예상 CPU 실행 시간이 가장 짧은 작업을 먼저 선택한다. 평균 대기 시간을 줄일 수 있지만 실행 시간 예측이 어렵다.',
          },
          {
            id: 'os-q5',
            evidence: {
              materialId: 'os-main',
              page: 15,
              quote: null,
            },
            concept: '최단 잔여 시간 우선 SRTF',
            type: 'choice',
            tag: null,
            unitNo: 2,
            page: 'p.15',
            prompt: 'SRTF는 남은 실행 시간이 더 짧은 작업에 CPU를 선점시킬 수 있다.',
            options: ['O', 'X'],
            answer: 0,
            explanation:
              '15 2. CPU 스케줄링 / 04 최단 잔여 시간 우선 SRTF 핵심 개념 SRTF는 남은 실행 시간이 가장 짧은 프로세스를 선택하는 선점형 방식이다. 새로 도착한 짧은 작업이 기존 작업을 선점할 수 있다.',
          },
          {
            id: 'os-q6',
            evidence: {
              materialId: 'os-main',
              page: 16,
              quote: null,
            },
            concept: '라운드 로빈 RR',
            type: 'short',
            tag: null,
            unitNo: 2,
            page: 'p.16',
            prompt: '정해진 시간 할당량만큼 번갈아 실행하는 방식은?',
            accepts: ['라운드 로빈'],
            explanation:
              '16 2. CPU 스케줄링 / 05 라운드 로빈 RR 핵심 개념 라운드 로빈은 일정한 시간 할당량만큼 실행하고 다음 프로세스로 교대한다. 시간 할당량이 너무 작으면 문맥 교환 비용이 커진다.',
          },
        ],
        unitChanges: [
          {
            unitNo: 2,
            before: null,
            after: 99,
            grade: 'stable',
          },
          {
            unitNo: 1,
            before: 80,
            after: 83,
            grade: 'stable',
          },
        ],
      },
    },
  },

  // 11/10 (화) 계획 — ① 서버 다음 날 할 일
  nextDayTasks: {
    '2026-11-10': [
      {
        id: 't4',
        subjectId: 'ai',
        unitNo: 3,
        title: '3단원 모델 평가와 활용',
        from: 21,
        to: 29,
        minutes: 25,
        reason: '시험 D-2, 모델 평가와 활용',
        status: 'todo',
        donePages: 0,
      },
    ],
  },

  // 이번 주 이후 계획 (S11 캘린더) — ② demo_data.PLAN 11/11~11/17. 총복습 제목은 옛 목업 규칙('총복습')
  weekPlan: {
    '2026-11-11': [
      {
        id: 'w11a',
        subjectId: 'ai',
        unitNo: null,
        title: '총복습',
        from: null,
        to: null,
        minutes: 25,
        reason: '시험 전날 총복습',
      },
    ],
    '2026-11-12': [
      {
        id: 'w12a',
        subjectId: 'db',
        unitNo: 3,
        title: '3단원 정규화와 트랜잭션',
        from: 21,
        to: 29,
        minutes: 25,
        reason: '정규화와 트랜잭션',
      },
    ],
    '2026-11-15': [
      {
        id: 'w15a',
        subjectId: 'db',
        unitNo: null,
        title: '총복습',
        from: null,
        to: null,
        minutes: 25,
        reason: '시험 전날 총복습',
      },
    ],
    '2026-11-16': [
      {
        id: 'w16a',
        subjectId: 'os',
        unitNo: 3,
        title: '3단원 교착상태와 기아상태',
        from: 21,
        to: 29,
        minutes: 25,
        reason: '교착상태와 기아상태',
      },
    ],
    '2026-11-17': [
      {
        id: 'w17a',
        subjectId: 'os',
        unitNo: null,
        title: '총복습',
        from: null,
        to: null,
        minutes: 25,
        reason: '시험 전날 총복습',
      },
    ],
  },

  // S13 계획 추가 ② 자료 고르기 — 과목 강의자료 말고 더 올린 자료.
  // TODO(확인필요): [기획 확인] 새 시드에 추가 자료 값이 없어서 비워 뒀어요 (옛 값: 컴퓨터네트워크 실습자료)
  extraMaterials: {},

  // 월간 책장 (S15) — 지난 날 기록. ② demo_data.PLAN 11/3~11/5 (9p · 25분씩, 모두 다 했어요)
  monthLog: [
    { date: '2026-11-03', pages: { ai: 9 }, minutes: 25 },
    { date: '2026-11-04', pages: { db: 9 }, minutes: 25 },
    { date: '2026-11-05', pages: { os: 9 }, minutes: 25 },
  ],
  // 월간 리포트 (S15-1) — ② package.py 11/3~11/5 풀이 15문항 중 오답 4 · 애매 정답 1
  monthQuiz: { total: 15, wrong: 4, unsureRight: 1 },

  // 속도 보정 (PL-07 · P4) — 서버에 없는 목업 전용 시연. 11/9 기본 시드에서 '다음 날로' 한 11/10에만 알림
  // TODO(확인필요): [기획 확인] 새 시드 값이 없어서 옛 숫자(1.4배 · 3.5분/쪽)를 첫 시험 과목(인공지능)에 붙였어요 (MOCK 표시)
  paceMock: {
    date: '2026-11-10',
    seed: 'day9',
    subjectId: 'ai',
    ratio: 1.4,
    perPage: 3.5,
    expectedPerPage: 2.5,
    days: 3,
    sessions: 3,
  },

  // 분배안 (P2, RC-03) — ① 서버 overdue → 다음 날로 → 분배안
  replanKeepNote: '보충 학습은 어느 안에서도 미루지 않아요',
  plans: [
    {
      key: 'A',
      lines: ['11/10·11/11 하루 20분씩 추가', '범위는 그대로'],
      effect: '범위 100% 유지',
      preview: '11/10 (화) 인공지능 · 2단원 p.12–20 추가 · 적용하면 회복 박스 팝업',
    },
    {
      key: 'B',
      lines: [
        '운영체제 3단원 교착상태 탐지와 복구(p.29–29, 1p) 제외',
        '인공지능 3단원 모델 모니터링(p.29–29, 1p) 제외',
      ],
      effect: '시간 유지 · 2p 제외',
      preview:
        '운영체제 3단원 교착상태 탐지와 복구(1p) · 인공지능 3단원 모델 모니터링(1p)를 계획에서 빼요 · 적용하면 회복 박스 팝업',
    },
    {
      key: 'C',
      lines: ['밀린 태스크를 핵심 요약 위주로', '태스크 시간 30% 단축'],
      effect: '1회독 깊이 얕아짐',
      preview:
        '11/10 (화) 인공지능 · 2단원 p.12–20를 15분으로 줄여 넣어요 · 적용하면 회복 박스 팝업',
    },
  ],
  // 분배안을 고른 뒤 11/10 맨 위에 붙는 태스크 — ① 서버 적용 결과. 서버는 carried: true를 주지만
  // 11/13 결정(지시문 4 A안)대로 초안 기준(carried 없음)으로 두고 백엔드에 요청했어요
  replanTasks: {
    A: [
      {
        id: 'tA1',
        subjectId: 'ai',
        unitNo: 2,
        title: '2단원 지도학습 알고리즘',
        from: 12,
        to: 20,
        minutes: 20,
        reason: '분배안 A · 공부 시간 20분 추가',
      },
      {
        id: 'tA2',
        subjectId: 'os',
        unitNo: 2,
        title: '2단원 CPU 스케줄링',
        from: 12,
        to: 20,
        minutes: 20,
        reason: '분배안 A · 공부 시간 20분 추가',
      },
    ],
    B: [
      {
        id: 'tB1',
        subjectId: 'ai',
        unitNo: 2,
        title: '2단원 지도학습 알고리즘',
        from: 12,
        to: 20,
        minutes: 20,
        reason: '분배안 B · 중요도 낮은 범위를 뺀 자리에 넣었어요',
      },
      {
        id: 'tB2',
        subjectId: 'os',
        unitNo: 2,
        title: '2단원 CPU 스케줄링',
        from: 12,
        to: 20,
        minutes: 20,
        reason: '분배안 B · 중요도 낮은 범위를 뺀 자리에 넣었어요',
      },
    ],
    C: [
      {
        id: 'tC1',
        subjectId: 'ai',
        unitNo: 2,
        title: '2단원 지도학습 알고리즘',
        from: 12,
        to: 20,
        minutes: 16,
        reason: '분배안 C · 핵심 요약 위주로 30% 단축',
      },
      {
        id: 'tC2',
        subjectId: 'os',
        unitNo: 2,
        title: '2단원 CPU 스케줄링',
        from: 12,
        to: 20,
        minutes: 16,
        reason: '분배안 C · 핵심 요약 위주로 30% 단축',
      },
    ],
  },
};
