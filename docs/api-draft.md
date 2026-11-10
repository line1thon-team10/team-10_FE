# API 초안 (프론트 임시값)

경로·필드는 `src/api/endpoints.js`, `src/api/adapters/`, `src/mocks/` 기준이에요. 백엔드 명세가 나오면 이 문서와 어댑터만 맞춰요.

## 바뀐 키 (11/10 · 정의서 v2)

| API              | 필드                             | 바뀐 내용                                                                                      |
| ---------------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `GET /api/books` | `readiness[].expectedCompletion` | **`progressRate`로 이름 변경** — 진도율(%) = 공부한 페이지 ÷ 범위. 예: 자료구조 62.9 (88/140p) |
| `GET /api/books` | `readiness[].mastery`            | 숙달도(%). 자료구조만 80.7, 나머지는 `null` (화면에 식을 안 보임)                              |
| `GET /api/today` | `streakDays`                     | **삭제** (v2: 하트·스트릭 없음)                                                                |

## 블록 상태 규칙 (서버 계산)

- 오늘 끝낸 태스크 블록은 그 과목의 오늘 퀴즈를 내기 전까지 `done`(완료·퀴즈 전, 회색)으로 내려 줘요. 단원 등급이 있어도 그래요.
- 퀴즈를 낸 뒤에는 그 단원 등급(`stable` · `shaky` · `risk`)으로 내려 줘요 (와이어 P3).
- `GET /api/today`의 `recentDays` 마지막 날과 `GET /api/books`의 `units[].blocks`에 같이 적용돼요.

## 온보딩 v2 (11/10 · 지시문 3)

### S1 과목 카드 4칸 — `GET /api/onboarding`, `POST /api/onboarding/message`

`subjects[]`의 `goalDetail`을 두 칸으로 나눴어요. 아직 모르는 칸은 `null` → 화면에 `[목표 학점]`처럼 표시.

```json
{
  "id": "ds",
  "name": "자료구조",
  "examDate": "2026-11-12",
  "goal": "A+",
  "target": 90,
  "goalTotal": "상대평가 상위 15% · 커트라인 90점",
  "goalEtc": "중간 40% · 기말 40% · 교수님 강조 3단원 트리",
  "status": "confirmed"
}
```

- `status`: `pending`(입력 전) · `asking`(추가 질문 중) · `confirmed`(정리됨)

### S3 자료 — `GET /api/materials`, `GET /api/materials/jobs/:jobId`

```json
{
  "id": "mscan",
  "name": "컴퓨터네트워크_보충자료_스캔본.pdf",
  "pages": 12,
  "status": "done",
  "quizless": true,
  "ocr": true
}
```

- `ocr`: 스캔본이라 글자 인식으로 분석했는지. 분석 작업(`jobs/:jobId`)에도 `ocr`이 오고, 이때 첫 단계 이름은 `글자 읽는 중 (글자 인식)`
- `quizless`: 이 파일 범위는 퀴즈 없음. 과목 카드에 'N개 퀴즈 없음'
- 아예 분석이 안 되면 `status: "failed"` → S3-2 목차 직접 입력
- mock: 이름에 '스캔'이 있으면 글자 인식 성공(퀴즈 없음), '실패'가 있으면 실패. 빈 계정에는 스캔본 1개가 미리 들어 있어요

### S4 시험 범위 체크 (PDF-08) — **새 경로**

`PATCH /api/materials/:materialId/units`

```json
// 요청
{ "unitNo": 5, "inExam": false }
// 응답 data
{ "subjectId": "ds", "unitNo": 5, "inExam": false }
```

- `GET /api/units?subjectId=`의 `units[]`에 `inExam`(기본 `true`)이 붙어요
- 서버가 할 일: 뺀 단원을 계획 · S5 분량 · 퀴즈 · 진도율에서 빼기. mock은 온보딩(S5 분량)에서만 빼고, 승인하면 11/9 시드로 넘어가요 (11/10 결정 A)

