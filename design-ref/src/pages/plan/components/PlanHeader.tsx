import { Link } from "react-router-dom";

const LOGO_SRC =
  "https://storage.helloreaddy.io/project_files/73c16942-5877-4dff-b14e-cc0c4d5dba7c/ccb99f25-94cd-46b4-8cf2-0da67eef8971_compressed_---.webp";

export default function PlanHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--ps-line)] bg-[var(--ps-paper)]/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/plan" aria-label="피뢰침 학습 계획 설정" className="flex min-w-0 items-center gap-2.5">
          <img src={LOGO_SRC} alt="피뢰침 로고" className="h-7 w-auto object-contain" />
          <span className="hidden text-[11.5px] font-medium text-[var(--ps-muted)] sm:inline">
            학습 계획 설정
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[11.5px] text-[var(--ps-muted)] sm:inline">처음 한 번만 설명해요</span>
          <Link
            to="/manage"
            className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-[var(--ps-muted)] transition-colors hover:text-[var(--ps-ink)]"
          >
            과목·계획 관리
          </Link>
          <Link
            to="/home"
            className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-[var(--ps-muted)] transition-colors hover:text-[var(--ps-ink)]"
          >
            기록 화면 보기
            <i className="ri-arrow-right-line text-[13px] leading-none" />
          </Link>
        </div>
      </div>
    </header>
  );
}