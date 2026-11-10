import { quizBookCaptions, quizUnitChanges } from "@/mocks/quiz";

type Props = {
  subject: string;
  total: number;
  correct: number;
  onClose: () => void;
  onShowBooks: () => void;
};

type Tone = "safe" | "wobble" | "weak";

const toneOf = (score: number): Tone => {
  if (score >= 80) return "safe";
  if (score >= 65) return "wobble";
  return "weak";
};

function BookStack({ tone, label }: { tone: Tone; label: string }) {
  return (
    <div className="flex w-[92px] flex-col items-center gap-1">
      <span className="qz-book qz-book--planned" />
      <span className="qz-book qz-book--done" />
      <span className={`qz-book qz-book--${tone}`} />
      <span className="mt-1 text-[10.5px] text-[var(--qz-muted)]">{label}</span>
    </div>
  );
}

export default function BookColorDialog({ subject, total, correct, onClose, onShowBooks }: Props) {
  return (
    <div className="qz-overlay" role="dialog" aria-modal="true" aria-label="퀴즈 결과로 달라진 책 색">
      <div className="qz-modal qz-rise">
        <h2 className="text-[20px] leading-snug text-[var(--qz-ink)] md:text-[22px]">
          퀴즈 결과로 책 색이 바뀌었어요
        </h2>
        <p className="mt-1.5 text-[12.5px] text-[var(--qz-muted)]">
          {subject} · {total}문항 중 {correct}개 정답
        </p>

        <div className="mt-5 flex flex-col gap-5">
          {quizUnitChanges.map((change) => (
            <div key={change.label} className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
              <div className="min-w-0">
                <p className="text-[13.5px] text-[var(--qz-ink)]">{change.label}</p>
                <p className="mt-1 text-[12px] tabular-nums text-[var(--qz-ink-soft)]">
                  {change.before} <span className="text-[var(--qz-muted)]">→</span>{" "}
                  <span className={change.after < change.before ? "text-[#f0a595]" : "text-[#8ecfa4]"}>
                    {change.after}
                  </span>
                </p>
                <p className="mt-0.5 text-[11.5px] text-[var(--qz-muted)]">{change.note}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <BookStack tone={toneOf(change.before)} label="퀴즈 전" />
                <i className="ri-arrow-right-line text-[16px] leading-none text-[var(--qz-muted)]" />
                <BookStack tone={toneOf(change.after)} label="퀴즈 후" />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[11.5px] leading-relaxed text-[var(--qz-muted)]">{quizBookCaptions}</p>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--qz-line)] pt-4">
          <button type="button" onClick={onShowBooks} className="qz-btn qz-btn--ghost">
            책 쌓기 보기
          </button>
          <button type="button" onClick={onClose} className="qz-btn qz-btn--solid">
            결과 자세히 보기
          </button>
        </div>
      </div>
    </div>
  );
}