### S5 분량 — `GET /api/plan/draft`

`summary.totalPages`·`taskCount`를 시험 범위 단원으로 계산하고, `allocation[]`에 단원별 블록을 더했어요.

```json
{
  "summary": { "totalPages": 360, "taskCount": 45, "dailyAvgMinutes": 75, "daysToFirstExam": 9 },
  "allocation": [
    {
      "subjectId": "ds",
      "name": "자료구조",
      "pages": 140,
      "tasks": 18,
      "units": [{ "no": 1, "title": "배열과 리스트", "pages": 35, "tasks": 3 }]
    }
  ]
}
```

- mock: 과목 태스크 수 = 시드 태스크 수 × 남은 쪽 ÷ 전체 쪽 (반올림). 단원별 `tasks`는 시드 책 더미 권 수라 합이 과목 값과 1개쯤 다를 수 있어요

## 홈 v2 (11/10 · 지시문 4)

### 기록 — `POST /api/records` `{ taskId, result, toPage }`

응답 `data.event` (판정은 서버, mock은 `src/mocks/logic.js`의 `recordTask`):

```json
// 하루 마무리 박스 P1: 오늘 태스크를 다 기록했거나 데모 시각 23:30 이후 + 오늘 70% 이상, 하루 한 번
{
  "type": "box",
  "reason": "dayClose",
  "rate": 88,
  "recordedCount": 4,
  "totalCount": 4,
  "donePages": 50,
  "totalPages": 57,
  "opened": [{ "subjectId": "ds", "count": 7 }]
}
// 평소 기록 · 70%를 넘는 순간: 가벼운 알림 P1-1
{
  "type": "toast",
  "reason": "record",
  "rate": 58,
  "message": "컴퓨터네트워크 2단원 한 권 쌓았어요",
  "detail": "오늘 58%"
}
```

- `opened`: 이번 기록으로 새로 열린 과목 퀴즈 (박스 문구 "자료구조 퀴즈 7문항이 열렸어요")
- `reason`: 박스 `dayClose` · `unitDone` · `recover`(분배안 적용) / 알림 `record` · `rate70`
- v1의 `box` + `rate70`(70% 순간 박스)은 없어졌어요

### 페이지 고치기 — **새 경로** `PATCH /api/tasks/:taskId/record`

```json
// 요청
{ "toPage": 90 }
// 응답 data
{ "taskId": "t1", "status": "partial", "doneTo": 90, "rate": 91 }
```

- 기록한(부분 완료·완료) 태스크만. `toPage`는 p.from ~ p.to
- 오늘 진행률과 내일로 넘어가는 분량(다음 날로 때 계산)이 다시 계산돼요

### 집중 모드 주소

- 홈 [시작] → `/study?task=t1` (S12, 지시문 8에서 만듦)

## 퀴즈 v2 (11/10 · 지시문 5)

### S8-1 — `GET /api/quiz/today`

`rate`(오늘 진행률)와 과목 카드용 필드가 늘었어요.

```json
{
  "rate": 88,
  "subjects": [
    {
      "subjectId": "ds",
      "count": 7,
      "lines": ["3단원 새 문제 5 (p.72–88)", "어제 틀린 문제 2"],
      "round": "1회독",
      "difficulty": "하",
      "essayCount": 1
    }
  ]
}
```

### 제출 — `POST /api/quiz/:subjectId/submit` `{ answers, savedGrading }`

- `savedGrading: true`: AI 채점이 30초 넘게 없거나 실패해서 저장된 채점으로 진행 (NF-10). 응답 `essayGrading`: `ai` | `saved`
- `items[]`에 `unitNo`가 붙고, `explanation`은 모든 문항에 내려줘요 (정답·해설은 결과 화면에서 한 번에, QZ-08 v2)

### P3 퀴즈 후 책 쌓기 — 제출 응답 `bookChanges` (BK-08)

단원마다 퀴즈 전·후 책 더미. `after`는 S9 `GET /api/books`의 그 단원 값과 같아야 해요.

