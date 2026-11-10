import { useEffect } from "react";

type Props = {
  subject: string;
  unitLabel: string;
  books: number;
  onDone: () => void;
};

const TONES = ["hp-bk-green", "hp-bk-blue", "hp-bk-red", "hp-bk-amber"];

/** 기록 직후 우상단에 2초만 머무는 작은 알림: 오늘 칸에 책 한 권이 떨어집니다. */
export default function BookToast({ subject, unitLabel, books, onDone }: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2000);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="hp-scope">
      <div className="hp-toast" role="status" aria-live="polite">
        <div className="hp-toast__shelf" aria-hidden="true">
          <span className={`hp-book hp-book--toast ${TONES[0]}`} />
          <span className={`hp-book hp-book--toast ${TONES[1]}`} />
          <span className={`hp-book hp-book--toast ${TONES[2]}`} />
          <span className={`hp-book hp-book--toast hp-book--toast-drop ${TONES[3]}`} />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold leading-snug text-[var(--hp-ink)]">
            {subject} {unitLabel} 한 권 쌓았어요
          </p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-[var(--hp-muted)]">
            오늘 {books}권째 · 30분마다 한 권
          </p>
        </div>
      </div>
    </div>
  );
}