# 피뢰침 (1호선톤 10팀) — 프론트엔드

강의자료 PDF와 일정을 넣으면 AI가 시험 계획을 짜고, 매일 복습 퀴즈를 내고, 밀리면 남은 일정을 다시 짜주는 웹 서비스예요.

## 11월 7일(토) 작업분 전달 사항

지금 프론트는 가짜 서버(목업)로 모든 화면이 돌아가요. 아래 내용을 명세로 주시면 그 부분만 바꿔 끼우면 돼요. 명세는 "주소 + 보내는 값 + 받는 값 JSON 예시" 정도만 있어도 충분해요.

프론트가 임시로 정해 둔 주소는 src/api/endpoints.js, 응답 모양은 src/mocks/data/seed.js에 모여 있어요. 그대로 쓰셔도 되고, 편하게 바꿔서 주셔도 괜찮아요. 명세가 오면 src/api/endpoints.js · src/api/adapters/ · src/mocks/만 고치고 화면 코드는 건드리지 않아요.


## 개발 현황 (11/9 작업분까지)

dev에서 작업하고, 확인된 것만 main에 합쳐요. 11/9 작업분까지 dev · main 둘 다 반영돼 있어요.

커밋	내용
ba6a468	프론트 골격: 화면 주소 · 자리 화면 · 디자인 토큰 · 공통 부품 · 목업 구조 · 문서
94e42c4	온보딩 S1~S5 · S3-2, 홈 S6, 공부 기록 S7
feb8c84	퀴즈 S8 · S8-2, 책 쌓기 S9, 다음 날로 판정 · 분배안
완료
온보딩 S1~S5: 일정 대화 · 주간 캘린더 · PDF 업로드/목차 직접 입력(S3-2) · 단원 확인 · 계획 승인
홈 S6 · 공부 기록 S7 · 책 박스 P1 · 가벼운 알림 P1-1 · 이월 안내 S6-2 · 분배안 P2 + '다음 날로' 데모 버튼
퀴즈 S8 · 결과 S8-2 · 책 쌓기 S9 (과목별 책장, 단원별 가로 책 더미)
시연 장면(시드) 3개: 빈 계정 / 11/9 오후 5시 / 밀림
모두 목업으로 동작해요
진행 중
11/9 작업분: dev · main 반영 완료, 브라우저로 시연 흐름 확인 중
백엔드 · AI 명세 대기: 받는 대로 바로 바꿔 끼울 수 있게 API 주소와 응답 모양을 한 곳에 모아 둠
기획 확인 대기: 회복 박스 문구, 운영체제 · 네트워크 퀴즈 문항, S5 분량 −/+ 버튼 의미
다음 할 일
11/10: S10 복습 · 오답 노트, 캘린더 탭
로딩 · 실패 · 빈 화면 공통 처리 + Should 화면 (S6-3 AI 튜터 답변, S6-4 일정 추가 재조정, S5-1 · S5-2 다시 나누기)
명세가 나오면 목업을 끄고 실제 API로 연결한 뒤, 시연을 처음부터 끝까지 확인
화면별 상태

화면 ID는 요구사항 정의서를 따라요. 자세한 내용은 docs/screen-ids.md에 있어요.

ID	화면	주소	우선순위	상태
S1	일정·목표 대화	/setup/schedule	Must	완료
S2	캘린더 확인	/setup/calendar	Must	완료
S3	PDF 업로드	/setup/upload	Must	완료
S3-2	목차 직접 입력	/setup/upload/toc	Must	완료
S4	단원 확인	/setup/units	Must	완료
S5	내용·분량 확인	/setup/review	Must	완료 (분량 −/+ 버튼은 기획 확인 대기)
S5-1	다시 나누기 요청	/setup/review/resplit	Should	자리 화면 → 11/10
S5-2	다시 나누기 비교	/setup/review/compare	Should	자리 화면 → 11/10
S6	홈	/	Must	완료
S6-2	조금 밀린 날 홈	/ (상태)	Must	완료
S6-3	AI 튜터 답변	/ (상태)	Should	튜터 버튼만 있음 → 11/10
S6-4	일정 추가 재조정	팝업	Should	자리 화면 → 11/10
S7	공부 기록	팝업	Must	완료
P1	책 박스	팝업	Must	완료
P1-1	가벼운 알림	알림	Must	완료
S8	오늘의 퀴즈	/quiz	Must	완료 (운영체제 · 네트워크 문항은 준비 중)
S8-2	퀴즈 결과	/quiz/result	Must	완료
S9	책 쌓기	/books	Must	완료
S10	복습·오답	/review	Must	자리 화면 → 11/10
P2	분배안	팝업	Must	완료
CAL	캘린더 탭	/calendar	Should	자리 화면 → 11/10
데모로 둘러보기

아래 실행 방법대로 켠 뒤 http://localhost:5173 에서 바로 볼 수 있어요. 헤더의 MOCK 배지는 가짜 서버로 돌고 있다는 표시예요.

데모 ▾ 메뉴 (헤더): 시연 장면(시드)을 불러와요.
빈 계정 · 계획 만들기 (11/3) → 온보딩 S1부터 시작
11/9 오후 5시 (기본) → 홈에서 시작
밀림 시나리오 (11/9, 1·4번 못 함) → 홈에서 시작, '다음 날로'를 누르면 분배안(P2)
다음 날로 (데모용) (헤더): 자정 판정을 바로 실행해요. 밀린 분량이 기준 미만이면 이월 안내(S6-2), 기준 이상이면 분배안(P2)이 떠요.
/dev: 전체 화면 목록, 팝업 바로 열기, 다음 날로, 시드 초기화, 공통 부품 미리보기
목업 데이터는 브라우저 메모리에만 있어서 새로고침하면 처음 상태로 돌아가요.


## 실행 방법 (Windows PowerShell)

Node.js 20.19 이상 또는 22.12 이상이 필요해요.

```powershell
node -v                       # v22.x 권장 (.nvmrc)
Copy-Item .env.example .env   # 처음 한 번
npm install
npm run dev                   # http://localhost:5173
```

- 개발용 페이지: http://localhost:5173/dev (화면 목록, 시드 초기화, 다음 날로, 팝업 열기)
- 기본은 목업(MSW)으로 동작해요. 실제 서버에 붙일 때는 `.env`에서 `VITE_USE_MOCK=false`, `VITE_API_BASE_URL=서버 주소`로 바꿔요.

## 커밋 전 검사

```powershell
npm run check   # 린트 → 서식 → 빌드
npm run format  # 서식 자동 정리
```

## 기술

React 19 · Vite 7 · React Router 7 · Tailwind CSS 4 · TanStack Query 5 · axios · Zustand 5 · FullCalendar 6 · Motion 12 · react-pdf · MSW 2 · dayjs · sonner · Pretendard

## 문서

작업 규칙은 `CLAUDE.md`, 구조·화면·결정 사항은 `docs/`에 있어요.