```json
"bookChanges": [
  {
    "unitNo": 3,
    "title": "트리와 이진 탐색",
    "before": { "score": 83, "grade": "stable", "blocks": ["stable", "doing", "planned", "planned"] },
    "after": { "score": 73, "grade": "shaky", "blocks": ["shaky", "doing", "planned", "planned"] },
    "recovering": false
  },
  {
    "unitNo": 2,
    "title": "스택과 큐",
    "before": { "score": 69, "grade": "shaky", "blocks": ["shaky", "shaky", "shaky", "shaky"] },
    "after": { "score": 70, "grade": "shaky", "blocks": ["shaky", "shaky", "shaky", "shaky"] },
    "recovering": true
  }
]
```

- `blocks`: 책 상태 (아래 → 위). 오늘 끝낸 책은 퀴즈 전 `done`(회색) → 퀴즈 후 단원 등급. `doing`(부분 완료)·`planned`(예정)는 그대로
- `recovering`: '흔들림 유지 · 회복 중' 표시

## 복습·오답 S10 (11/10 · 지시문 7)

판정(틀린 횟수 · 해결 · 이해도 · 취약 개념)은 서버. mock은 `src/mocks/logic.js`의 복습·오답 부분이에요.

### 오답 노트 — `GET /api/review/notes?group=date|unit|count` (RV-01)

```json
{
  "group": "date",
  "total": 6,
  "groups": [
    {
      "key": "2026-11-09",
      "label": "11/9 (월)",
      "items": [
        {
          "id": "w1",
          "subjectId": "ds",
          "unitNo": 2,
          "concept": "DS2-1 스택",
          "question": "빈 스택에서 pop",
          "page": 40,
          "type": "choice",
          "wrongCount": 2,
          "lastDate": "2026-11-09",
          "result": "sureWrong",
          "score": null,
          "streak": 1,
          "canRetry": true
        }
      ]
    }
  ],
  "weakConcepts": [{ "subjectId": "ds", "concept": "DS2-1 스택", "count": 2 }]
}
```

- `result`: `sureWrong` 확실 오답 · `unsureWrong` 애매 오답 · `unsureRight` 애매 정답 · `resolved` 해결. 서술형은 `score`
- 퀴즈를 제출하면 오답·애매 정답이 노트에 생겨요 (같은 문제는 한 노트에 합침). 다시 나온 문제를 확실로 맞히면 `streak` +1
- `weakConcepts`: 오답이 2회 이상 쌓인 개념 (4-3). 문제 뽑기 기본 범위

### 다시 풀기 — `GET /api/review/notes/:id/question` · `POST /api/review/notes/:id/retry`

```json
// 요청
{ "choice": 1, "text": null, "confidence": "sure" }
// 응답 data
{
  "correct": false,
  "confidence": "sure",
  "explanation": "꺼낼 값이 없어서 스택 언더플로가 나요.",
  "wrongCountBefore": 2,
  "note": { "id": "w1", "wrongCount": 3, "result": "sureWrong", "streak": 0 },
  "unitChange": {
    "unitNo": 2,
    "before": { "score": 70, "grade": "shaky" },
    "after": { "score": 69, "grade": "shaky" }
  }
}
```

- mock 규칙 (11/10 결정 A): 틀리면 틀린 횟수 +1 · 단원 점수 −1, 확실 정답이면 +1, 확실 정답 2번이면 해결. 회복 모드 하루 +5 (그 범위를 재학습했으면 +15), 등급은 한 칸씩만 올라감

### 문제 뽑기 — `POST /api/review/custom-quiz` (RV-02)

```json
// 요청
{ "subjectId": "ds", "units": [2, 3], "difficulty": "하", "count": 5, "weight": "even" }
// 응답 data
{ "quizId": "c1", "count": 5, "difficulty": "하", "note": null }
```

