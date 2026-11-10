import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearPlanAccess } from "@/pages/plan/access";

type DemoItem = {
  id: string;
  label: string;
  desc: string;
  to?: string;
};

const ITEMS: DemoItem[] = [
  { id: "empty", label: "빈 계정", desc: "계획 처음부터 다시 시작", to: "/plan?new=1" },
  { id: "day", label: "11/9 시연 상태", desc: "오늘 할 일 ②③④ 완료 · 58%", to: "/home?demo=1110" },
  { id: "pre", label: "밀림 직전 상태", desc: "①④를 못 한 밤 11/9", to: "/home?demo=pre" },
  { id: "pace", label: "속도 보정 알림 보기", desc: "자료구조 1.4배 · 속도 보정 팝업", to: "/home?demo=pace" },
];

export default function DemoMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [judging, setJudging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const goNextDay = () => {
    setOpen(false);
    setJudging(true);
    const demo = new URLSearchParams(location.search).get("demo");
    window.setTimeout(() => {
      setJudging(false);
      if (demo === "pre") navigate("/home?demo=catchup");
      else if (demo === "1110") navigate("/home?demo=nextday");
      else navigate("/home");
    }, 1000);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="데모 메뉴"
        className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-[var(--nav-line-strong)] px-2.5 py-1 text-[10.5px] font-medium text-[var(--nav-muted)] transition-colors hover:border-[var(--nav-muted)] hover:text-[var(--nav-ink-soft)]"
      >
        <i className="ri-flask-line text-[11px] leading-none" />
        데모
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="데모 시연 상태"
          className="absolute right-0 top-full z-50 mt-2 w-[232px] rounded-xl border border-[var(--nav-line-strong)] bg-[var(--nav-panel)] p-1.5 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.85)]"
        >
          <p className="px-2.5 pb-1.5 pt-1 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[var(--nav-muted)]">
            시연 상태
          </p>
          {ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                if (item.id === "empty") clearPlanAccess();
                if (item.to) navigate(item.to);
              }}
              className="flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.07]"
            >
              <span className="whitespace-nowrap text-[12px] font-semibold text-[var(--nav-ink)]">{item.label}</span>
              <span className="text-[10.5px] leading-relaxed text-[var(--nav-muted)]">{item.desc}</span>
            </button>
          ))}
          <div className="my-1.5 h-px bg-[var(--nav-line)]" />
          <button
            type="button"
            role="menuitem"
            onClick={goNextDay}
            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.07]"
          >
            <span className="flex flex-col gap-0.5">
              <span className="whitespace-nowrap text-[12px] font-semibold text-[var(--nav-ink)]">다음 날로</span>
              <span className="text-[10.5px] leading-relaxed text-[var(--nav-muted)]">자정 판정 뒤 결과를 보여줘요</span>
            </span>
            <i className="ri-arrow-right-line text-[13px] leading-none text-[var(--nav-muted)]" />
          </button>
        </div>
      ) : null}

      {judging ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--nav-line-strong)] bg-[var(--nav-panel)] px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[var(--nav-ink)]">
              <i className="ri-loader-4-line animate-spin text-[17px] leading-none" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[var(--nav-ink)]">자정 판정 중…</p>
              <p className="mt-0.5 text-[11px] text-[var(--nav-muted)]">어제 계획과 오늘 할 일을 다시 계산해요</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}