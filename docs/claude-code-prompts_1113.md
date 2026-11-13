# Claude Code 지시문 — 실서버 연결 (11/13 결정 기준, 6개)

> 순서대로 하나씩 붙여 넣으세요. 각 지시문이 끝나면 보고를 확인하고, 커밋 · 푸시는 직접 합니다.
> 작업 브랜치는 `dev`(지금 main과 같은 `c8e250d`)입니다. 기본값은 계속 목업이라, 나중에 main에 합쳐도 제출용 빌드는 바뀌지 않습니다.
> 11/13 결정: ① 기준 = 서버 0.1.0(= 프론트 초안), BE 1.0은 C19만 반영 ② 혼합 모드 ③ 제출 · 영상은 목업 유지 ④ 로컬 Vite 프록시만 (Vercel은 건드리지 않음)

---

## 지시문 1 — 연결 기반: 프록시 · 혼합 모드 · 세션 · 데모 동기화

```
[금지 사항]
- G-2 금지 경로: 상대 팀 명세를 받자마자 기준 확인 없이 API 층(client · endpoints · adapters · mocks) 수정에 들어가기
  → 대신 할 것: 이번 기준은 '서버 0.1.0 = 프론트 초안(docs/api-draft.md)'이다. 근거는 백엔드 README의 '기준 문서' 표(API 경로·응답 모양 = 프론트 endpoints.js · adapters · api-draft.md)와 11/13 사용자 결정이다. 코드 수정 전에 docs/policy-and-backend.md에 '11/13 결정'으로 먼저 적고, 보관 브랜치를 먼저 만든다. 백엔드 1.0 문서(PR #3)의 변경은 C19 말고는 반영하지 않는다.
- G-1 금지 경로: 색만 바꿔서 상태를 구분하기 → 대신: 밝기·패턴 차이 + 상태 글자. (이번 작업은 상태 색을 바꾸지 않는다)
- force push · reset --hard · 브랜치 삭제 금지. 커밋·푸시는 사람이 한다 (메시지만 제안).
- .env 커밋 금지. deploy 브랜치 · vercel.json · Vercel 설정은 건드리지 않는다.
- 익명 ID · 개인정보를 콘솔 · URL · 로그에 남기지 않는다.

명세가 불분명하거나 이 지시문에 없는 결정이 필요하면 임의로 정하지 말고 멈춘 뒤 질문할 것. 같은 오류가 2회 수정 후에도 남으면 멈추고 시도 내역과 원인 가설을 보고할 것.

[준비]
git switch dev && git pull → git branch backup/before-connect-1113 (로컬, 푸시하지 않음)

[확정 사항]
- 서버: https://2026-line1.leehyowon14.dev (Swagger /docs, OpenAPI /openapi.json, 버전 0.1.0)
- 공통 규칙은 그대로: /api, { success, data, error: { code, message } }, X-Anonymous-Id, 요청 30초
- 서버에 있는 22개 (method + path):
  POST /api/session · GET /api/demo/state · POST /api/demo/seed · POST /api/demo/reset · POST /api/demo/next-day
  GET /api/today · POST /api/records · PATCH /api/tasks/:id/record · GET /api/books
  GET /api/quiz/today · GET /api/quiz/:key · POST /api/quiz/:key/submit · GET /api/quiz/:key/result · POST /api/quiz/:subjectId/more
  GET /api/plan/replan/options · POST /api/plan/replan
  POST /api/study/sessions · GET /api/study/sessions/active · GET /api/study/sessions/:id · POST …/:id/pause · …/:id/resume · …/:id/end
  같은 핸들러 파일 안이라도 위에 없는 경로(예: /api/records/interpret, /api/plan/pace, /api/demo/ai)는 목업이다.
- 연결 방식 (개발): vite.config.js에서 loadEnv로 API_PROXY_TARGET을 읽어 '/api'를 그 주소로 프록시 (changeOrigin: true). 값이 비어 있으면 프록시를 켜지 않는다. VITE_API_BASE_URL은 비워 둔다. 변수 이름 API_PROXY_TARGET은 [임시].
- 모드: VITE_USE_MOCK = true(전부 목업, 기본) | false(전부 서버) | hybrid(혼합). src/config/env.js에 mode를 추가한다. 기존 ENV.useMock은 'false가 아니면 MSW를 켠다'는 뜻 그대로 둔다(hybrid도 MSW 켬). MOCK 배지는 hybrid에서도 지금처럼 보인다.
- 혼합 모드 규칙
  a. 위 22개 경로는 MSW에서 passthrough로 서버에 보낸다. 경로 목록은 한 파일에만 둔다.
  b. 경로나 본문의 ID(taskId, :key, :subjectId, :id)가 UUID 모양이 아니면 passthrough하지 않고 목업이 처리한다. (목업에서 만든 ID로 서버를 부르지 않게. 서버 ID는 모두 UUID)
  c. demo seed · reset · next-day는 서버로 보내고, 성공하면 목업 상태도 같은 시드 / 같은 날로 맞춘다. 화면에 주는 응답은 서버 값이다. (MSW bypass 사용 가능)
- 세션 (모든 모드): 응답이 401이고 code가 NO_SESSION 또는 UNKNOWN_SESSION이면, 저장된 익명 ID를 지우고 POST /api/session으로 새로 받은 뒤 그 요청을 딱 1번만 다시 보낸다. (서버 메시지가 '새로 발급받아 주세요'이고, 목업 때 저장된 mock- ID도 이 규칙으로 정리됨)
- C19: 서버는 empty 시드에서 demo/state.firstExam을 null로 준다. adapters/demo.js는 null을 그대로 받고, MainLayout 헤더는 firstExam이 없으면 '첫 시험 · D-day' 줄만 숨긴다. 그 밖의 화면 변경은 하지 않는다.
- 로컬 비교 결과 (참고): 22개 응답은 프론트 adapters와 필드가 같고, 어댑터가 멈추는 곳은 firstExam null 하나였다.

[할 일]
1. docs/policy-and-backend.md에 '11/13 결정' 표 추가: 기준(서버 0.1.0 = 프론트 초안, BE 1.0은 서버 구현 뒤 영역별 · 이번엔 C19만) · 혼합 모드 · 개발 프록시 · 제출본은 목업 유지
2. 위 확정 사항대로 vite.config.js · src/config/env.js · src/mocks(혼합 모드) · src/api/client.js(또는 useSession) · adapters/demo.js · MainLayout 수정
3. .env.example에 API_PROXY_TARGET= (빈 값)과 VITE_USE_MOCK 세 값 설명 추가

[완료 기준 · 확인 방법]
- npm run check 통과
- VITE_USE_MOCK=true: 지금과 똑같이 동작 (/dev 시드 3개 전환, 콘솔 오류 0)
- VITE_USE_MOCK=hybrid + API_PROXY_TARGET 설정: Network 탭에서 /api/session · /api/demo/state는 서버 응답(UUID), /api/onboarding 등은 목업
- /dev에서 empty 시드 → 헤더 D-day가 숨고 오류 없음 → day9로 돌아오면 다시 보임
- localStorage에 mock- 익명 ID가 남은 채로 hybrid 시작 → 새 ID를 받고 화면 정상
- 보고: 바꾼 파일, 22개 목록 위치, 남은 문제. 커밋 메시지 제안 (예: feat(api): 서버 연결 기반 — 프록시 · 혼합 모드 · 세션 재발급 / fix(header): 첫 시험 없을 때 D-day 숨김 (C19))
```

