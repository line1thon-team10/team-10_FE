# 로컬 HTTP 응답 fixture

BE 통합 SHA는 각 JSON의 `backendSha`에 고정한다. 전부 임시 SQLite와 새 익명 사용자로 캡처했으며 운영 데이터를 읽거나 변경하지 않았다. `productionVerified:false`는 배포 확인 자료가 아니라는 뜻이다. 원래 FE 목업을 이 값으로 바꾼 것도 아니다.

| 파일                       | 확인할 경계                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| `session-empty.json`       | firstExam=null, 빈 과목 done=false, 활성 집중 null, today404 NO_PLAN       |
| `study-day9.json`          | 새 시드18/27쪽→집중 종료→p.13 기록→20/27쪽, 종료 sessionId 전달            |
| `study-compound.json`      | 두 PDF에 같은 표시 단원 번호, 최상위 from/to/unitNo=null, 서버14쪽·완료2쪽 |
| `quiz-unanswered.json`     | quizId·세트 항목 ID, 풀이 중 정답/근거/점수 비공개                         |
| `onboarding-calendar.json` | empty 주간 일정, 월·수2시간 일정의 고유240분, CRUD addedId=null            |

`study-compound`만 테스트 준비 단계에서 DB에 두 번째 자료·단원을 추가했고 그 사실을 JSON notes에 기록했다. 이후 응답은 실제 HTTP GET이다. UUID와 시각은 예제이며 실제 요청에는 현재 세션에서 반환한 ID를 쓴다. 익명 인증 ID와 API 키는 저장하지 않는다.

실제 응답은 **관측된 동작**이다. 아직 미완성인 D-03 알림, Q-03 savedAnswers/저장 API, Q-05 제출 계약까지 이 파일로 통과 처리하지 않는다. 후속 연결 task는 계약이 구현된 새 SHA에서 fixture를 갱신하고 해당 정상·실패·재시도 검사를 추가한다. `savedAnswers`가 없는 현재 예제를 최종 계약의 생략 허용으로 해석하지 않는다.

다시 만들려면 깨끗한 BE checkout과 해당 `.venv`를 사용한다. 예를 들어 작업공간 루트에서:

```sh
BE/.venv/bin/python FE-task-handoff/docs/api-fixtures/capture_be.py \
  --backend BE-integration --output FE-task-handoff/docs/api-fixtures
```

스크립트는 환경의 DB 연결을 사용하지 않고 `TemporaryDirectory` 안에 새 SQLite를 생성한다. `GROQ_API_KEY`와 `UPSTAGE_API_KEY`는 해당 프로세스에서 빈 값으로 고정한다. 공개 HTTP 서버를 호출하지 않고 FastAPI TestClient로 읽고 쓴다. AI submodule은 BE의 고정 버전으로 준비돼 있어야 한다. 파일을 생성한 후 FE의 Prettier와 JSON 구조 검사를 실행한다.
