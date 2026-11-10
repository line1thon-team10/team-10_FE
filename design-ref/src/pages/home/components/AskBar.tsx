import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { askAnswer } from "@/mocks/todayStudy";
import { askBarPrompts } from "@/mocks/managePlan";
import AiWait from "@/components/feature/AiWait";
import PdfPageDialog from "@/components/feature/PdfPageDialog";

export default function AskBar() {
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [open, setOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = question.trim();
    if (!value) return;
    setAsked(value);
    setOpen(true);
    setQuestion("");
  };

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2 rounded-xl border border-dashed border-[var(--hp-line-strong)] bg-white/[0.02] p-2.5 sm:flex-row sm:items-center">
        <span className="flex h-6 flex-none items-center justify-center rounded-md bg-[var(--hp-solid)] px-1.5 text-[10.5px] font-extrabold tracking-wide text-[var(--hp-solid-ink)]">
          AI
        </span>
        <form onSubmit={submit} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="올린 자료 내용 무엇이든 물어보세요"
            aria-label="자료에 대해 물어보기"
            className="min-w-0 flex-1 rounded-lg border border-[var(--hp-line-strong)] bg-white/[0.03] px-3 py-2 text-[12px] text-[var(--hp-ink)] outline-none transition-colors placeholder:text-[#6f6a63] focus:border-[var(--hp-brand-line)]"
          />
          <button
            type="submit"
            disabled={!question.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--hp-solid)] px-4 py-2 text-[11.5px] font-semibold text-[var(--hp-solid-ink)] transition-colors hover:bg-[var(--hp-solid-hover)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            질문
          </button>
        </form>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {askBarPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              setQuestion(prompt);
              setAsked(prompt);
              setOpen(true);
            }}
            className="cursor-pointer whitespace-nowrap rounded-full border border-[var(--hp-line)] px-2.5 py-1 text-[11px] text-[var(--hp-muted)] transition-colors hover:border-[var(--hp-line-strong)] hover:text-[var(--hp-ink)]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {open ? (
        <div className="hp-rise mt-2.5 rounded-xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-3.5">
          <AiWait tone="home" bare label="AI가 올린 자료에서 근거를 찾고 있어요">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] text-[var(--hp-muted)]">“{asked}”</p>
              <h3 className="mt-1 text-[13.5px] font-semibold text-[var(--hp-ink)]">{askAnswer.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="답변 접기"
              className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-lg text-[var(--hp-muted)] transition-colors hover:bg-white/[0.07] hover:text-[var(--hp-ink)]"
            >
              <i className="ri-close-line text-[14px] leading-none" />
            </button>
          </div>

          <ul className="mt-2.5 flex flex-col gap-1.5">
            {askAnswer.lines.map((line) => (
              <li key={line} className="flex items-start gap-2 text-[12px] leading-relaxed text-[var(--hp-ink-soft)]">
                <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--hp-brand)]" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--hp-line)] pt-2.5">
            <button
              type="button"
              onClick={() => setPdfOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-[var(--hp-ink-soft)] transition-colors hover:bg-white/[0.07] hover:text-[var(--hp-ink)]"
            >
              <i className="ri-link text-[11px] leading-none" />
              {askAnswer.source}
            </button>
            <div className="flex items-center gap-1.5">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--hp-muted)] transition-colors hover:bg-white/[0.07] hover:text-[var(--hp-ink)]"
              >
                관련 퀴즈
              </Link>
              <Link
                to="/study"
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[var(--hp-solid)] px-2.5 py-1 text-[11px] font-semibold text-[var(--hp-solid-ink)] transition-colors hover:bg-[var(--hp-solid-hover)]"
              >
                자료 열기
              </Link>
            </div>
          </div>
          <p className="mt-2 text-[10.5px] text-[var(--hp-muted)]">{askAnswer.note}</p>
          </AiWait>
        </div>
      ) : null}

      {pdfOpen ? (
        <PdfPageDialog
          title="자료구조 기말범위 · 4단원"
          pageLabel="p.96–108"
          quote={askAnswer.lines[0]}
          onClose={() => setPdfOpen(false)}
        />
      ) : null}
    </div>
  );
}