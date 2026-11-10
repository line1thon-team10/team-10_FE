import { useEffect, useRef, useState, type ReactNode } from "react";

export type AiWaitTone = "home" | "plan" | "manage" | "quiz";

type ToneClass = {
  box: string;
  spinner: string;
  label: string;
  sub: string;
  line: string;
  retry: string;
  chip: string;
};

const TONES: Record<AiWaitTone, ToneClass> = {
  home: {
    box: "border border-[var(--hp-line)] bg-[var(--hp-card)]",
    spinner: "text-[var(--hp-brand-deep)]",
    label: "text-[var(--hp-ink)]",
    sub: "text-[var(--hp-muted)]",
    line: "bg-white/[0.07]",
    retry: "border-[var(--hp-line-strong)] text-[var(--hp-ink-soft)] hover:border-[var(--hp-ink-soft)] hover:text-[var(--hp-ink)]",
    chip: "border-[var(--hp-line-strong)] text-[var(--hp-muted)]",
  },
  plan: {
    box: "border border-[var(--ps-line)] bg-[var(--ps-paper-warm)]",
    spinner: "text-[var(--ps-brand-deep)]",
    label: "text-[var(--ps-ink)]",
    sub: "text-[var(--ps-muted)]",
    line: "bg-white/[0.07]",
    retry: "border-[var(--ps-line-strong)] text-[var(--ps-ink-soft)] hover:border-[var(--ps-ink-soft)] hover:text-[var(--ps-ink)]",
    chip: "border-[var(--ps-line-strong)] text-[var(--ps-muted)]",
  },
  manage: {
    box: "border border-[var(--mg-line)] bg-[var(--mg-paper-warm)]",
    spinner: "text-[var(--mg-brand-deep)]",
    label: "text-[var(--mg-ink)]",
    sub: "text-[var(--mg-muted)]",
    line: "bg-white/[0.07]",
    retry: "border-[var(--mg-line-strong)] text-[var(--mg-ink-soft)] hover:border-[var(--mg-ink-soft)] hover:text-[var(--mg-ink)]",
    chip: "border-[var(--mg-line-strong)] text-[var(--mg-muted)]",
  },
  quiz: {
    box: "border border-[var(--qz-line)] bg-[var(--qz-paper-warm)]",
    spinner: "text-[var(--qz-brand-deep)]",
    label: "text-[var(--qz-ink)]",
    sub: "text-[var(--qz-muted)]",
    line: "bg-white/[0.07]",
    retry: "border-[var(--qz-line-strong)] text-[var(--qz-ink-soft)] hover:border-[var(--qz-ink-soft)] hover:text-[var(--qz-ink)]",
    chip: "border-[var(--qz-line-strong)] text-[var(--qz-muted)]",
  },
};

type Props = {
  label?: string;
  tone?: AiWaitTone;
  /** 기본 1.4초 뒤 결과. ?slow=1 이면 8초·30초 상태를 볼 수 있어요. */
  delayMs?: number;
  /** 카드 안에 들어갈 때 테두리·배경 없이 */
  bare?: boolean;
  className?: string;
  /** 결과가 준비되면 한 번 불립니다. */
  onDone?: () => void;
  children: ReactNode;
};

type Phase = "loading" | "long" | "stuck" | "done" | "saved";

export default function AiWait({
  label = "AI가 정리하고 있어요",
  tone = "home",
  delayMs = 1400,
  bare = false,
  className = "",
  onDone,
  children,
}: Props) {
  const palette = TONES[tone];
  const slow =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("slow") === "1";
  const [phase, setPhase] = useState<Phase>("loading");
  const doneRef = useRef(false);

  useEffect(() => {
    const timers: number[] = [];
    if (slow) {
      timers.push(window.setTimeout(() => setPhase("long"), 8000));
      timers.push(window.setTimeout(() => setPhase("stuck"), 30000));
    } else {
      timers.push(window.setTimeout(() => setPhase("done"), delayMs));
    }
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [slow, delayMs]);

  useEffect(() => {
    if (phase !== "done" || doneRef.current) return;
    doneRef.current = true;
    onDone?.();
  }, [phase, onDone]);

  if (phase === "done") return <>{children}</>;

  if (phase === "saved") {
    return (
      <div className={className}>
        <div className="mb-2 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-[2px] text-[9.5px] font-semibold ${palette.chip}`}>
            <i className="ri-archive-2-line text-[10px] leading-none" />
            저장된 결과
          </span>
          <span className={`text-[10.5px] ${palette.sub}`}>AI가 응답하지 않아 지난 결과를 보여줘요</span>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`${bare ? "" : `${palette.box} rounded-xl p-3.5`} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className={`flex h-4 w-4 flex-none items-center justify-center ${palette.spinner}`}>
          <i className="ri-loader-4-line animate-spin text-[14px] leading-none" />
        </span>
        <span className={`text-[12px] font-semibold ${palette.label}`}>{label}</span>
        <span className={`text-[11px] ${palette.sub}`}>
          {phase === "long" ? "조금 오래 걸리고 있어요" : "잠시만 기다려 주세요"}
        </span>
      </div>

      <div className="mt-2.5 flex flex-col gap-1.5" aria-hidden="true">
        <span className={`block h-2 w-[88%] animate-pulse rounded-full ${palette.line}`} />
        <span className={`block h-2 w-[70%] animate-pulse rounded-full ${palette.line}`} />
        <span className={`block h-2 w-[46%] animate-pulse rounded-full ${palette.line}`} />
      </div>

      {phase === "stuck" ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPhase("saved")}
            className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${palette.retry}`}
          >
            <i className="ri-restart-line text-[12px] leading-none" />
            다시 시도
          </button>
          <span className={`text-[10.5px] ${palette.sub}`}>응답이 없으면 저장된 결과를 보여드려요</span>
        </div>
      ) : null}
    </div>
  );
}