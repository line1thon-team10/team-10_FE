import { Loader2 } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import { MockBadge } from '@/components/common/Badge.jsx';
import { ddayBetween, fmtFull } from '@/config/date.js';
import { ENV } from '@/config/env.js';
import { useDemoState, useNextDay } from '@/hooks/useDemo.js';
import AppFooter from './AppFooter.jsx';
import DemoMenu from './DemoMenu.jsx';
import Logo from './Logo.jsx';
import ModalHost from './ModalHost.jsx';
import PlanAddButton from './PlanAddButton.jsx';
import RootGate from './RootGate.jsx';

const TABS = [
  { to: ROUTES.home, label: '홈', end: true },
  { to: ROUTES.books, label: '책 쌓기' },
  { to: ROUTES.review, label: '복습·오답' },
  { to: ROUTES.calendar, label: '캘린더' },
];

// 다음 날로를 누르면 자정 판정이 끝날 때까지 화면을 덮어요 (디자인 DemoMenu '자정 판정 중')
function JudgingOverlay() {
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/60 px-4 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-line-2 bg-bg-2 px-5 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06]">
          <Loader2
            size={17}
            className="animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        </span>
        <div>
          <p className="text-[13px] font-semibold">자정 판정 중…</p>
          <p className="mt-0.5 text-[11px] text-fg-2">어제 계획과 오늘 할 일을 다시 계산해요</p>
        </div>
      </div>
    </div>
  );
}

function AppHeader() {
  const { data } = useDemoState();
  const nextDay = useNextDay();
  const navigate = useNavigate();
  // NF-08: 자정 판정을 바로 실행하고 다음 날 홈으로 가요. 이월·분배안은 홈이 서버 값을 보고 띄워요.
  const onNextDay = () =>
    nextDay.mutate(undefined, {
      onSuccess: (state) => {
        navigate(ROUTES.home);
        if (state.judgment === 'none') toast('어제 계획을 다 끝냈어요');
      },
      onError: (e) => toast.error(e.message),
    });
  const dday = data ? ddayBetween(data.today, data.firstExam.examDate) : null;
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-5 px-6">
        <Logo />
        <nav className="flex items-center gap-1" aria-label="주 메뉴">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-[13.5px] font-medium whitespace-nowrap transition-colors ${isActive ? 'bg-white/[0.07] text-fg' : 'text-fg-2 hover:bg-white/[0.06] hover:text-fg'}`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <span className="flex-1" />
        {data && (
          <span className="flex flex-col items-end leading-tight">
            {/* D-day는 항상 첫 시험 기준 */}
            <span className="num text-[12.5px] font-semibold whitespace-nowrap">
              첫 시험 {data.firstExam.name} <span className="text-brand-deep">D-{dday}</span>
            </span>
            <span className="text-[11px] whitespace-nowrap text-fg-2">{fmtFull(data.today)}</span>
          </span>
        )}
        {/* S14 과목·계획 관리 — 지시문 12 전까지 막아 둠 */}
        <button
          type="button"
          className="btn btn-sm"
          disabled
          title="과목·계획 관리는 준비 중이에요"
        >
          과목·계획 관리
        </button>
        {/* 목업 서버로 돌 때는 화면 전체가 목업 데이터라는 표시 */}
        {ENV.useMock && <MockBadge />}
        <DemoMenu />
        <button
          type="button"
          className="btn btn-sm border-dashed"
          onClick={onNextDay}
          disabled={nextDay.isPending}
          title="데모용: 자정 판정을 바로 실행해요 (NF-08)"
        >
          다음 날로 (데모)
        </button>
      </div>
      {nextDay.isPending && <JudgingOverlay />}
    </header>
  );
}

export default function MainLayout() {
  return (
    <RootGate>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-4 px-6 pt-6 pb-24">
          <Outlet />
        </main>
        <AppFooter />
        <PlanAddButton />
        <ModalHost />
      </div>
    </RootGate>
  );
}
