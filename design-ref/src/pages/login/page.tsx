import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";
import LoginActions from "./components/LoginActions";
import LegalDialog, { type LegalKind } from "./components/LegalDialog";

const LOGO_SRC =
  "https://storage.helloreaddy.io/project_files/73c16942-5877-4dff-b14e-cc0c4d5dba7c/ccb99f25-94cd-46b4-8cf2-0da67eef8971_compressed_---.webp";

export default function LoginPage() {
  const [legal, setLegal] = useState<LegalKind | null>(null);

  useEffect(() => {
    document.title = "피뢰침 | AI 스터디 플래너 로그인";
    const desc = document.querySelector('meta[name="description"]');
    const text = "AI가 시험일까지 학습 일정을 설계하는 스터디 플래너. 카카오·구글 로그인 또는 게스트로 바로 시작해 보세요.";
    if (desc) desc.setAttribute("content", text);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = text;
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="lk-scope relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[var(--lk-paper)]">
      <div className="lk-glow pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />

      <header className="relative z-10 flex w-full items-center justify-between gap-4 px-6 pt-6 sm:px-10">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lk-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--lk-brand)]" />
          AI Study Planner
        </span>
        <Link
          to="/home#contact"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium text-[var(--lk-muted)] transition-colors hover:bg-[var(--lk-brand-tint)] hover:text-[var(--lk-brand-deep)]"
        >
          <i className="ri-question-line text-base leading-none" />
          도움이 필요하신가요?
        </Link>
      </header>

      <main className="relative z-10 flex w-full flex-1 items-center justify-center px-6 py-8">
        <div className="lk-rise w-full max-w-[396px]">
          <div className="flex w-full justify-center">
            <div className="lk-logo-plate flex w-full max-w-[320px] items-center justify-center rounded-[26px] px-8 py-7">
              <img
                src={LOGO_SRC}
                alt="피뢰침 로고"
                title="피뢰침 AI 스터디 플래너 로고"
                className="lk-logo-mark h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <h1 className="lk-display text-[26px] text-[var(--lk-ink)] sm:text-[30px]">다시 만나서 반가워요</h1>
            <p className="mx-auto mt-2.5 max-w-[320px] text-[13.5px] leading-relaxed text-[var(--lk-muted)]">
              로그인하면 오늘 해야 할 학습량과 남은 일정이 바로 정리됩니다.
            </p>
          </div>

          <div className="lk-rise lk-d2 mt-7">
            <LoginActions />
          </div>

          <p className="mt-6 text-center text-[12px] leading-relaxed text-[var(--lk-muted)]">
            계속 진행하면{" "}
            <button
              type="button"
              onClick={() => setLegal("terms")}
              className="font-semibold text-[var(--lk-ink)] underline decoration-[var(--lk-brand)] decoration-2 underline-offset-2 hover:text-[var(--lk-brand-deep)]"
            >
              이용약관
            </button>{" "}
            및{" "}
            <button
              type="button"
              onClick={() => setLegal("privacy")}
              className="font-semibold text-[var(--lk-ink)] underline decoration-[var(--lk-brand)] decoration-2 underline-offset-2 hover:text-[var(--lk-brand-deep)]"
            >
              개인정보처리방침
            </button>
            에 동의하게 됩니다.
          </p>
        </div>
      </main>

      <footer className="relative z-10 flex w-full flex-col items-center justify-between gap-2 border-t border-[var(--lk-line)] px-6 py-4 text-[11.5px] text-[var(--lk-muted)] sm:flex-row sm:px-10">
        <p className="text-center sm:text-left">© 2026 피뢰침. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setLegal("terms")} className="whitespace-nowrap hover:text-[var(--lk-ink)]">
            Terms
          </button>
          <button type="button" onClick={() => setLegal("privacy")} className="whitespace-nowrap hover:text-[var(--lk-ink)]">
            Privacy
          </button>
          <Link to="/home" className="whitespace-nowrap font-semibold text-[var(--lk-brand-deep)] hover:text-[var(--lk-ink)]">
            둘러보기
          </Link>
        </div>
      </footer>

      <LegalDialog kind={legal} onClose={() => setLegal(null)} />
    </div>
  );
}