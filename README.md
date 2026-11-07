# 피뢰침 (1호선톤 10팀) — 프론트엔드

강의자료 PDF와 일정을 넣으면 AI가 시험 계획을 짜고, 매일 복습 퀴즈를 내고, 밀리면 남은 일정을 다시 짜주는 웹 서비스예요.

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
