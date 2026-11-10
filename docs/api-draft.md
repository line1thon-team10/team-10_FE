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
