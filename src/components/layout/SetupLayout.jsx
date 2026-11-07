import { Outlet, useLocation } from 'react-router';
import { SCREENS, SETUP_STEPS } from '@/app/screens.js';
import { MockBadge } from '@/components/common/Badge.jsx';
import { APP_NAME } from '@/config/app.js';
import { ENV } from '@/config/env.js';
import DemoMenu from './DemoMenu.jsx';
import RootGate from './RootGate.jsx';

// 최초 1회 온보딩 틀: 서비스 이름 + 5단계 진행 표시
export default function SetupLayout() {
  const { pathname } = useLocation();
  const step = SCREENS.find((s) => s.path === pathname)?.step ?? 0;
  return (
    <RootGate>
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col bg-surface">
        <header className="flex items-center gap-3 border-b border-line px-6 py-3">
          <strong className="text-[15px]">{APP_NAME}</strong>
          <span className="ml-auto text-xs text-fg-2">처음 한 번만 설정해요</span>
          {ENV.useMock && <MockBadge />}
          <DemoMenu />
        </header>
        <ol
          className="flex flex-wrap gap-1.5 border-b border-line px-6 py-3"
          aria-label="설정 단계"
        >
          {SETUP_STEPS.map((t, i) => (
            <li
              key={t}
              aria-current={i === step ? 'step' : undefined}
              className={`rounded-full border px-2.5 py-1 text-[12.5px] ${i < step ? 'border-transparent bg-surface-2 text-fg-2' : i === step ? 'border-ink bg-ink font-semibold text-ink-fg' : 'border-line text-fg-3'}`}
            >
              {i < step ? '✓ ' : `${i + 1}. `}
              {t}
            </li>
          ))}
        </ol>
        <main className="flex flex-1 flex-col gap-4 p-6">
          <Outlet />
        </main>
      </div>
    </RootGate>
  );
}
