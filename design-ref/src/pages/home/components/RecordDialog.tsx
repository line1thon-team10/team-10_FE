import { useEffect, useMemo, useState } from "react";
import type { TodayTask, TodayTaskRecordMode } from "@/pages/home/types";
import { clamp, pageBounds } from "@/pages/home/utils";

export type RecordResult = {
  mode: TodayTaskRecordMode;
  endPage: number;
};

type Props = {
  task: TodayTask;
  /** 집중 모드에서 측정한 시간(분) */
  measuredMinutes?: number;
  /** 이 태스크를 제외하고 오늘 이미 완료한 페이지 수 */
  otherDonePages: number;
  /** 오늘 계획한 전체 페이지 수 */
  totalPages: number;
  onClose: () => void;
  onSubmit: (result: RecordResult) => void;
};

const MODES: { id: TodayTaskRecordMode; label: string }[] = [
  { id: "done", label: "완료" },
  { id: "partial", label: "부분 완료" },
  { id: "missed", label: "못 함" },
];

const AI_EXAMPLE = "예: BST 삭제까지 했고 AVL은 못 했어";

export default function RecordDialog({
  task,
  measuredMinutes,
  otherDonePages,
  totalPages,
  onClose,
  onSubmit,
}: Props) {
  const plannedRange = task.plannedRange ?? task.pageRange;
  const bounds = useMemo(() => pageBounds(plannedRange), [plannedRange]);
  const fullPages = bounds.end - bounds.start + 1;

  const [mode, setMode] = useState<TodayTaskRecordMode>(() => {
    if (task.recordMode) return task.recordMode;
    if (typeof measuredMinutes === "number" && measuredMinutes < task.expectedMinutes) return "partial";
    return "done";
  });

  const [endPage, setEndPage] = useState(() => {
    if (task.recordMode === "partial") return bounds.start + task.pages - 1;
    if (typeof measuredMinutes === "number" && measuredMinutes < task.expectedMinutes) {
      const share = clamp(measuredMinutes / Math.max(task.expectedMinutes, 1), 0.2, 0.95);
      return bounds.start + Math.max(1, Math.round(fullPages * share)) - 1;
    }
    return bounds.end;
  });

  const [aiText, setAiText] = useState("");
  const [aiNote, setAiNote] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 말로 입력하면 1초 뒤에 페이지 범위로 이해합니다.
  useEffect(() => {
    const text = aiText.trim();
    if (!text) {
      setAiNote(null);
      return;
    }
    const timer = window.setTimeout(() => {
      const numbers = text.match(/\d+/g);
      const guessed = numbers ? Number(numbers[numbers.length - 1]) : Number.NaN;
      const target =
        Number.isFinite(guessed) && guessed > bounds.start && guessed <= bounds.end
          ? guessed
          : bounds.start + Math.max(1, Math.round(fullPages * 0.62)) - 1;
      setMode("partial");
      setEndPage(target);
      setAiNote(`p.${bounds.start}–${target}로 이해했어요. 맞나요?`);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [aiText, bounds.start, bounds.end, fullPages]);

  const safeEnd = clamp(endPage, bounds.start, bounds.end - 1);
  const completedPages =
    mode === "done" ? fullPages : mode === "partial" ? safeEnd - bounds.start + 1 : 0;
  const percent = Math.min(
    100,
    Math.round(((otherDonePages + completedPages) / Math.max(totalPages, 1)) * 100),
  );
  const invalid = mode === "partial" && (endPage <= bounds.start - 1 || endPage > bounds.end - 1);

  const remaining =
    mode === "partial"
      ? `p.${safeEnd + 1}–${bounds.end}`
      : mode === "missed"
        ? `p.${bounds.start}–${bounds.end}`
        : null;

  const guide = remaining
    ? `남은 ${remaining}는 내일 첫 태스크로 옮겨요. 이 기록으로 오늘 계획이 ${percent}%가 돼요.`
    : `남는 페이지가 없어요. 이 기록으로 오늘 계획이 ${percent}%가 돼요.`;

  const submit = () => {
    if (invalid) return;
    onSubmit({
      mode,
      endPage: mode === "done" ? bounds.end : mode === "partial" ? safeEnd : bounds.start - 1,
    });
  };

  return (
    <div className="hp-scope">
      <div
        className="hp-overlay"
        role="presentation"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="hp-modal hp-rise" role="dialog" aria-modal="true" aria-label="공부 기록">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[18px] leading-snug text-[var(--hp-ink)] md:text-[20px]">공부 기록</h2>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--hp-muted)]">
                <span className="font-semibold text-[var(--hp-ink-soft)]">{task.subject}</span>
                <span aria-hidden="true"> · </span>
                {task.unit}
                <span aria-hidden="true"> · </span>
                <span className="tabular-nums">{task.pageRange}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-lg border border-[var(--hp-line-strong)] text-[var(--hp-muted)] transition-colors hover:border-[var(--hp-ink-soft)] hover:text-[var(--hp-ink)]"
            >
              <i className="ri-close-line text-[15px] leading-none" />
            </button>
          </div>

          {typeof measuredMinutes === "number" ? (
            <p className="mt-3">
              <span className="hp-tag hp-tag--brand">
                <i className="ri-timer-flash-line text-[11px] leading-none" />
                집중 모드 {measuredMinutes}분 측정
              </span>
            </p>
          ) : null}

          <div className="mt-5">
            <p className="text-[12.5px] font-semibold text-[var(--hp-ink)]">어디까지 했어요?</p>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
              {MODES.map((item) => {
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    aria-pressed={active}
                    className={`hp-opt ${active ? "is-selected" : ""}`}
                  >
                    <span className="hp-dot" aria-hidden="true" />
                    <span className="whitespace-nowrap text-[12.5px] font-semibold text-[var(--hp-ink)]">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "partial" ? (
            <div className="mt-3.5 rounded-xl border border-[var(--hp-line)] bg-white/[0.02] px-3.5 py-3">
              <label
                htmlFor="record-end-page"
                className="text-[11.5px] font-medium text-[var(--hp-muted)]"
              >
                어디까지 봤어요?
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-[var(--hp-ink)]">
                <span className="tabular-nums text-[var(--hp-ink-soft)]">p.{bounds.start} ~</span>
                <input
                  id="record-end-page"
                  type="number"
                  inputMode="numeric"
                  min={bounds.start}
                  max={bounds.end - 1}
                  value={Number.isFinite(endPage) ? endPage : ""}
                  onChange={(event) => {
                    setEndPage(Number(event.target.value));
                    setAiNote(null);
                  }}
                  className="hp-field w-[92px] text-center tabular-nums"
                />
                <span className="text-[var(--hp-ink-soft)]">까지</span>
                <span className="ml-auto text-[11px] tabular-nums text-[var(--hp-muted)]">
                  {completedPages}p / 전체 {fullPages}p
                </span>
              </div>
            </div>
          ) : null}

          <div className="mt-3.5">
            <label htmlFor="record-ai" className="flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--hp-muted)]">
              <span className="hp-ai-mark" aria-hidden="true">AI</span>
              또는 말로 입력
            </label>
            <input
              id="record-ai"
              type="text"
              value={aiText}
              onChange={(event) => setAiText(event.target.value)}
              placeholder={AI_EXAMPLE}
              className="hp-field mt-2"
            />
            {aiNote ? (
              <p className="hp-rise mt-2 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--hp-brand-deep)]">
                <i className="ri-arrow-right-line mt-[3px] text-[12px] leading-none" />
                <span>{aiNote}</span>
              </p>
            ) : (
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--hp-muted)]">
                문장을 적으면 1초 뒤 페이지 범위로 바꿔 드려요.
              </p>
            )}
          </div>

          <div className="mt-3.5 rounded-xl border border-dashed border-[var(--hp-line-strong)] bg-white/[0.02] px-3.5 py-2.5">
            <p className="text-[11.5px] leading-relaxed text-[var(--hp-ink-soft)]">{guide}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="hp-meter w-full max-w-[220px]">
                <span style={{ width: `${percent}%` }} />
              </div>
              <span className="shrink-0 text-[10.5px] tabular-nums text-[var(--hp-muted)]">{percent}%</span>
            </div>
          </div>

          {invalid ? (
            <p className="mt-2 text-[11px] text-[#f0a595]">
              p.{bounds.start} ~ p.{bounds.end - 1} 사이의 페이지를 입력해 주세요.
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--hp-line)] pt-4">
            <button type="button" onClick={onClose} className="hp-btn hp-btn--ghost hp-btn--lg">
              취소
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={invalid}
              className="hp-btn hp-btn--solid hp-btn--lg"
            >
              기록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}