---

## 지시문 2 — 홈 · 공부 기록 · 집중 모드 (S6 · S7 · S12 · P1)

```
[금지 사항]
- G-2: 기준은 '서버 0.1.0 = 프론트 초안'(docs/policy-and-backend.md '11/13 결정'). 백엔드 1.0 문서의 필드(pages/ranges, completedRanges, calibrationId 등)는 넣지 않는다.
- G-1: 상태 색·책 재질을 바꾸지 않는다. 바꿔야 하면 멈추고 묻는다.
- 화면(src/pages, src/components) 수정은 원칙적으로 하지 않는다. 고쳐야 하면 멈추고 이유를 보고한다.
- force push · reset --hard · 브랜치 삭제 금지. 커밋·푸시는 사람이 한다. .env · Vercel 설정은 건드리지 않는다.

명세가 불분명하거나 이 지시문에 없는 결정이 필요하면 임의로 정하지 말고 멈춘 뒤 질문할 것. 같은 오류가 2회 수정 후에도 남으면 멈추고 시도 내역과 원인 가설을 보고할 것.

[확정 사항]
- 서버 경로: GET /api/today · POST /api/records · PATCH /api/tasks/:id/record · /api/study/sessions 6개 (지시문 1 혼합 모드로 서버에 감)
- 로컬 비교: 응답 필드는 adapters와 같다. 서버에만 있는 tasks[].carried · measuredMinutes · supplement 중 앞의 둘은 어댑터가 이미 읽는다. supplement는 새 화면 표시를 만들지 않는다.
- 서버 오류 코드 중 초안에 없던 것: SESSION_RUNNING(409) · SESSION_USED(409) · TASK_DONE · OTHER_ACTIVE · ACTIVE_STUDY_SESSION · NOT_ACTIVE · ENDED · NOT_RECORDED · BAD_PAGE · TASK_NOT_FOUND. 화면은 지금처럼 서버 error.message(한국어)를 보여 준다. 코드로 분기하는 곳은 NO_PLAN(useToday · S6Home)뿐이고 서버도 같은 코드다.
- 서버 시드에는 '42분 진행된 집중 세션'(11/12 결정)이 없다. 혼합 모드에서는 0분부터 시작하는 것이 정상이다. 목업 시드는 바꾸지 않는다.
- 진행률 · 70% · 박스 판정은 서버 값을 보여 준다 (프론트에서 계산하지 않음).

[할 일]
hybrid 모드로 아래 흐름을 돌려 보고, 깨지는 곳만 adapters / hooks에서 고친다.
day9 홈 → 첫 할 일 부분 완료(페이지 입력) → 기록 고치기 → 나머지 완료로 70% 넘김 → P1 하루 마무리 박스 → 퀴즈 열림 알림
→ /dev에서 day9로 되돌린 뒤 집중 모드 시작 · 멈춤 · 다시 시작 · 종료 → 측정 시간 붙여 기록 → 홈 '측정 N분' 표시
→ 같은 집중 세션으로 두 번 기록 시도 시 SESSION_USED 안내

[완료 기준 · 확인 방법]
- npm run check 통과, 위 흐름에서 콘솔 오류 0
- VITE_USE_MOCK=true로 같은 흐름이 그대로 동작 (회귀 없음)
- 보고: 서버와 목업이 다르게 보인 곳 표 (화면 · 차이 · 고친 곳 또는 남긴 이유). 커밋 메시지 제안 (예: feat(S6): 홈 · 기록 · 집중 모드 서버 연결)
```

