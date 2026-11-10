import { Check } from 'lucide-react';
import { Outlet, useLocation } from 'react-router';
import { ROUTES, SCREENS, SETUP_STEPS } from '@/app/screens.js';
import { MockBadge } from '@/components/common/Badge.jsx';
import { ENV } from '@/config/env.js';
import AppFooter from './AppFooter.jsx';
import DemoMenu from './DemoMenu.jsx';
import Logo from './Logo.jsx';
import RootGate from './RootGate.jsx';

const line = (on) => `h-0.5 flex-1 rounded ${on ? 'bg-fg-soft' : 'bg-line-2'}`;

// 5단계 진행 표시 (디자인 PlanStepper 모양)
function Steps({ step }) {
  return (
    <ol className="flex items-start" aria-label="설정 단계">
      {SETUP_STEPS.map((t, i) => {
        const done = i < step;
        const now = i === step;
        return (
          <li
            key={t}
            aria-current={now ? 'step' : undefined}
            className="flex flex-1 flex-col items-center gap-2"
          >
            <span className="flex w-full items-center">
              <span className={i === 0 ? 'flex-1' : line(done || now)} />
              <span
                className={`grid h-[29px] w-[29px] flex-none place-items-center rounded-full border text-xs font-bold ${done ? 'border-fg bg-fg text-ink-fg' : now ? 'border-fg bg-bg text-fg shadow-[0_0_0_4px_rgb(255_255_255/0.06)]' : 'border-line-2 bg-bg text-fg-2'}`}
              >
                {done ? <Check size={14} aria-label="완료" /> : i + 1}
              </span>
              <span className={i === SETUP_STEPS.length - 1 ? 'flex-1' : line(done)} />
            </span>
            <span
              className={`text-[11.5px] whitespace-nowrap ${now ? 'font-bold text-fg' : done ? 'text-fg-soft' : 'text-fg-2'}`}
            >
              {t}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

// 최초 1회 온보딩 틀: 글자 로고 + '처음 한 번만 설정해요' + 5단계 진행 표시
export default function SetupLayout() {
  const { pathname } = useLocation();
  const step = SCREENS.find((s) => s.path === pathname)?.step ?? 0;
  return (
    <RootGate>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-3 px-6">
            <Logo to={ROUTES.s1} />
            <span className="ml-auto text-xs text-fg-2">처음 한 번만 설정해요</span>
            {ENV.useMock && <MockBadge />}
            <DemoMenu />
          </div>
        </header>
        <div className="mx-auto w-full max-w-[760px] px-6 pt-6">
          <Steps step={step} />
        </div>
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-4 px-6 py-6">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </RootGate>
  );
}
