import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Provider = "카카오" | "구글";

export default function LoginActions() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string>("");

  const handleProvider = (provider: Provider) => {
    setNotice(
      `${provider} 로그인은 아직 연동 준비 중이에요. 지금은 게스트로 들어가 플랜 예시와 대시보드를 먼저 둘러보실 수 있습니다.`,
    );
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => handleProvider("카카오")}
          className="lk-action flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl bg-[var(--lk-kakao)] px-5 py-3.5 text-sm font-semibold text-[#191919] shadow-[0_8px_20px_-10px_rgba(25,25,25,0.45)] hover:bg-[#f7de00]"
        >
          <i className="ri-kakao-talk-fill text-[19px] leading-none" />
          카카오로 로그인
        </button>

        <button
          type="button"
          onClick={() => handleProvider("구글")}
          className="lk-action flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl border border-[var(--lk-line)] bg-[var(--lk-card)] px-5 py-3.5 text-sm font-semibold text-[var(--lk-ink)] hover:border-[var(--lk-line-strong)] hover:bg-white/[0.04]"
        >
          <span className="lk-g-mark">G</span>
          Google로 계속하기
        </button>
      </div>

      {notice ? (
        <div
          role="status"
          aria-live="polite"
          className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[var(--lk-brand-line)] bg-[var(--lk-brand-tint)] px-4 py-3 text-left"
        >
          <i className="ri-information-line mt-0.5 text-base leading-none text-[var(--lk-brand-deep)]" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-relaxed text-[var(--lk-brand-deep)]">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="mt-1 text-[12px] font-semibold text-[var(--lk-brand-deep)] underline underline-offset-2 hover:text-[var(--lk-ink)]"
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--lk-line)]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lk-muted)]">또는</span>
        <span className="h-px flex-1 bg-[var(--lk-line)]" />
      </div>

      <button
        type="button"
        onClick={() => navigate("/plan")}
        className="lk-action group flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[var(--lk-solid)] px-5 py-3.5 text-sm font-semibold text-[var(--lk-solid-ink)] hover:bg-white"
      >
        <i className="ri-user-line text-[17px] leading-none" />
        게스트로 계획 세우기
        <i className="ri-arrow-right-line text-[16px] leading-none transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>

      <p className="mt-3 text-center text-[12.5px] leading-relaxed text-[var(--lk-muted)]">
        가입 없이 학습 계획을 먼저 세워 볼 수 있어요.
      </p>
    </div>
  );
}