- 2회독한 범위만 난이도를 고를 수 있고, 1회독 범위가 섞이면 서버가 `하`로 정해요
- 만든 세트는 오늘의 퀴즈와 같은 경로로 풀어요: `GET /api/quiz/c1`, `POST /api/quiz/c1/submit`, 결과 `/quiz/result?subject=c1` (책 색 변화가 없으면 P3 없이 결과로)
- mock은 지금 있는 퀴즈 문항에서 골라서 문항마다 MOCK. 단원 점수는 바꾸지 않아요

### 재학습 기록 — `POST /api/review/relearn` `{ subjectId, unitNo }` (RV-03)

- 응답 `{ subjectId, unitNo, round, relearnedOn }`. 회독 +1, 그날 회복 상한 +15. 하루 한 번 (`ALREADY`)
- `GET /api/books`의 `units[].round`: 회독 (보충을 끝내면 2회독, 정의서 4-2)

## 집중 모드 S12 · S12-1 (11/10 · 지시문 8)

시간은 서버가 재요. 화면은 시작·멈춤·재개·종료만 보내고 받은 분만 보여줘요 (HM-07·08). mock은 `src/mocks/logic.js`의 집중 모드 부분.

| 요청      | 경로                                    | 하는 일                                                                                                      |
| --------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 시작      | `POST /api/study/sessions` `{ taskId }` | 같은 태스크가 진행 중이면 그 측정을 돌려줘요 (새로고침해도 이어짐). 다른 태스크가 진행 중이면 `OTHER_ACTIVE` |
| 진행 중   | `GET /api/study/sessions/active`        | 없으면 `null`. 화면은 30초마다 다시 물어봐요 (알림·자동 종료)                                                |
| 한 개     | `GET /api/study/sessions/:id`           | S12-1 새로고침용 (**지시문에 없던 경로**)                                                                    |
| 멈춤      | `POST /api/study/sessions/:id/pause`    | 멈춘 시간은 측정에서 빠져요                                                                                  |
| 다시 시작 | `POST /api/study/sessions/:id/resume`   | '아직 공부 중이에요?'에서 [계속 공부]도 이 경로                                                              |
| 종료      | `POST /api/study/sessions/:id/end`      |                                                                                                              |

응답 (모두 같은 모양):

```json
{
  "id": "s1",
  "taskId": "t1",
  "subjectName": "자료구조",
  "task": {
    "title": "3단원 이진 탐색 트리·AVL 트리",
    "from": 72,
    "to": 95,
    "pages": 24,
    "minutes": 60
  },
  "status": "ended",
  "quote": "시험은 한 번, 준비는 매일 조금씩.",
  "minutes": 42,
  "pausedMinutes": 8,
  "checkIn": false,
  "autoStopped": false,
  "excludeFromPace": false,
  "recorded": false,
  "todayMinutes": 175,
  "subjectMinutes": 370
}
```

- `status`: `active` · `paused` · `ended`. `quote`: 들어올 때 서버가 고른 문구 1개 (HM-10)
- HM-09: 예상 시간의 2배가 지나면 `checkIn: true`. 그 뒤 10분 동안 답이 없으면 서버가 알림 시점에서 멈추고 `autoStopped: true`, `excludeFromPace: true`(속도 보정에서 뺌)

### 기록에 측정 시간 붙이기

- `POST /api/records`에 `sessionId`를 같이 보내요 (지시문에는 `POST /api/tasks/:id/record`로 적혀 있지만 기록 경로는 `/api/records`예요). 끝난 측정이면 태스크 `measuredMinutes`에 더하고 `recorded: true`
- `sessionId` 없이 오면 시간 없이 저장
- `GET /api/today`의 `tasks[]`: `pendingSessionId` · `pendingMinutes`(재고 아직 기록 안 한 측정 → 홈 카드 '기록 전 · N분'), `measuredMinutes`

## 근거 원본 · 더 풀기 · AI 튜터 (11/10 · 지시문 9, 정의서 v2_2)

### 원본 PDF — `GET /api/materials/:materialId/file` (QZ-13)

