import { Link } from "react-router-dom";
import AppNav from "@/components/feature/AppNav";

type Props = {
  dDayLabel?: string;
};

export default function CalendarHeader({ dDayLabel = "시험 자료구조 D-3" }: Props) {
  return (
    <AppNav
      right={
        <>
          <span className="hidden whitespace-nowrap rounded-full border border-[var(--nav-line-strong)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--nav-ink-soft)] sm:inline-flex">
            {dDayLabel}
          </span>
          <Link
            to="/home"
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f2ece1] px-3.5 py-1.5 text-[11.5px] font-semibold text-[#141416] transition-colors hover:bg-white"
          >
            책장 보기
            <i className="ri-arrow-right-line text-[12px] leading-none" />
          </Link>
        </>
      }
    />
  );
}