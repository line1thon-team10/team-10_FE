import { useState } from "react";
import type { ReviewNote } from "@/pages/review/types";

type Props = {
  note: ReviewNote;
  onClose: () => void;
};

export default function RetryDialog({ note, onClose }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [revealed, setRevealed] = useState(false);

  const isChoice = note.kind === "객관식" || note.kind === "OX";
  const answered = isChoice ? picked !== null : text.trim().length > 0;
  const correct = isChoice ? picked === note.answerIndex : text.trim().length >= 12;

  const reset = () => {
    setPicked(null);
    setText("");
    setRevealed(false);
  };

  return (
    <div className="qz-overlay" role="dialog" aria-modal="true" aria-label={`${note.subject} 다시 풀기`}>
      <div className="qz-modal">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`qz-chip qz-accent-${note.accent}`}>
                <span className={`rv-dot rv-accent-${note.accent}`} aria-hidden="true" />
                {note.subject}
              </span>
              <span className="qz-chip">{note.kind}</span>
              <span className="qz-chip">근거 {note.page}</span>
            </div>
            <h2 className="mt-2.5 text-[17px] leading-snug text-[var(--qz-ink)]">{note.prompt}</h2>
            <p className="mt-1.5 text-[11.5px] text-[var(--qz-muted)]">
              {note.unit} · {note.history}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="qz-btn qz-btn--square">
            <i className="ri-close-line text-[15px] leading-none" />
          </button>
        </div>

        {isChoice ? (
          <div className="mt-4 flex flex-col gap-2">
            {note.options.map((option, index) => {
              const selected = picked === index;
              const isAnswer = revealed && index === note.answerIndex;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (!revealed) setPicked(index);
                  }}
                  aria-pressed={selected}
                  className={`qz-option ${selected ? "is-selected" : ""} ${
                    isAnswer ? "!border-[var(--qz-good-line)] !bg-[var(--qz-good-tint)]" : ""
                  }`}
                >
                  <span className="qz-dot" aria-hidden="true" />
                  <span className="min-w-0 flex-1">{option}</span>
                  {isAnswer ? <span className="qz-chip qz-chip--good shrink-0">정답</span> : null}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <label htmlFor={`retry-${note.id}`} className="mb-2 block text-[12px] font-semibold text-[var(--qz-ink-soft)]">
              내 답
            </label>
            <textarea
              id={`retry-${note.id}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={500}
              disabled={revealed}
              className="qz-textarea !min-h-[110px]"
              placeholder="배운 내용을 자기 말로 적어 보세요."
            />
          </div>
        )}

        {revealed ? (
          <div
            className={`mt-4 rounded-xl border px-3.5 py-3 ${
              correct
                ? "border-[var(--qz-good-line)] bg-[var(--qz-good-tint)]"
                : "border-[var(--qz-warn-line)] bg-[var(--qz-warn-tint)]"
            }`}
          >
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--qz-ink)]">
              <i
                className={`${correct ? "ri-checkbox-circle-line" : "ri-error-warning-line"} text-[13px] leading-none`}
              />
              {correct ? "이번엔 맞았어요 · 오답 횟수는 그대로 남아요" : "아직 헷갈려요 · 내일 다시 나와요"}
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[var(--qz-ink-soft)]">
              <span className="font-semibold text-[var(--qz-ink)]">정답 · </span>
              {note.answerText}
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--qz-muted)]">{note.explain}</p>
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--qz-line)] pt-4">
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--qz-muted)]">
            <i className="ri-refresh-line text-[12px] leading-none" />
            {note.schedule}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {revealed ? (
              <button type="button" onClick={reset} className="qz-btn qz-btn--ghost">
                한 번 더
              </button>
            ) : (
              <button type="button" onClick={onClose} className="qz-btn qz-btn--ghost">
                취소
              </button>
            )}
            {revealed ? (
              <button type="button" onClick={onClose} className="qz-btn qz-btn--solid">
                닫기
              </button>
            ) : (
              <button
                type="button"
                disabled={!answered}
                onClick={() => setRevealed(true)}
                className="qz-btn qz-btn--solid"
              >
                정답 보기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}