---

## 지시문 3 — 퀴즈 · 책 쌓기 (S8-1 · S8 · S8-2 · P3 · S9 · 더 풀기)

```
[금지 사항]
- G-2: 기준은 '서버 0.1.0 = 프론트 초안'. 백엔드 1.0의 quizId 필수 · 문항별 답 저장(PUT answers) · 풀이 중 page 제거 · rects는 넣지 않는다.
- G-1 금지 경로: 색만 바꿔서 상태를 구분하기. 밝기가 비슷한 두 상태에 같은 패턴·장식 → 대신: 밝기·패턴 차이 + 상태 글자. 등급 'perfect' 표시를 확인할 때 /dev 책 블록을 filter: grayscale(1)로 본다. 색을 바꿔야 하면 멈추고 묻는다.
- 화면 수정은 원칙적으로 하지 않는다. 고쳐야 하면 멈추고 이유를 보고한다.
- force push · reset --hard · 브랜치 삭제 금지. 커밋·푸시는 사람이 한다. .env · Vercel 설정은 건드리지 않는다.

명세가 불분명하거나 이 지시문에 없는 결정이 필요하면 임의로 정하지 말고 멈춘 뒤 질문할 것. 같은 오류가 2회 수정 후에도 남으면 멈추고 시도 내역과 원인 가설을 보고할 것.

[확정 사항]
- 서버 경로: GET /api/quiz/today · GET /api/quiz/:key · POST …/submit · GET …/result · POST /api/quiz/:subjectId/more · GET /api/books. key는 과목 UUID 또는 더 풀기 퀴즈 UUID
- 서버와 목업의 차이 (로컬 비교)
  1. empty 시드에서 GET /api/quiz/today: 서버는 200 + subjects [], 목업은 404 NO_PLAN → S8-1이 빈 목록에서 깨지지 않는지 확인
  2. 제출 본문의 savedGrading을 서버는 쓰지 않는다. AI 채점이 실패하면 서버가 알아서 저장된 채점으로 바꾸고(결과 essayGrading: 'saved'), 저장된 채점이 없으면 503 AI_FAILED → 답안을 지우지 않고 다시 제출할 수 있으면 된다
  3. 근거: 서버 evidence는 { materialId(UUID), page, quote: null }. AI 문서(11/13)도 근거 문장 없이 페이지만 준다. PdfPageDialog는 quote가 없으면 하이라이트하지 않는다(현재 동작). 원본 PDF 경로(/api/materials/:id/file)는 서버에 없어서 혼합 모드에선 목업의 NO_FILE 안내가 뜨는 것이 정상이다
  4. 등급: 서버가 risk / shaky / stable / perfect를 준다 (labels.js에 perfect 있음)
- 서버 오류 코드: QUIZ_LOCKED(403) · QUIZ_FINALIZED · CONFIDENCE_REQUIRED · NO_QUIZ · NO_QUESTIONS · NO_RESULT · UNIT_NOT_FOUND · AI_FAILED(503). 코드 분기는 NO_QUIZ(S8Quiz) · NO_RESULT(S8_2Result)만 있고 서버도 같은 코드다
- 단원 점수 · 등급 · 준비도는 서버가 계산한 값을 보여 준다

[할 일]
hybrid 모드로 아래 흐름을 돌려 보고, 깨지는 곳만 adapters / hooks에서 고친다.
day9에서 70% 넘김 → S8-1 → 자료구조 퀴즈(서술형 포함) 풀기 → S8-2 결과(해설 · 서술형 피드백 · 근거 보기 버튼) → P3 책 변화 → 더 풀기 5문항 → 결과 이어 붙음 → S9 책 쌓기
→ empty 시드에서 S8-1 · S9 빈 상태 확인 → 70% 전에 퀴즈 주소로 직접 들어갔을 때 QUIZ_LOCKED 안내

[완료 기준 · 확인 방법]
- npm run check 통과, 위 흐름에서 콘솔 오류 0
- VITE_USE_MOCK=true 회귀 없음
- /dev 책 블록 grayscale 확인 결과 (perfect 포함)
- 보고: 차이 표, 서술형 채점에 걸린 시간(30초 안인지). 커밋 메시지 제안 (예: feat(S8): 퀴즈 · 책 쌓기 서버 연결)
```

