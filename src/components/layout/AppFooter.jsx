import { APP_NAME } from '@/config/app.js';

export default function AppFooter() {
  return (
    <footer className="border-t border-line bg-bg-2">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-2 px-6 py-4 text-[11.5px] text-fg-2">
        <p>{APP_NAME} · 웹 시연판</p>
        <p className="flex items-center gap-2">
          <span className="blk blk-mini w-[18px]" data-state="done" aria-hidden="true" />책 1권 =
          태스크 1개
        </p>
      </div>
    </footer>
  );
}
