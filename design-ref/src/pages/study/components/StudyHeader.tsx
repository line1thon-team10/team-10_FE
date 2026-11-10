import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const LOGO_SRC =
  "https://storage.helloreaddy.io/project_files/73c16942-5877-4dff-b14e-cc0c4d5dba7c/ccb99f25-94cd-46b4-8cf2-0da67eef8971_compressed_---.webp";

type Props = {
  /** 오른쪽에 붙는 버튼 (집중 모드의 [시간 보기]) */
  right?: ReactNode;
};

export default function StudyHeader({ right }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--st-line)] bg-[var(--st-paper)]/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link to="/home" aria-label="피뢰침 기록 화면" className="flex shrink-0 items-center">
            <img src={LOGO_SRC} alt="피뢰침 로고" className="h-7 w-auto object-contain" />
          </Link>
          <span className="text-[12px] font-medium text-[var(--st-muted)]">· 집중 모드</span>
        </div>
        {right ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
      </div>
    </header>
  );
}