- 응답: PDF 파일 (`application/pdf`). mock은 `public/mock/ds-lecture-mock.pdf` (자료구조 140쪽, 쪽마다 MOCK). 자료구조(`ds-main`) 말고는 `NO_FILE` 404
- 과목 강의자료 id: `subjects[].file.id` (`ds-main` · `os-main` · `net-main`)
- 퀴즈 결과 `items[].evidence`: `{ materialId, page, quote }`. 풀 때(`GET /api/quiz/:id`)는 보내지 않아요. 화면은 그 쪽을 열고 글자 층에서 `quote`를 찾아 하이라이트
- 집중 모드 세션 `material: { id, page }` → [자료 열기]

### 더 풀기 — `POST /api/quiz/:subjectId/more` `{ unitNo }` (QZ-11)

```json
// 응답 data
{ "quizId": "m1", "count": 5 }
```

- 같은 단원 5문항 세트를 만들고 `/quiz?subject=m1`로 풀어요 (`GET /api/quiz/m1`의 `resultFor: "ds"`)
- 제출하면 원래 결과(`GET /api/quiz/ds/result`)의 `more[]`에 이어 붙어요: `{ unitNo, summary, items, moreUnitChange: { unitNo, before, after } }`
- 이해도 반영 (4-2 "더 푼 5문항도 이해도에"): mock은 다시 풀기와 같은 규칙. 실제 계산은 서버 (정의서 4-1, calc.py). 단원마다 하루 한 번

### AI 튜터 — `POST /api/tutor` (TU-01 · TU-02, 정의서 v2_2 4-14)

요청 (제안, 김현민 확인 전):

```json
// TU-01 기본 질문: 단일턴, 지난 질문·답은 보내지 않아요
{ "question": "AVL 트리 회전은 언제 해?", "history": [] }
// TU-02 쉬운 설명: 직전 질문·답 한 쌍 1개
{
  "question": "더 쉽게 설명해줘",
  "history": [
    {
      "question": "AVL 트리 회전은 언제 해?",
      "answer": "AVL 트리는 …",
      "pages": [{ "materialId": "ds-main", "from": 90, "to": 90 }]
    }
  ]
}
```

응답 (두 경우 같은 모양):

```json
{
  "id": "tq2",
  "parentId": "tq1",
  "subjectName": "자료구조",
  "question": "더 쉽게 설명해줘",
  "answer": "시소를 떠올려 보세요. …",
  "pages": [
    { "materialId": "ds-main", "from": 90, "to": 90 },
    { "materialId": "ds-main", "from": 91, "to": 93 }
  ],
  "saved": false
}
```

- 정의서가 정한 건 `{ answer, pages }`. 나머지 필드(`id` · `parentId` · `question` · `subjectName` · `saved`)는 화면 표시용 임시
- `pages` 안 모양 `[{ materialId, from, to }]`는 임시 (TODO 백엔드 확정)
- 쉬운 설명의 `pages`는 원래 답 그대로 (4-14 제안). 질문·답은 한 쌍씩 저장, 쉬운 설명은 원래 답에 연결 (`parentId`)
- 버튼은 답 하나당 1번 (화면). 새 질문의 답에는 다시 생겨요

### 저장된 결과 — `GET /api/tutor/backup?kind=basic|easy` (임시, NF-10)

- 응답이 30초 넘게 없거나 실패했을 때만 써요. 요청 `{ question, history }`에는 필드를 더하지 않아요 (11/10 결정 A)
- 시연 백업: "AVL 트리 회전은 언제 해?"의 기본 답(`basic`)과 쉬운 설명(`easy`). 응답 모양은 위와 같고 `saved: true`

## 캘린더 S11 · P5 · S6-4 (11/10 · 지시문 10)

재배치 계산은 서버 (mock은 `src/mocks/logic.js` 캘린더 부분). 일정을 지워도 공부 블록은 지우지 않고, 계획 변경은 미리보기 → 확인 → 적용 (4-12).

