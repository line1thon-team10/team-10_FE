import { Link } from "react-router-dom";
import AppNav from "@/components/feature/AppNav";

export default function HomeHeader() {
  return (
    <AppNav
      right={
        <Link
          to="/manage"
          className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-[var(--nav-line-strong)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--nav-ink-soft)] transition-colors hover:bg-white/[0.06] hover:text-[var(--nav-ink)]"
        >
          과목·계획 관리
          <i className="ri-arrow-right-line text-[12px] leading-none" />
        </Link>
      }
    />
  );
}