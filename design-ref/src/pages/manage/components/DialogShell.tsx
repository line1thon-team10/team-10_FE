import { useEffect, type ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  label?: string;
};

/** 관리 화면 계열 팝업의 공통 틀: 바깥을 누르거나 Esc로 닫힙니다. */
export default function DialogShell({ title, subtitle, onClose, children, footer, wide, label }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="mg-scope">
      <div
        className="mg-overlay"
        role="presentation"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          className={`mg-modal mg-rise ${wide ? "mg-modal--wide" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label={label ?? "제안 확인"}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[18px] leading-snug text-[var(--mg-ink)] md:text-[20px]">{title}</h2>
              {subtitle ? (
                <p className="mt-2 text-[12px] leading-relaxed text-[var(--mg-muted)]">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-lg border border-[var(--mg-line-strong)] text-[var(--mg-muted)] transition-colors hover:border-[var(--mg-ink-soft)] hover:text-[var(--mg-ink)]"
            >
              <i className="ri-close-line text-[15px] leading-none" />
            </button>
          </div>

          <div className="mt-4">{children}</div>

          {footer ? (
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--mg-line)] pt-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}