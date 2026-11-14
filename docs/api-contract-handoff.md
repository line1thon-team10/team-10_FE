# FE 연동 기준과 변경 위치 — 2026-11-14

이 문서는 FE-01 전달 자료다. 현재 FE 코드를 새 계약에 연결했다는 뜻이 아니다. API 구현 여부와 운영 배포 여부를 별도로 확인한 뒤 후속 FE task에서 연결한다.

## 기준 확인 기록

사용자는 FE 초안을 기본으로 사용하되, 요구사항·와이어프레임과 충돌하면 BE 계약을 적용하고 BE에도 오류가 있으면 계약을 보완하도록 지시했다. 각 충돌과 수정 이유를 PR에 남기는 기준도 함께 확정했다. 이것이 G-2에서 요구하는 API 기준 확인의 근거다. FE 담당자가 별도로 리뷰하거나 승인했다고 기록하지 않는다.

| 대상                        | 고정 기준                                                                                                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FE 원격 main/dev            | `c8e250d9484a03eac005e12c24d1b703fc105626` — 작업 전 둘 다 같은 SHA임을 확인                                                                                                                                                  |
| BE 로컬 통합·응답 확인 기준 | `9d1ddd7a40e37f74823950038581b18e1134fc58` — O-02·D-01 통합 포함                                                                                                                                                              |
| AI submodule                | `6d74ffb6c455a306e912252013d76f93e30a6210`                                                                                                                                                                                    |
| 계약 원문                   | [BE docs/api](https://github.com/line1thon-team10/team-10_BE/tree/integration/contract-v1/docs/api), [충돌 C01~C22](https://github.com/line1thon-team10/team-10_BE/blob/integration/contract-v1/docs/api/frontend-handoff.md) |
| 구현·연동 task              | [BE task registry](https://github.com/line1thon-team10/team-10_BE/blob/integration/contract-v1/docs/development-tasks.json)                                                                                                   |
| 별도 중간 배포 대상         | 앱 `4c20454fef5382e7e97232f93e02e1637a235583` / DB `0006_quiz_answer_storage`. 위 통합 SHA와 다름                                                                                                                             |

기존 `docs/api-draft.md`는 FE 초안이고 BE `schema/openapi-0.7.0.json`은 과거 비교 자료다. 이 두 파일만으로 새 client를 생성하지 않는다. 현재 계약은 BE의 도메인 Markdown과 decisions/common이 기준이며 원문이 빠뜨린 계산 정책은 BE 결정으로 구분한다.

공통 주소 `/api`, 응답 `{success,data,error}`, 헤더 `X-Anonymous-Id`, FE 제한30초를 유지한다. PDF만 작업 상태를 폴링한다. 요청 실패는 한국어 `error.message`로 안내하고, 저장된 입력을 보존한다. 모든 수정은 화면 → hooks → api → adapters 흐름 안에서 수행하며 서버의 집계·실행 가능 여부를 화면에서 다시 계산하지 않는다.

## 현재 연결 가능 범위와 후속 범위

| 기능 묶음 | 통합 코드에서 확인한 범위                                                          | 아직 후속 구현·연동이 필요한 범위                                                      |
| --------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 기록·집중 | 실제 UUID, 복합 ranges/pages, 전체 교체 정정, 세션 종료 후 기록 연결               | 기록 재시도 영수증 R-04, 하루 분모 D-02, 마감/퀴즈 열림 알림 D-03, 회독·밀림·속도 보정 |
| 진도      | 홈은 배치별 보충 포함, 과목 진도는 새 범위, 퀴즈 열림은 출제 가능한 범위의 원 비율 | FE-02/03 화면·목업 연결, 실제 문제 구성 Q-07                                           |
| 퀴즈      | 세트 quizId와 항목 ID, 풀이 중 정답/근거 비공개, 답안·job·봉인 저장소, 숙달도 계산 | Q-03 저장 API와 savedAnswers 복구, Q-04 worker, Q-05/06 제출·결과 연결, 더 풀기·복습   |
| 온보딩    | confirmedFields 조회, draft 일정 CRUD, 일정 합집합으로 가용 시간 계산              | 자연어 입력 O-03, 자료 업로드·분석 M, 첫 계획 P-02/03                                  |
| 계획 변경 | 미리보기 저장소 SYS-04, 순수 배분 엔진 P-01                                        | 공통 승인 SYS-05와 각 관리/일정/재분배 endpoint                                        |
| AI        | 실행 예산·저장 결과 재사용 공통 경계                                               | 각 도메인 연결, 실제 키를 사용한 품질 검증 AI-02                                       |

통합되어도 운영 배포 전이면 해당 API를 운영 FE에서 켜지 않는다. 배포 대상4c20454에는 O-02·D-01·SYS-04가 들어 있지 않다. 공개 URL이 열리는 것만으로 전체76개 계약이 구현됐다고 판단하지 않는다. 배포 완료 근거는 [고정 manifest](https://github.com/line1thon-team10/team-10_BE/blob/infra/deploy-checkpoint-01/docs/releases/2026-11-14-checkpoint-01.md)와 실제 실행 결과를 함께 본다.

`VITE_USE_MOCK` 기본값은 현재 true다. 후속 FE-08에서 API 프록시·실제 배포를 확인한 후 명시적으로 끈다. 이번 문서 작업은 이 값을 바꾸지 않는다.

## C01~C22 수정 위치와 담당 task

아래 ID는 BE 충돌표의 ID다. 기존 FE가 맞았는데 BE가 축소한 경우도 구분했다. 파일 경로는 현재 FE 기준이며 같은 파일을 동시에 수정하는 task는 순서대로 배정한다.

| ID  | 보정 이유와 반영 내용                                                            | FE 수정 위치                                                                        | 후속 FE / BE           |
| --- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| C01 | FE 다중 PDF를 유지하고 BE의1개 제한 철회. materialId/unitId를 요청까지 보존      | `api/plan.js`, `adapters/plan.js`, `S3Upload`, `S4Units`, `S8_2Result`, `S10Review` | FE-03/04, M/Q/V        |
| C02 | 문자열 개념을 id/title/from/to/inExam 객체로 변경; 제외·구조 변경 이력 보존      | `adapters/plan.js`, `S4Units`                                                       | FE-04/05, M-04/05      |
| C03 | `to-from+1` 재계산을 없애고 서버 pages/ranges 및 completedRanges 사용            | `adapters/today.js`, `adapters/study.js`, `S7Record`, `S12Study`                    | FE-02, R-02/03/04      |
| C04 | 마지막 bulk 제출만 하던 흐름에 문항 저장·복구 추가; 채점 상태는 풀이 화면 비공개 | `api/quiz.js`, `adapters/quiz.js`, `useQuiz.js`, `S8Quiz`                           | FE-03, Q-03~06         |
| C05 | unitNo 요청을 unitId로 교체, 2회독부터 난이도 선택                               | `api/quiz.js`, `S8Quiz`, `S8_2Result`                                               | FE-03, Q-07/08         |
| C06 | 풀이 중 page 제거, 결과에만 실제 evidence/rects·페이지 fallback 표시             | `adapters/quiz.js`, `S8Quiz`, `S8_2Result`                                          | FE-03, Q-06            |
| C07 | 맞춤 범위는 scopes의 단원 UUID·구간·개념 ID로 전달                               | `api/review.js`, `adapters/review.js`, `S10Review`                                  | FE-03, V-02~04         |
| C08 | 마지막 후보 암묵 승인 제거; previewId/requestId 보존. BE30분 만료 철회           | `adapters/plan.js`, `today.js`, `manage.js`, `schedule.js`와 각 비교 화면           | FE-04/05/06, SYS-05    |
| C09 | 일정 수정·삭제도 once/future 원 회차·revision으로 비교 후 승인                   | `api/schedule.js`, `adapters/schedule.js`, `CalendarTab`                            | FE-06, C-01~04         |
| C10 | 신규 과목 미지원이라는 BE 초안 철회; draft부터 승인까지 연결                     | `api/manage.js`, `useManage.js`, `S14Manage`, setup 화면                            | FE-05, U-01/02, P-02   |
| C11 | BE의 항상501 정의 철회; rebuild 후보→비교→승인                                   | `api/manage.js`, `S14Manage`, `S5_2Compare`                                         | FE-05, U-06            |
| C12 | 일일 시간/총 페이지 목표 중 하나를 받도록 보완                                   | `api/manage.js`, `adapters/manage.js`, 계획 추가 모달                               | FE-05, U-04            |
| C13 | more30을 고정30분으로 표시하지 않고 실제 이동 태스크·시간 사용                   | `adapters/manage.js`, `S14Manage`                                                   | FE-05, U-05            |
| C14 | OCR와 quizless 분리; BE의 잔여15분 미만 예외 철회                                | `adapters/plan.js`, `S3Upload`, `S5Review`                                          | FE-04, M-02/P-02       |
| C15 | 밀림·하루 마감 조건을 서버가 판정; P2 옵션 enabled 유지                          | `adapters/today.js`, `S6Home`, `P1BookBox`, `P2Plans`                               | FE-02/05, D-03/L-01~03 |
| C16 | custom 점수 반영, 재학습만으로+15 금지, 회복 조건 서버 반영                      | `adapters/review.js`, `S10Review`, `P3BookColor`                                    | FE-03, S-03/V-03/04    |
| C17 | 문항 수·주말/이월 구성 고정값 제거, 더 풀기는 정확히5개                          | `S8Quiz`, `S8_2Result`, `mocks/handlers/quiz.js`                                    | FE-03/09, Q-07~09      |
| C18 | 홈 달성률·과목 진도·퀴즈 가능 진행률을 구분                                      | `S6Home`의 `QuizGuideBox`, `adapters/quiz.js`, `S8Quiz`, 월간 화면                  | FE-02/03/06, D-01/H    |
| C19 | null과 미확인 분리; confirmedFields/done, firstExam=null 처리                    | `adapters/onboarding.js`, `adapters/demo.js`, `S1Schedule`, 공통 헤더               | FE-04/09, O-01         |
| C20 | before/after는 배열 아닌 정수 분                                                 | `adapters/plan.js`, `S5_2Compare`                                                   | FE-04, P-03            |
| C21 | 출처 없는 제한 대신 BE 운영 정책 적용; 오류 시 답안 유지                         | `useAiWait.js`, API 오류 처리, `S3Upload`, `S8Quiz`                                 | FE-03/04, POL-02/Q/M   |
| C22 | calibrationId 보존, P2 뒤 P4, 시험 다음 날 보관                                  | `adapters/today.js`, `api/today.js`, `P4Pace`, `S14Manage`                          | FE-05, L-04/U-03       |

경로 표의 `api/`와 `adapters/`는 각각 `src/api/`와 `src/api/adapters/`, 화면 이름은 `src/pages/` 아래 실제 파일을 가리킨다. UI 이름이나 단원 번호를 API 식별자로 바꾸지 않는다.

## 구현 시 반드시 제거할 현재 가정

- `adapters/today.js::toTask`의 `raw.to - raw.from + 1`은 복합 범위의 null에서 잘못된1쪽을 만든다. 서버 pages/donePages/ranges를 그대로 사용한다.
- `S7Record`의 기본 `sessionId:null`은 BE에서422다. 연결할 종료 세션이 없으면 필드 자체를 생략하고, 있으면 종료 응답의 UUID를 전달한다. 미사용 `toPage`/`completedRanges`도 null 대신 생략한다. 수동 기록과 집중 종료 후 기록을 각각 검증한다.
- `S3_2Toc.jsx`의 기본 subject=`net`, `S8_2Result.jsx`의 기본 subject=`ds`, 더 풀기·재학습의 unitNo, `S9Books.jsx`의 unitNo+배열 index 선택값은 실제 UUID로 바꾼다. 과목이 없으면 선택/자료 목록으로 안내하고 고정 코드로 요청하지 않는다. 같은 번호의 단원이 다른 PDF에 있을 수 있다.
- `S6Home.jsx::QuizGuideBox`는 홈 진행률과 퀴즈 remainPages를 한 문장에 섞고 있다. 홈 진행률은 보충을 배치별로 합산하지만 퀴즈는 출제 가능한 범위의 자료별 합집합이다. 안내에는 서버 open/openSubjects/remainPages를 사용하고, 홈 rate로 퀴즈 열림을 추정하지 않는다. 표시70%여도 원 비율69.99%면 잠길 수 있다.
- `toQuizSet`이 quizId/savedAnswers를 버리고 page를 받는 현재 구조를 수정한다. [다음] 저장 실패 시 해당 입력을 지우거나 다음 문항으로 이동하지 않는다. 반환 revision을 사용하고409 ANSWER_CONFLICT는 최신 저장 답안을 다시 확인한다.
- `toOnboarding`은 confirmedFields를 보존해야 한다. `goalEtc:null`이면서 confirmedFields.goalEtc=true인 ‘없음 확인’을 미응답으로 바꾸지 않는다. `toDemoState`는 firstExam=null에서 속성을 읽지 않는다.
- 변경안이 stale이면 새 비교 화면으로 돌아간다. 과거 적용 이력에 원 응답이 없는 경우에도409 PREVIEW_STALE이며 같은 변경을 자동 재실행하지 않는다.

## 확정된 시연·운영 정책

시드는 AI 데모 패키지의 인공지능·데이터베이스·운영체제를 사용한다. 각 PDF30쪽, 범위3~29쪽, 단원은3~11/12~20/21~29쪽이다. 시험일은 각각11/12·11/16·11/18이며 [BE 시드 값표](https://github.com/line1thon-team10/team-10_BE/blob/integration/contract-v1/docs/demo-seed-handoff.md)를 따른다. 새 UUID는 응답에서 얻고 예제 값을 요청 ID로 고정하지 않는다.

day9는18/27쪽(rate67), AI2 집중42분 진행 중이다. [종료] 뒤 종료 sessionId로 p.13까지 기록하면20/27쪽(rate74)이다. 42분은 시드 생성 시점의 초기 경과 시간이며 계속 흐른다. 기존 DS/OS/NW, 88%, 7/13/5문항, 38쪽 밀림을 이름만 바꿔 재사용하지 않는다. 단원 첫 점수90/40/80과 과목별 준비도는 다른 값이고, 준비도는 API에서 다시 받는다.

운영 정책 POL-02는 PDF25MiB(26,214,400바이트), 대화형 AI20초(외부 한도25초 이내), PDF 작업300초, JSON 문법 오류1회 재시도로 확정했다. 정책 확정과 각 endpoint의 실제 강제 여부를 구분한다. 업로드·AI 품질 관련 후속 task가 끝나기 전에 기능을 켰다고 표시하지 않는다. 키 없이 저장 시연을 지원하는 현재 배포 결정은 실제 AI/OCR 품질 검증 완료를 뜻하지 않는다.

## 후속 작업의 완료 조건

[로컬 HTTP fixture](api-fixtures/README.md)에 빈 계정·day9 집중/기록·복합 범위·풀이 전 퀴즈·온보딩 일정의 응답을 저장했다. 각 JSON에는 실제 캡처한 BE SHA와 준비 방법, 후속 계약의 한계를 기록한다. 예제 UUID를 실제 요청 ID로 사용하지 않는다.

API 층을 크게 수정하기 전 기존 c8e250d 보관 브랜치를 만들고, 영역별 task 브랜치에서 원자 커밋한다. 사용자에게 이미 받은 개발·PR 권한을 기존 문서의 별도 확인 문구로 다시 요청하지 않는다. 실제 FE 담당자의 검토 여부는 별도로 기록한다.

각 연결 PR에는 해당 C-ID, 기존 FE/BE 중 무엇이 틀렸는지, 적용한 계약, 정상·빈 상태·잘못된 ID·중복 요청·네트워크 재시도 결과를 적는다. 새 API가 없는 상태에서 임의 성공 목업을 운영 결과로 보이지 않는다. FE 코드 변경은 `npm run check`와 실제 브라우저 흐름을 확인하며 G-1의 흑백 상태 구분을 유지한다. 이 문서 변경에는 화면 수정이 없다.
