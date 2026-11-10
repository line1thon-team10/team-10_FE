import { useEffect, useState } from "react";
import type { ReviewSubject, ReviewUnit } from "@/pages/review/types";
import { reviewLevels, reviewLockedNote } from "@/mocks/review";

type StartPayload = {
  subjectId: string;
  unitLabel: string;
  level: string;
};

type Props = {
  subjects: ReviewSubject[];
  onStart: (payload: StartPayload) => void;
};

const WEAK_UNIT: ReviewUnit = {
  id: "weak",
  label: "취약 개념만 모아서",
  reads: 2,
  range: "오답 2회 이상 개념",
};

export default function CustomQuizCard({ subjects, onStart }: Props) {
  const [subjectId, setSubjectId] = useState(subjects[0].id);
  const [unitId, setUnitId] = useState(WEAK_UNIT.id);
  const [level, setLevel] = useState("중");

  const subject = subjects.find((item) => item.id === subjectId) ?? subjects[0];
  const units = [WEAK_UNIT, ...subject.units];
  const unit = units.find((item) => item.id === unitId) ?? WEAK_UNIT;
  const locked = unit.reads < 2;

  useEffect(() => {
    if (locked) setLevel("하");
  }, [locked]);

  const pickSubject = (id: string) => {
    setSubjectId(id);
    setUnitId(WEAK_UNIT.id);
    setLevel("중");
  };

  const pickUnit = (next: ReviewUnit) => {
    setUnitId(next.id);
    setLevel(next.reads < 2 ? "하" : "중");
  };

  return (
    <section className="qz-card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--qz-brand-deep)]">
            <i className="ri-magic-line text-[13px] leading-none" />
            맞춤 문제 뽑기
          </p>
          <h2 className="mt-2 text-[19px] leading-snug text-[var(--qz-ink)] md:text-[21px]">
            약한 곳만 골라 5문항
          </h2>
          <p className="mt-1.5 max-w-[520px] text-[12px] leading-relaxed text-[var(--qz-muted)]">
            과목과 범위, 난이도를 고르면 그 조건으로 바로 퀴즈가 시작돼요. 2회독을 마친 범위만 난이도를 직접
            고를 수 있어요.
          </p>
        </div>
        <span className="qz-chip qz-chip--brand">
          <i className="ri-flashlight-line text-[12px] leading-none" />
          5문항 · 약 6분
        </span>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--qz-ink-soft)]">
            <span className="rv-step">1</span>
            과목
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {subjects.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pickSubject(item.id)}
                aria-pressed={item.id === subjectId}
                className={`qz-conf ${item.id === subjectId ? "is-active" : ""} rv-accent-${item.accent}`}
              >
                <span className="rv-dot" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--qz-ink-soft)]">
            <span className="rv-step">2</span>
            단원 · 범위
          </p>
          <div className="mt-2.5 flex flex-col gap-1.5">
            {units.map((item) => {
              const active = item.id === unitId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pickUnit(item)}
                  aria-pressed={active}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    active
                      ? "border-[var(--qz-brand-line)] bg-[var(--qz-brand-tint)]"
                      : "border-[var(--qz-line)] hover:border-[var(--qz-line-strong)]"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <i
                      className={`${
                        item.id === "weak" ? "ri-filter-3-line" : "ri-bookmark-line"
                      } text-[12px] leading-none ${active ? "text-[var(--qz-brand-deep)]" : "text-[var(--qz-muted)]"}`}
                    />
                    <span
                      className={`truncate text-[12px] font-medium ${
                        active ? "text-[var(--qz-ink)]" : "text-[var(--qz-ink-soft)]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[10.5px] tabular-nums text-[var(--qz-muted)]">{item.range}</span>
                    <span className={`qz-chip ${item.reads >= 2 ? "qz-chip--good" : ""}`}>{item.reads}회독</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-[var(--qz-line)] pt-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[12.5px] font-semibold text-[var(--qz-ink-soft)]">
            <span className="rv-step">3</span>
            난이도
          </p>
          <div className="mt-2.5 flex max-w-[280px] gap-2">
            {reviewLevels.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLevel(item)}
                disabled={locked && item !== "하"}
                aria-pressed={level === item}
                className={`rv-level ${level === item ? "is-active" : ""}`}
              >
                {item}
              </button>
            ))}
          </div>
          {locked ? (
            <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--qz-muted)]">
              <i className="ri-lock-line mt-[2px] text-[12px] leading-none text-[var(--qz-warn)]" />
              {reviewLockedNote}
            </p>
          ) : (
            <p className="mt-2 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--qz-muted)]">
              <i className="ri-checkbox-circle-line mt-[2px] text-[12px] leading-none text-[var(--qz-good)]" />
              2회독을 마친 범위예요. 상·중·하를 자유롭게 고를 수 있어요.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <span className="qz-chip justify-center">
            {subject.label} · {unit.label} · {level}
          </span>
          <button
            type="button"
            onClick={() =>
              onStart({
                subjectId: subject.id,
                unitLabel: unit.id === "weak" ? "취약 개념" : unit.label,
                level,
              })
            }
            className="qz-btn qz-btn--solid"
          >
            <i className="ri-file-list-3-line text-[13px] leading-none" />
            5문항 만들기
          </button>
        </div>
      </div>
    </section>
  );
}