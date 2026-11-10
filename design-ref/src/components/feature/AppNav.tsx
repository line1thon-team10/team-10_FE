import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import DemoMenu from "@/components/feature/DemoMenu";
import "./appNav.css";

const LOGO_SRC =
  "https://storage.helloreaddy.io/project_files/73c16942-5877-4dff-b14e-cc0c4d5dba7c/ccb99f25-94cd-46b4-8cf2-0da67eef8971_compressed_---.webp";

const NAV = [
  { key: "home", label: "홈", to: "/home" },
  { key: "books", label: "책 쌓기", to: "/books" },
  { key: "review", label: "복습·오답", to: "/review" },
  { key: "calendar", label: "캘린더", to: "/calendar" },
] as const;

type NavKey = (typeof NAV)[number]["key"];

const activeKeyOf = (pathname: string): NavKey | null => {
  if (pathname.startsWith("/review")) return "review";
  if (pathname.startsWith("/books")) return "books";
  if (pathname.startsWith("/calendar")) return "calendar";
  if (pathname.startsWith("/home") || pathname.startsWith("/quiz")) return "home";
  return null;
};

type Props = {
  /** 오른쪽에 붙는 화면별 동작 */
  right?: ReactNode;
};

export default function AppNav({ right }: Props) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const activeKey = activeKeyOf(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="app-nav sticky top-0 z-40">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/home" aria-label="피뢰침 기록 화면" className="flex shrink-0 items-center">
            <img src={LOGO_SRC} alt="피뢰침 로고" className="h-8 w-auto object-contain" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="주요 화면">
            {NAV.map((item) => {
              const active = activeKey === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`cursor-pointer whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
                    active
                      ? "bg-white/[0.07] text-[var(--nav-ink)]"
                      : "text-[var(--nav-muted)] hover:bg-white/[0.06] hover:text-[var(--nav-ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {right}
          <DemoMenu />
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls="app-nav-panel"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--nav-line-strong)] text-[var(--nav-ink-soft)] transition-colors hover:bg-white/[0.06] hover:text-[var(--nav-ink)] md:hidden"
          >
            <i className={`${open ? "ri-close-line" : "ri-menu-line"} text-[18px] leading-none`} />
          </button>
        </div>
      </div>

      {open ? (
        <div id="app-nav-panel" className="border-t border-[var(--nav-line)] bg-[var(--nav-panel)] md:hidden">
          <nav className="mx-auto flex w-full max-w-[1120px] flex-col gap-1 px-4 py-3" aria-label="주요 화면">
            {NAV.map((item) => {
              const active = activeKey === item.key;
              return (
                <Link
                  key={`panel-${item.key}`}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-white/[0.07] text-[var(--nav-ink)]"
                      : "text-[var(--nav-muted)] hover:bg-white/[0.06] hover:text-[var(--nav-ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}