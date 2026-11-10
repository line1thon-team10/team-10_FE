import { Link } from "react-router-dom";
import type { QuizSubject } from "@/pages/quiz/types";
import { quizDeferredNote, quizIntro } from "@/mocks/quiz";

type Props = {
  subjects: QuizSubject[];
  onStart: (id: string) => void;
};

export default function QuizPick({ subjects, onStart }: Props) {
  const openSubjects = subjects.filter((item) => !item.locked);
  const lockedSubjects = subjects.filter((item) => item.locked);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--qz-brand-deep)]">
            <i className="ri-refresh-line text-[13px] leading-none" />
            오늘의 퀴즈
          </p>
          <h1 className="mt-3 text-[28px] leading-tight text-[var(--qz-ink)] md:text-[34px]">오늘의 퀴즈</h1>
          <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-[var(--qz-muted)]">{quizIntro}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="qz-chip">
            <i className="ri-calendar-check-line text-[12px] leading-none" />
            오늘 88% 진행
          </span>
          <Link to="/review" className="qz-btn qz-btn--ghost">
            누적 오답 노트
          </Link>
          <Link to="/home" className="qz-btn qz-btn--ghost">
            기록으로
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {openSubjects.map((item) => (
          <article key={item.id} className={`qz-subject qz-accent-${item.accent} qz-rise`}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-[17px] text-[var(--qz-ink)]">{item.subject}</h2>
              <span className="qz-chip qz-chip--good">
                열림 · 오늘 {item.percent}%
              </span>
            </div>

            <p className="qz-display text-[30px] leading-none text-[var(--qz-ink)]">
              {item.questions.length}문항
            </p>

            <ul className="flex flex-col gap-1.5">
              {item.lines.map((line) => (
                <li key={line} className="flex items-start gap-1.5 text-[12px] leading-relaxed text-[var(--qz-muted)]">
                  <i className="ri-circle-fill mt-[6px] text-[3.5px] leading-none text-[var(--qz-line-strong)]" />
                  <span className="min-w-0">{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag} className="qz-chip">
                  {tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onStart(item.id)}
              className="qz-btn qz-btn--ghost mt-auto w-full"
            >
              풀기
            </button>
          </article>
        ))}
      </div>

      {lockedSubjects.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {lockedSubjects.map((item) => (
            <article
              key={item.id}
              className={`qz-locked qz-accent-${item.accent}`}
              aria-disabled="true"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-5">
                <div className="flex min-w-0 items-baseline gap-2">
                  <h2 className="text-[15px] text-[var(--qz-muted)]">{item.subject}</h2>
                  <span className="text-[12px] text-[var(--qz-muted)]">{item.questions.length}문항 · 오늘 {item.percent}%</span>
                </div>
                <p className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-[var(--qz-muted)]">
                  <i className="ri-lock-line text-[12px] leading-none" />
                  {item.lockedNote}
                </p>
              </div>
              <button type="button" disabled className="qz-btn qz-btn--ghost md:w-[150px]">
                70%부터 열려요
              </button>
            </article>
          ))}
        </div>
      ) : null}

      <p className="mt-6 flex items-center gap-1.5 text-[11.5px] text-[var(--qz-muted)]">
        <i className="ri-information-line text-[13px] leading-none" />
        {quizDeferredNote}
      </p>
    </>
  );
}