import type { QuizQuestion } from "@/pages/quiz/types";

type Props = {
  question: QuizQuestion;
  grading: boolean;
  score: number | null;
};

export default function QuizGrading({ question, grading, score }: Props) {
  if (score !== null) {
    const correct = score >= 85;
    return (
      <section className="qz-card qz-rise">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[14px] text-[var(--qz-ink)]">채점 결과</h3>
          <span className={`qz-badge ${correct ? "qz-badge--good" : "qz-badge--bad"}`}>
            {score}점 · {correct ? "정답" : "오답"}
          </span>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-[var(--qz-ink-soft)]">
          {question.aiNote ?? "핵심 개념이 모두 들어 있어요."}
        </p>
        <p className="mt-3 flex items-center gap-1 text-[11.5px] text-[var(--qz-muted)]">
          <i className="ri-link text-[12px] leading-none" />
          근거 {question.evidence} 보기
        </p>
      </section>
    );
  }

  if (grading) {
    return (
      <section className="qz-card qz-rise">
        <h3 className="flex items-center gap-1.5 text-[14px] text-[var(--qz-ink)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--qz-brand-tint)] text-[11px] font-bold text-[var(--qz-brand-deep)]">
            AI
          </span>
          채점 후: 채점 중
        </h3>
        <p className="mt-2 text-[12px] text-[var(--qz-muted)]">AI가 답을 읽고 있어요</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          <li className="qz-step is-done">
            <span className="qz-step__dot">
              <i className="ri-check-line text-[9px] leading-none" />
            </span>
            답 저장 완료
          </li>
          <li className="qz-step is-active">
            <span className="qz-step__dot">
              <i className="ri-loader-4-line qz-spin text-[10px] leading-none" />
            </span>
            핵심 개념 찾는 중 · 후속자, 원래 자리에서 삭제
          </li>
          <li className="qz-step">
            <span className="qz-step__dot" />
            점수와 빠진 부분 정리
          </li>
        </ul>
        <p className="mt-3 border-t border-[var(--qz-line)] pt-3 text-[11.5px] text-[var(--qz-muted)]">
          보통 3~5초 · 그동안 다음 문제로 넘어가도 돼요
        </p>
      </section>
    );
  }

  return (
    <section className="qz-card qz-card--dashed">
      <h3 className="text-[14px] text-[var(--qz-ink)]">AI 채점 안내</h3>
      <p className="mt-2 text-[12px] leading-relaxed text-[var(--qz-muted)]">
        답을 제출하면 AI가 핵심 개념이 들어 있는지로 채점해요. 85점부터 정답이에요.
      </p>
      <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-[var(--qz-muted)]">
        <i className="ri-time-line text-[12px] leading-none" />
        채점은 보통 3~5초 걸려요
      </p>
    </section>
  );
}