---

## 지시문 4 — 밀림 · 분배안 · 다음 날로 (P2 · 회복 박스 · S6-2 이월)

```
[금지 사항]
- G-2: 기준은 '서버 0.1.0 = 프론트 초안'. 백엔드 1.0의 판정 기준 변경(C15 · C22)은 넣지 않는다. 판정은 서버 값을 그대로 쓴다.
- G-1: 상태 색·책 재질을 바꾸지 않는다.
- 화면 수정은 원칙적으로 하지 않는다. 고쳐야 하면 멈추고 이유를 보고한다.
- force push · reset --hard · 브랜치 삭제 금지. 커밋·푸시는 사람이 한다. .env · Vercel 설정은 건드리지 않는다.

명세가 불분명하거나 이 지시문에 없는 결정이 필요하면 임의로 정하지 말고 멈춘 뒤 질문할 것. 같은 오류가 2회 수정 후에도 남으면 멈추고 시도 내역과 원인 가설을 보고할 것.

[확정 사항]
- 서버 경로: POST /api/demo/next-day(judgment: carry | replan | none) · GET /api/plan/replan/options · POST /api/plan/replan { key } · GET /api/today의 notice(carry | replanned) · replan
- 로컬 비교: 응답 필드는 adapters와 같다. 서버에만 있는 replan.kind · title · saved는 어댑터가 이미 읽는다. 밀리지 않았을 때 options는 404 NO_REPLAN
- 지시문 1의 규칙대로 next-day는 서버와 목업 날짜를 함께 넘긴다 (캘린더 등 목업 화면 날짜가 맞아야 함)
- 속도 보정(P4)은 서버에 없다 (today.paceAlert는 항상 null). 혼합 모드에서 P4가 안 뜨는 것이 정상이다. P2 → P4 순서 규칙(11/12 결정)은 목업 모드에서만 확인한다

[할 일]
hybrid 모드로 아래 흐름을 돌려 보고, 깨지는 곳만 adapters / hooks에서 고친다.
/dev overdue → [다음 날로] → judgment replan → P2 분배안 3개 → 하나 고르기 → 회복 박스 → 홈 할 일의 배치 이유가 서버 문구로 바뀜
→ /dev day9 → [다음 날로] → carry → S6-2 이월 안내 → 캘린더(목업) 날짜도 함께 넘어갔는지

[완료 기준 · 확인 방법]
- npm run check 통과, 위 흐름에서 콘솔 오류 0
- VITE_USE_MOCK=true에서 P2 → P4 순서 포함 회귀 없음
- 보고: 차이 표. 커밋 메시지 제안 (예: feat(P2): 밀림 · 분배안 · 다음 날로 서버 연결)
```

