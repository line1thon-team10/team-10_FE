# AI 파트 명세 정리 (11/13판) — 11/12판과 대조

> 출처: 「AI API 명세서」(11/13 23:50, 8쪽), 「프론트엔드 요청사항 충족 여부」(11/13 23:48, 1쪽)
> 비교 대상: 「AI API 명세서」(11/12 15:05, 13쪽), 「프론트엔드 요청사항 충족 여부」(11/12)
> AI 저장소(team-10_AI)는 비공개라 이 작업 공간에서 열 수 없었어요. **문서만 비교**했습니다.
> ⚠ 두 판 모두 문서 맨 위에 실제 API 키 값(GROQ · UPSTAGE)이 적혀 있어요. 이 정리에는 옮기지 않았고, 저장소 · 노션에도 올리지 않아요. 시연 뒤 폐기합니다 (11/12 결정).

## 1. 한눈에

- **엔드포인트 9개 · 경로 · 요청 필드는 그대로**예요.
- **바뀐 것:** 응답 예시가 실제 값으로 채워졌어요.
  - 채점 결과(`results[]`)
  - 학습 지표 5개 묶음: `readiness`가 객체에서 배열로 바뀜, `unit_history` · `concept_errors` 추가
  - `done_pages` 키 = 과목 ID
  - `learning_data`에 `subjects` · `units` · `concepts` 추가
  - 예시 과목이 인공지능(AI)으로 바뀜
- **빠진 설명:** 11/12판에 있던 25MB 제한 · 413/422 오류, `AI_PDF_ROOT`, `count` 1~10, '문제은행 정답을 프론트에 그대로 주지 말 것', 문제 ID가 없으면 422 같은 내용이 11/13판에는 없어요. 전체 스키마는 AI 서버 `/openapi.json`이 기준이라고만 적혀 있어요.
- **충족표:** 11/12판과 글자까지 같아요 (다시 보낸 것).
- **프론트 영향:** 직접 영향은 없어요. 프론트는 AI를 직접 부르지 않고 백엔드를 거쳐 받아요. 백엔드를 거쳐 오는 값 중 확인할 것 3개는 지시문 3 · 5에 넣었어요.

## 2. 엔드포인트 (11/13판)

| Method | Path                         | 요청 핵심                                                                                                            | 응답 핵심                                                                                                                           | 11/12 대비                   |
| ------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| GET    | `/health`                    | —                                                                                                                    | `{ status: "ok" }`                                                                                                                  | 같음                         |
| POST   | `/ai/analyze`                | multipart `file`, `subject`                                                                                          | `analysis.units[]` { `id`, `name`, `page_start`, `page_end`, `concepts` }                                                           | 같음 (예시 단원 이름만 바뀜) |
| POST   | `/ai/quiz/generate`          | `pdf_path`, `analysis`, `subject`                                                                                    | `units[]` { `unit_id`, `status`, `questions` }                                                                                      | 같음                         |
| POST   | `/ai/quiz/select`            | `bank`, `unit_id`, `count`, `excluded_ids`, `allowed_pages`                                                          | `questions`, `total_questions`                                                                                                      | 같음                         |
| POST   | `/ai/quiz/grade`             | `quiz`(채점용, `total_questions` 추가) · `submission.answers[]` { `question_id`, `answer`, `confidence` }            | `total_questions`, **`results[]` { `question_id`, `is_correct`, `correct_answer`, `explanation`, `got_points`, `missing_points` }** | 응답 세부 필드가 새로 보임   |
| POST   | `/ai/quiz/grade-and-metrics` | `quiz`, `submission`, **`learning_data` { `subjects`, `units`, `concepts`, `questions`, `attempts` }**, `done_pages` | `grading`, `attempts`, **`metrics` { `unit_history`, `units`, `readiness`, `concept_errors`, `weak_concepts` }**                    | 입력 · 출력 칸이 늘어남      |
| POST   | `/ai/learning/metrics`       | `data` { 위와 같은 5개 }, `done_pages` { 과목 ID: 페이지 }                                                           | 아래 3번 표                                                                                                                         | 응답 구조가 바뀜             |
| POST   | `/ai/tutor/ask`              | `question`, `history`, `document_pages[]` { `page`, `text` }                                                         | `answer`, `pages[]`                                                                                                                 | 같음                         |
| POST   | `/ai/tutor/simplify`         | `question`, `answer`, `pages`, `document_pages`                                                                      | `answer`, `pages[]`                                                                                                                 | 같음 (실제 출력 예시 추가)   |

## 3. 바뀐 점 상세 (11/12 → 11/13)

