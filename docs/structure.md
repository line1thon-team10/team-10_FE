# 폴더 구조

프론트는 신민종 혼자 커밋해요 (개발은 Claude Code, 커밋·푸시는 신민종). `dev`에서 개발하고 확인된 것만 `main`에 합쳐요. 다른 사람이 커밋하게 되면 폴더별 담당을 이 문서에 추가해요.

```
team-10_FE/
├─ CLAUDE.md               작업 규칙 (Claude Code가 자동으로 읽음)
├─ docs/                   인수인계·결정·화면·게이트 문서
├─ public/
│  └─ mockServiceWorker.js MSW가 만든 파일 (직접 고치지 않음)
└─ src/
   ├─ main.jsx             목업 켜기 → 앱 시작
   ├─ App.jsx              TanStack Query · 라우터 · 알림(sonner)
   ├─ app/
   │  ├─ screens.js        ★ 화면 목록·주소(ROUTES)의 기준
   │  └─ router.jsx        주소 → 화면 연결
   ├─ config/              한 곳에서만 정하는 값
   │  ├─ app.js            앱 이름, 정책 값(70%, 85점 …)
   │  ├─ labels.js         서버 값 → 화면 표시명
   │  ├─ date.js           날짜 형식, D-day 계산
   │  └─ env.js            환경변수
   ├─ styles/index.css     ★ 디자인 토큰, 책 블록 상태 6개
   ├─ api/
   │  ├─ client.js         axios 공통 함수 (기본 주소·헤더·에러)
   │  ├─ endpoints.js      API 경로 (임시)
   │  ├─ adapters/         서버 응답 → 화면 모양 (명세가 나오면 여기만 고침)
   │  └─ *.js              기능별 API 함수
   ├─ hooks/               화면이 쓰는 데이터 훅 (TanStack Query)
   ├─ stores/              화면 전용 전역 상태 (Zustand: 팝업 등)
   ├─ mocks/
   │  ├─ data/seed.js      데이터 세트 값 (mock)
   │  ├─ db.js             메모리 가짜 DB (시드 3개 · 초기화)
│  ├─ logic.js          서버 계산 흉내 (오늘 화면 · 다음 날로 판정 · 분배안 · 퀴즈 채점 · 책 쌓기)
   │  └─ handlers/         기능별 목업 응답
   ├─ components/
   │  ├─ common/           버튼·카드·칩·배지·AI 박스·진행 단계·팝업·탭·상태 화면
   │  ├─ book/             책 블록 (상태 6개)
   │  ├─ layout/           온보딩 틀 · 메인 틀(헤더·메뉴) · 팝업 자리
   │  └─ Placeholder.jsx   자리 화면
   └─ pages/               화면 (화면 ID별 파일)
      ├─ setup/            S1~S5-2
      ├─ home/             S6 (+ modals/: S7 · P1 · P2 · S6-4)
      ├─ quiz/             S8 · S8-2
      ├─ books/            S9
      ├─ review/           S10
      ├─ calendar/         캘린더 탭
      └─ dev/              /dev 개발용 페이지
```

★ = 여러 화면이 같이 쓰는 파일. 고칠 때 다른 화면도 확인해요.

## 데이터가 흐르는 순서

화면 → `hooks/` → `api/*.js` → `api/adapters/` → 실제 서버 또는 MSW(`mocks/handlers/`)

백엔드·AI 명세가 나오면 `api/endpoints.js`, `api/adapters/`, `mocks/`만 고치고 화면 코드는 그대로 둬요.
