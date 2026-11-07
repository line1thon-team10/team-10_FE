import { NavLink, Outlet, Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import { MockBadge } from '@/components/common/Badge.jsx';
import { APP_NAME } from '@/config/app.js';
import { ddayBetween, fmtFull } from '@/config/date.js';
import { ENV } from '@/config/env.js';
import { useDemoState, useNextDay } from '@/hooks/useDemo.js';
import DemoMenu from './DemoMenu.jsx';
import ModalHost from './ModalHost.jsx';
import RootGate from './RootGate.jsx';

const TABS = [
  { to: ROUTES.home, label: '홈', end: true },
  { to: ROUTES.books, label: '책 쌓기' },
  { to: ROUTES.review, label: '복습·오답' },
  { to: ROUTES.calendar, label: '캘린더' },
];

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
    <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
      <Link to={ROUTES.home} className="text-[15px] font-bold">
        {APP_NAME}
      </Link>
      {data && (
        <>
          {/* D-day는 항상 첫 시험 기준 */}
          <span className="num rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold">
            첫 시험 {data.firstExam.name} D-{dday}
          </span>
          <span className="text-xs text-fg-2">{fmtFull(data.today)}</span>
        </>
      )}
      <span className="flex-1" />
      {/* 목업 서버로 돌 때는 화면 전체가 목업 데이터라는 표시 */}
      {ENV.useMock && <MockBadge />}
      <button
        type="button"
        className="btn btn-sm"
        onClick={onNextDay}
        disabled={nextDay.isPending}
        title="데모용: 자정 판정을 바로 실행해요 (NF-08)"
      >
        다음 날로 (데모용)
      </button>
      <DemoMenu />
    </header>
  );
}

export default function MainLayout() {
  return (
    <RootGate>
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col bg-surface">
        <AppHeader />
        <nav
          className="flex gap-0.5 overflow-x-auto border-b border-line px-4"
          aria-label="주 메뉴"
        >
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `border-b-2 px-3 py-2.5 whitespace-nowrap ${isActive ? 'border-fg font-bold text-fg' : 'border-transparent font-medium text-fg-2'}`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex flex-1 flex-col gap-4 p-5">
          <Outlet />
        </main>
        <ModalHost />
      </div>
    </RootGate>
  );
}