### 주간 캘린더 — `GET /api/calendar?from=2026-11-09&to=2026-11-15` (ON-04)

```json
{
  "today": "2026-11-09",
  "exams": [{ "subjectId": "ds", "name": "자료구조", "date": "2026-11-12" }],
  "fixed": [
    {
      "id": "fx2@2026-11-13",
      "scheduleId": "fx2",
      "kind": "job",
      "title": "알바",
      "date": "2026-11-13",
      "start": "18:00",
      "end": "22:00",
      "repeat": true
    }
  ],
  "study": [
    {
      "id": "w12a",
      "subjectId": "os",
      "subjectName": "운영체제",
      "color": "#2563EB",
      "title": "3단원 CPU 스케줄링",
      "from": 68,
      "to": 85,
      "date": "2026-11-12",
      "start": "19:00",
      "end": "19:45",
      "minutes": 45,
      "reason": "자료구조 시험 뒤 운영체제로 넘어가요",
      "moved": false
    }
  ],
  "summary": [{ "subjectId": "os", "name": "운영체제", "minutes": 180, "count": 5 }]
}
```

- 11/11~11/15 계획은 데이터 세트 3장 (캘린더 표시용, '다음 날로'는 11/10까지)
- mock 블록 시각 규칙 (11/10 결정 A): 저녁 고정 일정이 없는 날은 19:00부터, 있는 날은 수업 끝난 뒤(12시면 13:00, 15시면 15:30, 없으면 14:00)부터. 기준은 원래 주간 일정이라 '이번만' 지워도 그날 블록은 그대로
- 고정 일정 `id` = `일정id@날짜`. `repeat: true`면 삭제 범위를 물어봐요

### 일정 삭제 — `DELETE /api/schedules/:id?scope=once|future` (ON-07) → 빈 시간 안 (P5)

```json
{
  "emptyTime": {
    "date": "2026-11-13",
    "start": "18:00",
    "end": "22:00",
    "label": "11/13 (금) 18:00–22:00이 비었어요"
  },
  "options": [
    { "key": "rest", "title": "그대로 쉬기", "enabled": true, "default": true },
    {
      "key": "pull",
      "title": "밀린 분량 당겨오기",
      "desc": "밀린 분량이 없어요",
      "enabled": false
    },
    {
      "key": "advance",
      "title": "다음 태스크 앞당기기",
      "desc": "11/14 (토) 운영체제 4단원 … (50분)을 18:00–18:50으로 앞당겨요",
      "reason": "운영체제 시험(11/16) 전에 하루 여유가 생겨요",
      "enabled": true
    }
  ]
}
```

- `pull`: 어제에서 이월된 태스크가 있을 때만. `advance`: 빈 시간 뒤 첫 공부 블록(보충이 있으면 보충 먼저)
- 과목을 뺄 때(S14)도 같은 모양으로 돌려주면 같은 팝업을 써요

### 빈 시간 안 적용 — `POST /api/plan/empty-time` `{ option: "rest" | "pull" | "advance" }` (ON-08)

- 응답 `{ option, movedTaskId }`. 서버가 직전 삭제로 생긴 빈 시간을 기억해요

### 말로 일정 추가 — `POST /api/schedules/voice` `{ text }` → 미리보기 · `POST /api/schedules/voice/apply` (ON-06)

```json
{
  "event": {
    "title": "조모임",
    "date": "2026-11-12",
    "start": "19:00",
    "end": "21:00",
    "repeat": false,
    "label": "11/12 (목) 19:00–21:00 조모임을 추가할게요"
  },
  "moves": [
    {
      "taskId": "w12a",
      "block": {
        "subjectName": "운영체제",
        "title": "3단원 CPU 스케줄링",
        "date": "2026-11-12",
        "start": "19:00",
        "end": "19:45",
        "minutes": 45
      },
      "pieces": [
        {
          "date": "2026-11-13",
          "start": "14:40",
          "end": "15:03",
          "minutes": 23,
          "from": 68,
          "to": 76
        },
        {
          "date": "2026-11-14",
          "start": "14:50",
          "end": "15:12",
          "minutes": 22,
          "from": 77,
          "to": 85
        }
      ]
    }
  ],
  "note": "11/12 (목)은 자료구조 시험 당일이라 겹치는 공부를 다음 공부일 이틀로 나눠 옮겨요. …"
}
```

