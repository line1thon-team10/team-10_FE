import { useEffect } from "react";

type Props = {
  /** "p.82" 처럼 근거 페이지 */
  pageLabel: string;
  /** 노란 줄로 강조할 인용 문장 */
  quote: string;
  title?: string;
  onClose: () => void;
};

/** 근거 페이지를 크게 보여주는 팝업: 페이지 자리표시 + 노란 하이라이트 줄 */
export default function PdfPageDialog({ pageLabel, quote, title = "원본 PDF", onClose }: Props) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[86] flex items-center justify-center overflow-y-auto bg-[rgba(6,6,8,0.8)] p-4 backdrop-blur-sm"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="my-auto w-full max-w-[720px] rounded-2xl border border-[#3a3a41] bg-[#151518] p-4 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)] md:p-5"
        role="dialog"
        aria-modal="true"
        aria-label={`${title} ${pageLabel}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ffa257]">원본 PDF</p>
            <h2 className="mt-1.5 truncate text-[16px] font-semibold text-[#f2ece1]">
              {title} · {pageLabel}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="PDF 닫기"
            className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-lg border border-[#3a3a41] text-[#96918a] transition-colors hover:border-[#d9d3c8] hover:text-[#f2ece1]"
          >
            <i className="ri-close-line text-[15px] leading-none" />
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-[#f7f2e6] p-4 text-[#2a2723] md:p-6">
          <div className="flex items-center justify-between text-[10.5px] text-[#8a8377]">
            <span>피뢰침 · 기말 대비 자료</span>
            <span className="tabular-nums">{pageLabel}</span>
          </div>

          <div className="mt-4 flex flex-col gap-2" aria-hidden="true">
            <span className="block h-2 w-[68%] rounded-sm bg-[#e2dbcb]" />
            <span className="block h-2 w-[92%] rounded-sm bg-[#e2dbcb]" />
            <span className="block h-2 w-[84%] rounded-sm bg-[#e2dbcb]" />
          </div>

          <p className="mt-3 border-l-4 border-[#e2b53f] bg-[#ffe9a8] px-3 py-2.5 text-[12.5px] leading-relaxed text-[#3a3225]">
            {quote}
          </p>

          <div className="mt-3 flex flex-col gap-2" aria-hidden="true">
            <span className="block h-2 w-[76%] rounded-sm bg-[#e2dbcb]" />
            <span className="block h-2 w-[58%] rounded-sm bg-[#e2dbcb]" />
            <span className="block h-2 w-[88%] rounded-sm bg-[#e2dbcb]" />
            <span className="block h-2 w-[40%] rounded-sm bg-[#e2dbcb]" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] leading-relaxed text-[#96918a]">
            노란 줄 = 해설의 근거로 쓴 문장 · 실제 파일이 연결되면 이 자리에 원문이 보여요.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f2ece1] px-3.5 py-1.5 text-[11.5px] font-semibold text-[#141416] transition-colors hover:bg-white"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}