---

## 지시문 5 — 목업 유지 영역과 교차 이동 (S1~S5 · S10 · S11 · S13~S15 · 튜터)

```
[금지 사항]
- G-2: 서버에 없는 영역은 목업을 유지한다. 백엔드 1.0의 새 경로(일정 수정 미리보기 · 신규 과목 · rebuild 비교 등)는 만들지 않는다.
- G-1: 상태 색·책 재질을 바꾸지 않는다.
- 화면 흐름(어느 화면에서 어디로 가는지)을 바꾸지 않는다. 바꿔야 해결되는 문제는 멈추고 보고한다.
- force push · reset --hard · 브랜치 삭제 금지. 커밋·푸시는 사람이 한다. .env · Vercel 설정은 건드리지 않는다.

명세가 불분명하거나 이 지시문에 없는 결정이 필요하면 임의로 정하지 말고 멈춘 뒤 질문할 것. 같은 오류가 2회 수정 후에도 남으면 멈추고 시도 내역과 원인 가설을 보고할 것.

[확정 사항]
- 서버에 없는 영역 (목업 유지): 온보딩 · 자료 · 단원 · 계획 초안/승인/다시 나누기(S1~S5-2), 튜터 · 말로 기록 · 속도 보정, 캘린더 · 일정 · 빈 시간 · 월간, 계획 바꾸기(S13 · S14), 복습 · 오답(S10), /api/demo/ai
- S5 승인(목업)은 지금 목업 상태를 day9로 바꾼다. 혼합 모드에서는 서버도 day9가 되도록 POST /api/demo/seed { seed: 'day9' }를 서버에 함께 보낸다 (승인 뒤 홈은 서버 화면이기 때문)
- AI 문서(11/13): 튜터 ask · simplify가 AI에는 있지만 서버 경로가 없다 → 튜터는 목업 그대로. S1 일정 대화 · S3 PDF 분석도 목업 그대로
- 지시문 1 규칙: UUID가 아닌 ID로 서버 경로를 부르면 목업이 처리한다

[할 일]
1. empty 시드에서 S1 → S2 → S3(일반 PDF · 이름에 '스캔'이 든 PDF) → S4 → S5 승인 → 홈이 서버 day9로 열리는지
2. 교차 이동 점검표 작성: 목업 화면과 서버 화면 사이에서 ID를 넘기는 곳을 모두 찾아 지금 동작을 적는다 (정상 / 안내만 뜸 / 오류)
   예: S11 캘린더 블록 → S7 기록, S10 다시 풀기 · 문제 뽑기 → S8, S8-2 → S10 오답 노트, S9 → S10, 홈 → 튜터, 집중 모드 '자료 열기', S8-2 근거 원본
3. '오류'인 곳만, 화면 흐름을 바꾸지 않고 mocks · adapters · hooks에서 고칠 수 있으면 고친다. 아니면 고치지 않고 표에 남긴다

[완료 기준 · 확인 방법]
- npm run check 통과
- 1번 흐름 콘솔 오류 0, 점검표에 '오류'가 남으면 각각 원인과 제안
- VITE_USE_MOCK=true 회귀 없음
- 보고: 교차 이동 점검표. 커밋 메시지 제안 (예: fix(mock): 혼합 모드 계획 승인 뒤 서버 시드 맞추기)
```