| 항목                     | 11/12판                                                 | 11/13판                                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 채점 응답                | `{ total_questions }`만 표시                            | `results[]`에 정답 여부 · 정답 · 해설 · 맞힌 요소 · 빠진 요소                                                                                                                                                  |
| 문제 ID 예시             | `Q1`                                                    | `AI1-Q01`                                                                                                                                                                                                      |
| `done_pages`             | 예시 `{ DS, OS, NW }`, 설명은 '단원별 학습 완료 페이지' | 예시 `{ AI: 9 }`, **'과목 ID를 키로 사용'**                                                                                                                                                                    |
| 학습 지표 `readiness`    | 객체 `{}`                                               | **배열** [{ `subject`, `subject_name`, `progress_percent`, `mastery_percent`, `readiness_percent`, `target_percent`, `gap_percent` }]                                                                          |
| 학습 지표 `units`        | `[]`                                                    | [{ `unit`, `unit_name`, `score`, `grade`(한글: 흔들림 등), `recovery_mode` }]                                                                                                                                  |
| 학습 지표 추가           | —                                                       | `unit_history`(이전 점수 → 새 점수), `concept_errors`(개념별 틀린 횟수 · 취약 여부)                                                                                                                            |
| `learning_data` / `data` | `questions`, `attempts`                                 | `subjects`, `units`, `concepts`, `questions`, `attempts`                                                                                                                                                       |
| 연동 시 확인 사항        | 문서 곳곳에 흩어져 있음                                 | 6줄로 모음: analyze 결과 → generate, 문제은행 전체 → select, 채점은 정답 · 근거가 든 비공개 문제 필요, `learning_data`와 `data` 이름 차이, `done_pages` 키 = 과목 ID, `pdf_path`는 AI 서버에서 열 수 있는 경로 |
| 테스트 현황              | 엔드포인트마다 '검증 결과'                              | 표 하나: 9개 모두 통과                                                                                                                                                                                         |

## 4. 우리 11/12 요청(전달 사항 2장) 대비

| 요청                                | 11/13 상태                                                                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 서술형 점수 · 맞힌 요소 · 빠진 요소 | **일부.** `got_points` · `missing_points`는 채점 응답에 보임. 서술형 점수 필드는 예시에 없음 (백엔드는 AI 서술형 채점 모듈에서 `score`를 받아 씀, 백엔드 코드에서 확인) |
| 문제별 근거 문장(quote)             | **아직.** 근거 페이지만 있음. 백엔드 시드 문항도 `quote: null`로 옴 (로컬에서 확인)                                                                                     |
| 유형 · 난이도 · 보기 ID             | **일부.** 객관식(4지선다) · 단답형 · 서술형. OX · 난이도 · 보기 ID는 언급 없음                                                                                          |
| 단원마다 '하' 5문제 이상            | **답 옴.** "단원별 문제은행에서 5문제 선택 가능", 생성은 단원당 10문제(11/12판 테스트). '하' 난이도인지는 언급 없음                                                     |
| 스캔본: OCR 성공인지 422 실패인지   | **아직.** 11/13판에 없음 (11/12판엔 'PDF 품질 검증 실패 422'가 있었음)                                                                                                  |
| 단원 수 · 소요 시간                 | **아직.** 30초 안에 끝나는지 언급 없음                                                                                                                                  |
| 올린 PDF 전달(`pdf_path`)           | 그대로. AI 서버 경로여야 함 → 백엔드 몫                                                                                                                                 |
| 일정 대화 엔드포인트                | **아직.** 충족표에는 '일정 대화' 3항목이 있는데, 9개 목록에는 없음                                                                                                      |
| 학습 지표 계산 담당                 | 정리됨. 백엔드 서버가 AI `learning_metrics` 모듈을 직접 불러 단원 점수를 계산 (백엔드 코드에서 확인)                                                                    |
| 단원 필드 이름 통일                 | **아직.** analyze `id`·`name`·`page_start` / generate·select `unit_id` / metrics `unit`·`unit_name` → 백엔드가 바꿔 줌                                                  |
| 오류 `{ code, message }`            | **아직.** 언급 없음                                                                                                                                                     |
| `done_pages` 예시를 데모 과목으로   | **답 옴.** `{ AI: 9 }`                                                                                                                                                  |
| 실제 응답 전체 예시                 | **일부.** 채점 · 학습 지표 · 쉬운 설명은 실제 값                                                                                                                        |
| 튜터 쉬운 설명                      | **답 옴.** `/ai/tutor/simplify`. 다만 백엔드 서버에 `/api/tutor`가 아직 없음                                                                                            |

## 5. 프론트 개발에 반영할 것

1. **퀴즈 근거 (지시문 3)** — `quote`가 오지 않아 근거 보기는 페이지만으로 보여 줘요. `PdfPageDialog`는 quote가 없으면 하이라이트를 안 해서 이미 그렇게 동작해요. 혼합 모드에서는 원본 PDF가 서버에 없어서, 오류 없이 '원본 PDF가 아직 없어요' 안내가 뜨는지만 확인해요.
2. **튜터 (지시문 5)** — AI에는 ask · simplify가 다 있지만 서버 경로가 없어 목업을 유지해요. 화면은 바꾸지 않아요.
3. **등급 · 준비도 (지시문 3)** — AI 등급은 한글이고 readiness는 배열이지만, 백엔드가 `risk/shaky/stable/perfect`와 `progressRate/mastery/readiness`로 바꿔서 줘요 (서버 응답에서 확인). 프론트는 바꿀 것이 없고, `perfect`가 책 쌓기에 제대로 보이는지만 확인해요.
4. **S1 일정 대화 · S3 PDF 분석** — 서버 경로가 없어 목업을 유지해요.

## 6. AI · 백엔드에 다시 확인할 것 (11/12 요청 그대로 유효)

- 근거 문장(quote)을 줄 수 있는지. 못 주면 페이지만으로 시연해요.
- 스캔본 결과(OCR 성공 / 분석 실패)를 어떻게 표시할지. 시연 대본에서 정해야 해요 (기획).
- 30초를 넘길 수 있는 작업: 계획 생성 · 채점 · 튜터 · 분배안.