- mock 옮기는 규칙 (11/10 결정 A, 데이터 세트 '조모임'): 겹치는 블록을 반으로 나눠 다음 공부일 이틀에 하나씩, 그날 마지막 블록 뒤로
- '매주 …'처럼 반복이면 `repeat: true`, `days` + 남은 기간 겹침을 한 목록에
- 적용은 서버가 기억한 미리보기를 그대로 반영 (`{ added, moved }`)

## 말로 일정 해석 · 속도 보정 P4 (11/10 · 지시문 11)

### 말로 일정 해석은 목업 규칙이에요

- `POST /api/onboarding/events/voice`(S2)와 `POST /api/schedules/voice`(S6-4)는 같은 목업 함수 `src/mocks/parseSchedule.js`로 문장을 해석해요. 실제 해석은 AI(김현민) 몫이고, 응답 모양은 그대로예요
- 순서: ① 기간 ② 시각 범위 ③ 시각('시간'의 '시'는 시각 아님) ④ 때(오후·저녁·밤은 12 미만이면 +12) ⑤ 요일·반복(수요일 · 월수금 · 매주 · 매일 · 평일 · 주말)
- 끝 시간: 범위 → 시작 + 기간 → 기본 2시간. 시각 없이 때만 있으면 때 기본 범위(저녁 19–21 등)
- 요일이 없으면 지금처럼 해석 실패 (S2 "요일과 시간을 찾지 못했어요", S6-4 "요일을 찾지 못했어요")
- S2에서 반복 문장(월수금 · 매주 …)이면 매주 일정(`days`)으로 들어가요

### 속도 보정 — `GET /api/today`의 `paceAlert` · `POST /api/plan/pace` (PL-07)

```json
"paceAlert": {
  "subjectId": "ds",
  "subjectName": "자료구조",
  "ratio": 1.4,
  "perPage": 3.5,
  "expectedPerPage": 2.5,
  "days": 3,
  "sessions": 3,
  "rows": [
    { "taskId": "t5", "date": "2026-11-10", "title": "4단원 그래프", "from": 96, "to": 120, "now": 60, "after": 90 },
    { "taskId": "w11b", "date": "2026-11-11", "title": "총복습", "from": null, "to": null, "now": 60, "after": null }
  ],
  "overDays": []
}
```

- 예상과 20% 이상 차이 날 때만, 과목당 하루 한 번 (`paceAlert`가 없으면 `null`)
- `after: null` = 페이지 기준이 아닌 태스크라 그대로. `after` = 쪽수 × `perPage` (5분 단위)
- `overDays`: 반영하면 하루 공부 가능 시간(08–23시에서 고정 일정을 뺀 시간, 11/10 결정 A)을 넘는 날 `[{ date, total, free, over }]`
- mock: 11/9 기본 시드에서 '다음 날로' 한 11/10에만 자료구조 1.4배 (값은 MOCK)

`POST /api/plan/pace` `{ subjectId, apply }` → `{ applied, overDays, replan }`

- `apply: false` [그대로]: 아무것도 바꾸지 않고 그날은 다시 안 떠요 (팝업을 닫아도 같아요)
- `apply: true` [반영]: 남은 태스크 시간을 늘려요. 넘는 날이 생기면 `replan: true` → 오늘 응답의 `replan`이 `{ kind: "pace", title: "속도를 반영하니 11/11에 N분이 넘어요", options }`로 와서 P2를 띄워요 (안 문구는 mock, TODO 기획 확인)
- P2와 같은 날이면 P2 먼저, 팝업이 다 닫힌 뒤 P4 (TODO 기획 확인)
