import { useState } from "react";
import type { QuizAnswer, QuizConfidence, QuizQuestion as QuizQuestionType, QuizSubject } from "@/pages/quiz/types";
import { quizHowTo } from "@/mocks/quiz";
import QuizGrading from "./QuizGrading";

type Props = {
  subject: QuizSubject;
  question: QuizQuestionType;
  index: number;
  answer: QuizAnswer;
  grading: boolean;
  onPickChoice: (choiceIndex: number) => void;
  onConfidence: (confidence: QuizConfidence) => void;
  onChangeText: (text: string) => void;
  onSubmitWritten: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** 맞춤 문제처럼 실제 출제 문항 수가 다를 때 */
  total?: number;
};

export default function QuizQuestion({
  subject,
  question,
  index,
  answer,
  grading,
  onPickChoice,
  onConfidence,
  onChangeText,
  onSubmitWritten,
  onPrev,
  onNext,
  total: totalProp,
}: Props) {
  const [error, setError] = useState("");
  const written = question.kind === "written";
  const total = totalProp ?? subject.questions.length;
  const percent = Math.round(((index + 1) / total) * 100);
  const submittedWritten = written && answer.submitted;

  const handleNext = (force = false) => {
    if (!force) {
      if (written) {
        if (answer.score === null) {
          setError("채점이 끝나면 다음 문제로 넘어갈 수 있어요.");
          return;
        }
      } else if (answer.choiceIndex === null) {
        setError("답을 하나 골라 주세요.");
        return;
      }
    }
    if (!answer.confidence) {
      setError("확신도를 골라 주세요. (필수)");
      return;
    }
    setError("");
    onNext();
  };

  const handleSubmit = () => {
    if (answer.text.trim().length < 5) {
      setError("답을 조금 더 적어 주세요.");
      return;
    }
    if (!answer.confidence) {
      setError("확신도를 골라 주세요. (필수)");
      return;
    }
    setError("");
    onSubmitWritten();
  };

  return (
    <div className="qz-rise">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--qz-brand-deep)]">
            <i className="ri-refresh-line text-[13px] leading-none" />
            오늘의 퀴즈 · {subject.subject}
          </p>
          <h1 className="mt-3 text-[26px] leading-tight text-[var(--qz-ink)] md:text-[30px]">오늘의 퀴즈</h1>
          <p className="mt-2 text-[12.5px] text-[var(--qz-muted)]">
            {subject.subject} {total}문항 · {question.unit} · 어제 오답 포함 (전부)
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="qz-chip">1회독 · 난이도 하</span>
          <span className="qz-chip">화면에 한 문제</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="qz-progress flex-1">
          <div className="qz-progress__bar" style={{ width: `${percent}%` }} />
        </div>
        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[var(--qz-muted)]">
          {index + 1} / {total}
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:gap-8">
        <section className="qz-card qz-card--dashed p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="qz-chip qz-chip--brand">{question.label}</span>
            <span className="qz-chip">{question.no}문항</span>
            <span className="qz-chip">{question.level}</span>
            <span className="qz-chip">근거 {question.evidence}</span>
            {question.fromYesterday ? <span className="qz-chip qz-chip--warn">어제 오답</span> : null}
          </div>

          <h2 className="mt-4 text-[19px] leading-snug text-[var(--qz-ink)] md:text-[22px]">{question.prompt}</h2>

          {written ? (
            <div className="mt-5">
              <label
                htmlFor={`quiz-answer-${question.id}`}
                className="mb-2 block text-[12.5px] font-semibold text-[var(--qz-ink-soft)]"
              >
                내 답
              </label>
              <textarea
                id={`quiz-answer-${question.id}`}
                className="qz-textarea"
                value={answer.text}
                onChange={(event) => onChangeText(event.target.value)}
                maxLength={500}
                disabled={submittedWritten}
                placeholder="배운 내용을 자기 말로 적어 보세요."
              />
              <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--qz-muted)]">
                문장 그대로가 아니라 핵심 개념이 들어 있는지로 채점해요 · 85점부터 정답
              </p>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-2">
              {question.choices.map((choice, choiceIndex) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => onPickChoice(choiceIndex)}
                  aria-pressed={answer.choiceIndex === choiceIndex}
                  className={`qz-option ${answer.choiceIndex === choiceIndex ? "is-selected" : ""}`}
                >
                  <span className="qz-dot" aria-hidden="true" />
                  <span className="min-w-0">{choice}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-5">
            <p className="text-[12.5px] font-semibold text-[var(--qz-ink-soft)]">
              얼마나 확실해요? <span className="text-[var(--qz-muted)]">(필수)</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onConfidence("sure")}
                aria-pressed={answer.confidence === "sure"}
                className={`qz-conf ${answer.confidence === "sure" ? "is-active" : ""}`}
              >
                <i className="ri-checkbox-blank-circle-line text-[12px] leading-none" />
                확실해요
              </button>
              <button
                type="button"
                onClick={() => onConfidence("unsure")}
                aria-pressed={answer.confidence === "unsure"}
                className={`qz-conf ${answer.confidence === "unsure" ? "is-active" : ""}`}
              >
                <i className="ri-checkbox-blank-circle-line text-[12px] leading-none" />
                애매해요
              </button>
            </div>
          </div>

          {error ? (
            <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-[#f0a595]">
              <i className="ri-error-warning-line text-[13px] leading-none" />
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--qz-line)] pt-4">
            <button
              type="button"
              onClick={onPrev}
              disabled={index === 0}
              className="qz-btn qz-btn--ghost"
            >
              이전 문제
            </button>
            {written && !submittedWritten ? (
              <button type="button" onClick={handleSubmit} className="qz-btn qz-btn--solid">
                제출
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNext()}
                disabled={written && answer.submitted && answer.score === null}
                className="qz-btn qz-btn--solid"
              >
                {written && answer.submitted && answer.score === null ? (
                  <>
                    <i className="ri-loader-4-line qz-spin text-[13px] leading-none" />
                    채점 중
                  </>
                ) : (
                  <>
                    {index === total - 1 ? "결과 보기" : "다음"}
                    <i className="ri-arrow-right-line text-[13px] leading-none" />
                  </>
                )}
              </button>
            )}
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          {written ? (
            <QuizGrading question={question} grading={grading} score={answer.score} />
          ) : (
            <>
              <section className="qz-card">
                <h3 className="text-[14px] text-[var(--qz-ink)]">정답은 끝에서 한 번에</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-[var(--qz-muted)]">
                  푸는 동안에는 맞았는지 보여주지 않아요. {total}문항을 다 풀면 결과 화면에서 정답·해설·근거 원문을
                  모두 봐요. 서술형은 제출하면 채점을 기다리지 않고 다음 문제로 넘어가요.
                </p>
              </section>

              <section className="qz-card">
                <h3 className="text-[14px] text-[var(--qz-ink)]">문항 구성</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {quizHowTo.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-[12px] leading-relaxed text-[var(--qz-muted)]">
                      <i className="ri-circle-fill mt-[6px] text-[3.5px] leading-none text-[var(--qz-brand)]" />
                      <span className="min-w-0">{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {grading ? (
            <section className="qz-card qz-card--soft">
              <h3 className="text-[13.5px] text-[var(--qz-ink)]">10초가 넘으면</h3>
              <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--qz-muted)]">
                채점이 늦어지고 있어요. 답은 저장했고, 채점되면 결과에 넣을게요.
              </p>
              <button type="button" onClick={() => handleNext(true)} className="qz-btn qz-btn--ghost mt-3 w-full">
                다음 문제로
              </button>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}