---

## 지시문 6 — 전체 점검 · 문서 · 측정 (마무리)

```
[금지 사항]
- G-2: 이번 연결의 기준과 범위를 문서에 정확히 남긴다. '연동 완료'라고 쓰지 않는다 (서버에 없는 영역은 목업).
- G-1 사전 체크: /dev 책 블록 6개를 filter: grayscale(1)로 확인한다.
- force push · reset --hard · 브랜치 삭제 금지. 커밋·푸시·main 합치기는 사람이 한다. .env · deploy 브랜치 · Vercel 설정은 건드리지 않는다.

명세가 불분명하거나 이 지시문에 없는 결정이 필요하면 임의로 정하지 말고 멈춘 뒤 질문할 것. 같은 오류가 2회 수정 후에도 남으면 멈추고 시도 내역과 원인 가설을 보고할 것.

[할 일]
1. 시연 점검 (docs/qa-checklist.md 방식): 시드 3개(empty · day9 · overdue) × 화면 16개 × 1280×800 · 1920×1080을 hybrid와 true 두 모드로. 가로 스크롤 · 콘솔 JS 오류 개수 기록
2. 측정 (결과를 docs/handover.md에 기록):
   git diff --stat c8e250d HEAD -- src/pages src/components
   git diff --stat c8e250d HEAD -- src/api src/hooks src/config src/mocks vite.config.js
   화면 코드가 바뀐 곳은 이유를 함께 적는다 (예: C19 헤더 null 처리 — 목업이 만들지 않던 빈 상태)
3. 문서
   - docs/handover.md '실제 서버로 바꿀 때': VITE_API_BASE_URL 단계를 빼고, API_PROXY_TARGET + VITE_USE_MOCK=hybrid|false 절차로 고침. 혼합 모드 규칙(22개 · UUID 규칙 · 데모 동기화)과 교차 이동 점검표 요약
   - docs/policy-and-backend.md '백엔드·AI 확정 필요' 표: 서버로 연결된 항목 상태 갱신, 남은 요청(배포 커밋 · 시드 값표 · 42분 집중 세션 · quote · 30초 넘는 작업) 정리
   - CLAUDE.md '작업 전에 읽을 것' 표에 docs/api-draft.md 한 줄 추가 (API 기준 문서)
4. npm run check

[완료 기준]
- 두 모드 모두 가로 스크롤 0 · 콘솔 JS 오류 0 (아니면 목록)
- 측정 결과와 문서 수정 보고. 커밋 메시지 제안 (예: docs: 실서버 혼합 모드 연결 기록 · 측정)
```

---

## 팀에 보낼 짧은 알림 (복사해서 쓰세요)

**백엔드**

> 오늘 밤부터 프론트를 배포 서버(2026-line1.leehyowon14.dev)에 연결해요.
>
> - 기준은 지금 서버에 있는 0.1.0이에요 (프론트 초안 그대로). 22개 경로는 서버로, 아직 없는 화면은 목업으로 돌리는 혼합 방식이에요.
> - 1.0 문서(PR #3)는 서버에 구현된 영역부터 하나씩 맞출게요. 이번엔 C19(빈 상태 firstExam null)만 반영해요. 나머지는 검토해서 따로 회신할게요.
> - 11/14 제출 · 영상은 목업 버전 그대로 가요.
> - 부탁 3가지: ① 지금 배포된 커밋이 어느 브랜치인지 ② 시드에 '42분 진행된 집중 세션' 넣기(11/12에 정한 시연 장면) ③ 시드 값표

**AI (현민님)**

> 11/13 명세 잘 받았어요! 채점 결과 · 학습 지표 예시가 채워져서 확인이 쉬워졌어요.
>
> - 프론트는 백엔드를 거쳐 받기 때문에 따로 바꿀 건 없어요.
> - 여유 있을 때만: 근거 문장(quote)을 줄 수 있는지, 스캔본(OCR) 결과를 어떻게 알려 줄지, 30초를 넘길 수 있는 작업이 있는지 알려 주세요.
> - 명세 문서 맨 위에 실제 API 키가 적혀 있어요. 공유 범위를 확인해 주세요.
