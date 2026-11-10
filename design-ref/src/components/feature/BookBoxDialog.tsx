import { useEffect } from "react";
import "@/pages/home/home.css";

export type BoxNoticeState = {
  variant: "day" | "unit" | "recovery";
  /** 오늘 계획 진행률 */
  percent: number;
  /** 오늘 쌓인 책 권수 */
  books: number;
  subject?: string;
  unitLabel?: string;
};

type Props = BoxNoticeState & {
  onClose: () => void;
  onQuiz?: () => void;
  onBooks?: () => void;
  onPlan?: () => void;
};

const TONES = ["hp-bk-green", "hp-bk-blue", "hp-bk-red", "hp-bk-amber", "hp-bk-teal"];

/** 세 경우에만 뜨는 가운데 박스: 하루 마무리 · 단원 완료 · 회복 */
export default function BookBoxDialog({
  variant,
  percent,
  books,
  subject,
  unitLabel,
  onClose,
  onQuiz,
  onBooks,
  onPlan,
}: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const kicker = variant === "day" ? "오늘 마무리" : variant === "unit" ? "단원 완료" : "계획 회복";
  const title =
    variant === "day"
      ? `오늘 ${percent}% 했어요!`
      : variant === "unit"
        ? `${unitLabel ?? "이번 단원"} 다 쌓았어요`
        : "다시 제 속도예요";

  const desc =
    variant === "day"
      ? `오늘 쌓은 책 ${Math.max(books, 1)}권 · 계획한 범위를 충분히 채웠어요. 이제 퀴즈로 한 번만 확인할까요?`
      : variant === "unit"
        ? `${subject ?? "이번 과목"} ${unitLabel ?? "이번 단원"}의 마지막 태스크까지 끝냈어요. 책이 한 단 더 쌓였습니다.`
        : "밀린 분량을 다시 나눠 넣었어요. 이번 주 계획이 원래 속도로 돌아왔습니다.";

  const stack = variant === "day" ? Math.min(Math.max(books, 1), 5) : variant === "unit" ? 4 : 3;
  const label =
    variant === "day" ? "오늘 쌓은 책" : variant === "unit" ? "이번 단원에 쌓인 책" : "다시 맞춰진 계획";

  return (
    <div className="hp-scope">
      <div
        className="hp-overlay"
        role="presentation"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          className="hp-modal hp-modal--sm hp-rise text-center"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--hp-brand-deep)]">
            {kicker}
          </p>
          <h2 className="mt-2 text-[21px] leading-snug text-[var(--hp-ink)] md:text-[23px]">{title}</h2>
          <p className="mx-auto mt-2 max-w-[330px] text-[12px] leading-relaxed text-[var(--hp-muted)]">{desc}</p>

          <div className="mt-6 flex justify-center">
            <div className="hp-book-stack w-[186px]">
              {Array.from({ length: stack }).map((_, index) => (
                <span
                  key={`box-book-${index}`}
                  className={`hp-book hp-book--stack ${TONES[index % TONES.length]}`}
                  style={{ animationDelay: `${index * 90}ms` }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-[var(--hp-muted)]">
            <span className="hp-chip hp-bk-amber" aria-hidden="true" />
            {label}
            {variant === "day" ? ` · 오늘 계획 ${percent}%` : null}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={onClose} className="hp-btn hp-btn--ghost hp-btn--lg">
              닫기
            </button>
            {variant === "day" ? (
              <button type="button" onClick={onQuiz ?? onClose} className="hp-btn hp-btn--solid hp-btn--lg">
                <i className="ri-file-list-3-line text-[12px] leading-none" />
                오늘의 퀴즈 풀기
              </button>
            ) : null}
            {variant === "unit" ? (
              <button type="button" onClick={onBooks ?? onClose} className="hp-btn hp-btn--solid hp-btn--lg">
                <i className="ri-book-2-line text-[12px] leading-none" />
                책 쌓기 보기
              </button>
            ) : null}
            {variant === "recovery" ? (
              <button type="button" onClick={onPlan ?? onClose} className="hp-btn hp-btn--solid hp-btn--lg">
                <i className="ri-calendar-check-line text-[12px] leading-none" />
                바뀐 계획 보기
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}