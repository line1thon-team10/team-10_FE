import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { QuizAnswer, QuizQuestion, QuizSubject } from "@/pages/quiz/types";
import { getQuizStats, isCorrect, resultTone } from "@/pages/quiz/utils";
import { quizEvidence, quizUnitChanges } from "@/mocks/quiz";
import PdfPageDialog from "@/components/feature/PdfPageDialog";

type Props = {
  subject: QuizSubject;
  questions: QuizQuestion[];
  answers: Record<string, QuizAnswer>;
  onMore: () => void;
};

export default function QuizResult({ subject, questions, answers, onMore }: Props) {
  const navigate = useNavigate();
  const [noteOpen, setNoteOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState<Record<string, boolean>>({});
  const [pdfOpen, setPdfOpen] = useState(false);
  const stats = getQuizStats(questions, answers);
  const firstWrong = questions.find((question) => !isCorrect(question, answers[question.id]));
  const [evidenceId, setEvidenceId] = useState(() => (firstWrong ?? questions[0])?.id ?? "");
  const evidenceQuestion = questions.find((question) => question.id === evidenceId) ?? firstWrong ?? questions[0];
  const noteQuestions = questions.filter((question) => {
    const answer = answers[question.id];
    return !isCorrect(question, answer) || answer?.confidence === "unsure";
  });

  const toggleExplain = (id: string) =>
    setExplainOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <div className="qz-rise">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--qz-brand-deep)]">
              <i className="ri-file-list-3-line text-[13px] leading-none" />
              오늘의 퀴즈
            </p>
            <h1 className="mt-3 text-[26px] leading-tight text-[var(--qz-ink)] md:text-[30px]">
              {subject.subject} 퀴즈 결과 · {stats.correct}/{stats.total}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="qz-chip qz-chip--good">확실 정답 {stats.sureCorrect}</span>
              <span className="qz-chip qz-chip--warn">애매 정답 {stats.unsureCorrect}</span>
              <span className="qz-chip qz-chip--bad">오답 {stats.wrong}</span>
            </div>
            <p className="mt-3 max-w-[560px] text-[12.5px] leading-relaxed text-[var(--qz-muted)]">
              정답과 해설을 한 번에 확인해요. 틀리거나 애매하게 맞힌 문제는 오답 노트에 담겨 내일 다시 나와요.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button type="button" onClick={onMore} className="qz-btn qz-btn--ghost">
              더 풀기 ({subject.subject} {Math.min(5, questions.length)}문항)
            </button>
            <button type="button" onClick={() => setNoteOpen(true)} className="qz-btn qz-btn--ghost">
              오답 노트 보기
            </button>
            <Link to="/books" className="qz-btn qz-btn--ghost">
              책 쌓기 보기
            </Link>
            <Link to="/home" className="qz-btn qz-btn--solid">
              끝으로
            </Link>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
          <div className="flex flex-col gap-2.5">
            {questions.map((question) => {
              const answer = answers[question.id];
              const badge = resultTone(question, answer);
              const correct = isCorrect(question, answer);
              const unsure = !correct && answer?.confidence === "unsure";
              const isWritten = question.kind === "written" && Boolean(answer?.submitted);
              const needsAttention = !correct || answer?.confidence === "unsure";
              const feedback = isWritten ? question.aiNote ?? question.note : question.note;
              const open = needsAttention || Boolean(explainOpen[question.id]);

              return (
                <article key={question.id} className="qz-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <span className="mt-0.5 shrink-0 text-[12px] font-bold text-[var(--qz-brand-deep)]">
                        Q{question.no}
                      </span>
                      <span className="mt-0.5 shrink-0 qz-chip">{question.label}</span>
                      <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-[var(--qz-ink)]">
                        {question.prompt}
                      </p>
                    </div>
                    <span className={`qz-badge qz-badge--${badge.tone}`}>{badge.label}</span>
                  </div>

                  {open ? (
                    <div className="mt-3 rounded-xl border border-dashed border-[var(--qz-line-strong)] bg-white/[0.02] px-3.5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="qz-chip qz-chip--brand">AI 피드백</span>
                        {isWritten ? (
                          <span className="text-[11.5px] text-[var(--qz-muted)]">
                            {answer?.score ?? 0}점 · {correct ? "정답" : "오답"}
                          </span>
                        ) : (
                          <span className="text-[11.5px] text-[var(--qz-muted)]">{question.label} 해설</span>
                        )}
                      </div>
                      <p className="mt-2 text-[12px] leading-relaxed text-[var(--qz-ink-soft)]">
                        {correct && !unsure
                          ? "핵심 개념이 모두 들어 있어요. 이 단원은 다음 퀴즈에서 한 번만 더 확인해요."
                          : feedback}
                      </p>
                      {!needsAttention ? (
                        <button
                          type="button"
                          onClick={() => toggleExplain(question.id)}
                          className="mt-2 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-[var(--qz-muted)] transition-colors hover:text-[var(--qz-ink)]"
                        >
                          해설 접기
                          <i className="ri-arrow-up-s-line text-[12px] leading-none" />
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleExplain(question.id)}
                      className="mt-2.5 inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-[var(--qz-line-strong)] px-2.5 py-1 text-[11px] font-semibold text-[var(--qz-muted)] transition-colors hover:border-[var(--qz-ink-soft)] hover:text-[var(--qz-ink)]"
                    >
                      <i className="ri-book-open-line text-[11px] leading-none" />
                      해설 보기
                    </button>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px] text-[var(--qz-muted)]">
                    {!correct ? (
                      <span className="flex items-center gap-1.5">
                        <i className="ri-bookmark-line text-[12px] leading-none text-[var(--qz-warn)]" />
                        오답 노트에 남겼어요 · 정답 {question.answerLabel}
                      </span>
                    ) : unsure ? (
                      <span className="flex items-center gap-1.5">
                        <i className="ri-bookmark-line text-[12px] leading-none text-[var(--qz-warn)]" />
                        애매하게 맞힌 문제는 오답 노트에 남기고 내일 다시 나와요
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <i className="ri-check-line text-[12px] leading-none text-[var(--qz-good)]" />
                        정답 · {question.answerLabel}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setEvidenceId(question.id)}
                      aria-pressed={evidenceQuestion?.id === question.id}
                      className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                        evidenceQuestion?.id === question.id
                          ? "border-[var(--qz-brand-line)] bg-[var(--qz-brand-tint)] text-[var(--qz-brand-deep)]"
                          : "border-[var(--qz-line-strong)] text-[var(--qz-muted)] hover:border-[var(--qz-ink-soft)] hover:text-[var(--qz-ink)]"
                      }`}
                    >
                      <i className="ri-link text-[11px] leading-none" />
                      근거 {question.evidence}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="flex flex-col gap-4">
            <section className="qz-card qz-card--dashed lg:sticky lg:top-24">
              <h2 className="text-[14px] leading-snug text-[var(--qz-ink)]">
                {quizEvidence.title} · Q{evidenceQuestion?.no ?? 1} · {evidenceQuestion?.evidence ?? ""}
              </h2>
              <p className="mt-1.5 text-[11px] text-[var(--qz-muted)]">
                문제의 &lsquo;근거&rsquo;를 누르면 이 카드가 그 문제의 근거로 바뀌어요.
              </p>
              <div className="qz-doc mt-3">
                <span className="qz-doc__line block w-[62%]" />
                <span className="qz-doc__line mt-2 block" />
                <span className="qz-doc__line mt-2 block w-[84%]" />
                <p className="qz-doc__highlight">
                  {evidenceQuestion?.evidenceQuote ?? quizEvidence.quote}
                </p>
                <span className="qz-doc__line block w-[72%]" />
                <span className="qz-doc__line mt-2 block w-[54%]" />
              </div>
              <button
                type="button"
                onClick={() => setPdfOpen(true)}
                className="qz-btn qz-btn--ghost mt-3 w-full"
              >
                <i className="ri-file-pdf-2-line text-[13px] leading-none" />
                원본 PDF 열기 · {evidenceQuestion?.evidence ?? ""}
              </button>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--qz-muted)]">{quizEvidence.note}</p>
            </section>

            <section className="qz-card">
              <h2 className="text-[14px] text-[var(--qz-ink)]">단원 이해도 변화</h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {quizUnitChanges.map((change) => {
                  const down = change.after < change.before;
                  return (
                    <li key={change.label}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-[var(--qz-ink-soft)]">
                          <i className="ri-bookmark-3-line text-[12px] leading-none text-[var(--qz-warn)]" />
                          <span className="truncate">{change.label}</span>
                        </span>
                        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[var(--qz-ink)]">
                          {change.before} <span className="text-[var(--qz-muted)]">→</span>{" "}
                          <span className={down ? "text-[#f0a595]" : "text-[#8ecfa4]"}>{change.after}</span>
                        </span>
                      </div>
                      <p className="mt-0.5 pl-[18px] text-[11px] text-[var(--qz-muted)]">{change.note}</p>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 border-t border-[var(--qz-line)] pt-3 text-[11px] leading-relaxed text-[var(--qz-muted)]">
                틀린 문제가 많을수록 이해도가 더 크게 내려가요. 서술형에서 빠진 핵심 개념은 다음 퀴즈에 다시 나와요.
              </p>
            </section>

            <section className="qz-card">
              <h2 className="text-[14px] text-[var(--qz-ink)]">더 풀기</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--qz-muted)]">
                원하면 오늘 공부한 단원 문제 5개를 더 풀 수 있어요(선택). 더 푼 문제도 이해도에 들어가고, 안 풀어도
                다음 퀴즈에 영향 없어요.
              </p>
              <button type="button" onClick={onMore} className="qz-btn qz-btn--ghost mt-3 w-full">
                문제 고르기
              </button>
            </section>

            <section className="qz-card">
              <h2 className="text-[14px] text-[var(--qz-ink)]">오답 노트에 {noteQuestions.length}문제</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--qz-muted)]">
                {noteQuestions.length > 0
                  ? `${noteQuestions.map((question) => `Q${question.no}`).join(", ")} 다시 보기 · 내일 퀴즈에 다시 나와요`
                  : "이번에는 남길 문제가 없어요. 다음 단원에서 만나요."}
              </p>
              <button
                type="button"
                onClick={() => setNoteOpen(true)}
                disabled={noteQuestions.length === 0}
                className="qz-btn qz-btn--ghost mt-3 w-full"
              >
                오답 노트 열기
              </button>
            </section>
          </aside>
        </div>
      </div>

      {noteOpen ? (
        <div className="qz-overlay" role="dialog" aria-modal="true" aria-label="오답 노트">
          <div className="qz-modal">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[19px] text-[var(--qz-ink)]">오답 노트 · {noteQuestions.length}문제</h2>
                <p className="mt-1.5 text-[12px] text-[var(--qz-muted)]">
                  틀리거나 애매하게 맞힌 문제만 모았어요. 내일 퀴즈에 다시 나와요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNoteOpen(false)}
                aria-label="오답 노트 닫기"
                className="qz-btn qz-btn--square"
              >
                <i className="ri-close-line text-[15px] leading-none" />
              </button>
            </div>

            <ul className="mt-4 flex flex-col gap-2.5">
              {noteQuestions.length === 0 ? (
                <li className="qz-card qz-card--soft text-[12px] text-[var(--qz-muted)]">
                  남은 오답이 없어요. 다음 단원에서 만나요.
                </li>
              ) : null}
              {noteQuestions.map((question) => (
                <li key={question.id} className="qz-card qz-card--soft">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 text-[12.5px] leading-relaxed text-[var(--qz-ink)]">
                      <span className="mr-1.5 font-bold text-[var(--qz-brand-deep)]">Q{question.no}</span>
                      {question.prompt}
                    </p>
                    <span className="qz-chip shrink-0">{question.label}</span>
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--qz-muted)]">
                    정답 · {question.answerLabel}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--qz-muted)]">
                    <i className="ri-link text-[11px] leading-none" />
                    근거 {question.evidence}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col gap-2 border-t border-[var(--qz-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  setNoteOpen(false);
                  navigate("/review");
                }}
                className="qz-btn qz-btn--ghost"
              >
                전체 오답 노트
                <i className="ri-arrow-right-line text-[13px] leading-none" />
              </button>
              <div className="flex items-center justify-end gap-2">
                <Link to="/books" className="qz-btn qz-btn--ghost">
                  책 쌓기 보기
                </Link>
                <button type="button" onClick={() => setNoteOpen(false)} className="qz-btn qz-btn--solid">
                  결과로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {pdfOpen && evidenceQuestion ? (
        <PdfPageDialog
          title={`${subject.subject} 기말범위`}
          pageLabel={evidenceQuestion.evidence}
          quote={evidenceQuestion.evidenceQuote ?? quizEvidence.quote}
          onClose={() => setPdfOpen(false)}
        />
      ) : null}
    </>
  );
}