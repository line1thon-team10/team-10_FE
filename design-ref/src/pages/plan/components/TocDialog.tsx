import { useState } from "react";

type TocUnit = { title: string; startPage: number; endPage: number };

type Row = { id: string; title: string; start: string; end: string };

type Props = {
  subjectName: string;
  fileName?: string;
  onClose: () => void;
  onConfirm: (units: TocUnit[]) => void;
};

const RANGE_RE = /(\d{1,4})\s*(?:~|-|–|—|부터)\s*(\d{1,4})/;

const cleanTitle = (line: string, fallback: string) => {
  const trimmed = line
    .replace(RANGE_RE, " ")
    .replace(/p\.?\s*\d*/gi, " ")
    .replace(/[·:]+$/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s·:-]+|[\s·:-]+$/g, "")
    .trim();
  return trimmed || fallback;
};

/** 붙여 넣은 목차에서 "단원 이름 / 시작~끝 페이지"를 뽑아냅니다. */
const parseToc = (text: string): TocUnit[] => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed: TocUnit[] = [];
  lines.forEach((line, index) => {
    const found = line.match(RANGE_RE);
    if (!found) return;
    const startPage = Number(found[1]);
    const endPage = Math.max(startPage, Number(found[2]));
    parsed.push({ title: cleanTitle(line, `${index + 1}단원`), startPage, endPage });
  });

  if (parsed.length > 0) return parsed;

  // 페이지 범위를 못 찾으면 한 줄씩 20쪽으로 나눠 잡아 줍니다.
  return lines.map((line, index) => ({
    title: cleanTitle(line, `${index + 1}단원`),
    startPage: index * 20 + 1,
    endPage: index * 20 + 20,
  }));
};

let rowSeed = 0;
const nextRow = (): Row => {
  rowSeed += 1;
  return { id: `toc-row-${rowSeed}`, title: "", start: "", end: "" };
};

export default function TocDialog({ subjectName, fileName, onClose, onConfirm }: Props) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[]>(() => [nextRow()]);
  const [units, setUnits] = useState<TocUnit[]>([]);
  const [loading, setLoading] = useState(false);

  const rowUnits: TocUnit[] = rows
    .filter((row) => row.title.trim() && Number(row.start) > 0 && Number(row.end) > 0)
    .map((row) => {
      const startPage = Number(row.start);
      const endPage = Math.max(startPage, Number(row.end));
      return { title: row.title.trim(), startPage, endPage };
    });

  const finalUnits = units.length > 0 ? units : rowUnits;
  const totalPages = finalUnits.reduce((sum, unit) => sum + (unit.endPage - unit.startPage + 1), 0);

  const organize = () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    window.setTimeout(() => {
      setUnits(parseToc(text));
      setLoading(false);
    }, 1000);
  };

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  return (
    <div className="ps-overlay" role="presentation" onClick={onClose}>
      <div
        className="ps-modal ps-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-label="목차 직접 입력"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="ps-mark mt-0.5">
            <i className="ri-list-check-2 text-[14px] leading-none" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-[var(--ps-ink)]">목차를 직접 입력해 주세요</h2>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--ps-muted)]">
              {subjectName}
              {fileName ? ` · ${fileName}` : ""} · 목차를 붙여 넣거나 단원을 한 줄씩 적으면 그대로 단원이 돼요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="-mr-1 -mt-1 flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-md text-[var(--ps-muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--ps-ink)]"
          >
            <i className="ri-close-line text-[15px] leading-none" />
          </button>
        </div>

        <div className="mt-4">
          <label htmlFor="toc-paste" className="text-[11.5px] font-semibold text-[var(--ps-ink-soft)]">
            목차 붙여 넣기
          </label>
          <textarea
            id="toc-paste"
            name="toc"
            rows={5}
            maxLength={2000}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (units.length) setUnits([]);
            }}
            placeholder={"1단원 자료구조 개요 1~24\n2단원 배열과 연결 리스트 25~52\n3단원 스택과 큐 53~78"}
            className="ps-field mt-1.5 box-border resize-y leading-relaxed"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-[var(--ps-muted)]">페이지 범위가 없어도 한 줄에 단원 하나면 20쪽씩 잡아요.</p>
            <button
              type="button"
              onClick={organize}
              disabled={!text.trim() || loading}
              className="ps-btn-ghost px-3 py-1.5 text-[11.5px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? <i className="ri-loader-4-line animate-spin text-[12px] leading-none" /> : null}
              {loading ? "AI가 정리 중…" : "AI로 정리"}
            </button>
          </div>
        </div>

        {units.length > 0 ? (
          <div className="ps-card mt-3 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11.5px] font-semibold text-[var(--ps-ink)]">
                {units.length}개 단원 · {totalPages}쪽으로 정리했어요
              </p>
              <button
                type="button"
                onClick={() => {
                  setUnits([]);
                  setText("");
                }}
                className="cursor-pointer whitespace-nowrap text-[11px] font-medium text-[var(--ps-muted)] transition-colors hover:text-[var(--ps-ink)]"
              >
                다시 정리
              </button>
            </div>
            <ul className="mt-2.5 flex max-h-[190px] flex-col gap-1.5 overflow-y-auto pr-1">
              {units.map((unit, index) => (
                <li
                  key={`${unit.title}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-2.5 py-2"
                >
                  <span className="min-w-0 truncate text-[12px] text-[var(--ps-ink)]">
                    {index + 1}. {unit.title}
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-[var(--ps-muted)]">
                    p.{unit.startPage}–{unit.endPage}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11.5px] font-semibold text-[var(--ps-ink-soft)]">또는 한 줄씩 적기</p>
              <button
                type="button"
                onClick={() => setRows((prev) => [...prev, nextRow()])}
                className="ps-btn-ghost px-2.5 py-1.5 text-[11px]"
              >
                <i className="ri-add-line text-[12px] leading-none" />
                단원 추가
              </button>
            </div>

            <div className="mt-2 flex flex-col gap-1.5">
              {rows.map((row, index) => (
                <div key={row.id} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={row.title}
                    onChange={(event) => updateRow(row.id, { title: event.target.value })}
                    aria-label={`${index + 1}번째 단원 이름`}
                    placeholder="단원 이름"
                    className="ps-field box-border min-w-0 flex-1"
                  />
                  <input
                    type="number"
                    min={1}
                    value={row.start}
                    onChange={(event) => updateRow(row.id, { start: event.target.value })}
                    aria-label={`${index + 1}번째 단원 시작 페이지`}
                    placeholder="시작"
                    className="ps-field w-[66px] px-2 text-center"
                  />
                  <span className="text-[11px] text-[var(--ps-muted)]">~</span>
                  <input
                    type="number"
                    min={1}
                    value={row.end}
                    onChange={(event) => updateRow(row.id, { end: event.target.value })}
                    aria-label={`${index + 1}번째 단원 끝 페이지`}
                    placeholder="끝"
                    className="ps-field w-[66px] px-2 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== row.id) : prev))}
                    aria-label={`${index + 1}번째 단원 삭제`}
                    className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-md text-[var(--ps-muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--ps-ink)]"
                  >
                    <i className="ri-close-line text-[14px] leading-none" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="ps-note mt-3.5">
          <i className="ri-information-line mt-0.5 text-[12px] leading-none" />
          <span className="min-w-0">직접 입력한 범위는 퀴즈가 없어요.</span>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="ps-btn-ghost">
            취소
          </button>
          <button
            type="button"
            onClick={() => onConfirm(finalUnits)}
            disabled={finalUnits.length === 0}
            className="ps-btn-solid disabled:cursor-not-allowed disabled:opacity-40"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}