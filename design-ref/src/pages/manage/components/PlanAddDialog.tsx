import { useMemo, useState } from "react";
import DialogShell from "@/pages/manage/components/DialogShell";
import { planPreviewBlocks, planPreviewNote } from "@/mocks/managePlan";
import type { AddedPlan } from "@/pages/manage/types";

type Props = {
  onClose: () => void;
  onAdd: (plan: Omit<AddedPlan, "id">) => void;
};

const STEP_LABELS = ["과목", "자료·범위", "목표 시간·분량", "반복 요일", "미리보기·확인"];
const SUBJECTS = ["컴퓨터네트워크", "자료구조", "운영체제", "새 과목 추가"];
const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function PlanAddDialog({ onClose, onAdd }: Props) {
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState("컴퓨터네트워크");
  const [material, setMaterial] = useState("컴퓨터네트워크_실습자료.pdf");
  const [range, setRange] = useState("p.15–45");
  const [pages, setPages] = useState(31);
  const [perDay, setPerDay] = useState(40);
  const [days, setDays] = useState<string[]>(["화", "목"]);
  const [period, setPeriod] = useState("11/10 ~ 11/12");

  const totalMinutes = useMemo(() => Math.max(0, Math.round(pages * 2.5)), [pages]);
  const perPage = pages > 0 ? (totalMinutes / pages).toFixed(1) : "0";

  const toggleDay = (day: string) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]));
  };

  const rows = [
    { step: 1, label: "과목", value: `${subject} (기존 과목)` },
    { step: 2, label: "자료·범위", value: `${material} · ${range} (${pages}p)` },
    {
      step: 3,
      label: "목표",
      value: `하루 ${perDay}분 · 예상 총 ${totalMinutes}분 (${perPage}분/p)`,
    },
    { step: 4, label: "반복", value: `${days.length > 0 ? days.join("·") : "요일 없음"} · ${period}` },
  ];

  const submit = () => {
    if (step < 5) {
      setStep(step + 1);
      return;
    }
    onAdd({
      subject: subject === "새 과목 추가" ? "새 과목" : subject,
      range: `${range} · ${pages}p`,
      minutes: totalMinutes,
      days: `${days.join("·")} 19:00–19:40`,
    });
  };

  return (
    <DialogShell
      wide
      label="계획 추가"
      title="계획 추가"
      subtitle="시험 계획 밖에서 따로 공부할 범위를 넣어요. 말로 남겨 쓰면 입력칸(S6-4)을 써요."
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="mg-btn mg-btn--ghost mg-btn--lg"
          >
            이전
          </button>
          <button type="button" onClick={submit} className="mg-btn mg-btn--solid mg-btn--lg">
            {step < 5 ? "다음 단계" : "추가하기"}
          </button>
        </>
      }
    >
      <div className="mg-steps">
        {STEP_LABELS.map((label, index) => {
          const current = index + 1 === step;
          const done = index + 1 < step;
          return (
            <span
              key={label}
              className={`mg-step ${done ? "is-done" : ""} ${current ? "is-current" : ""}`}
            >
              <span className="mg-step__mark">
                {done ? <i className="ri-check-line text-[10px] leading-none" /> : index + 1}
              </span>
              {label}
            </span>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1.02fr_0.98fr]">
        <div className="min-w-0">
          <h3 className="text-[12.5px] font-semibold text-[var(--mg-ink)]">입력한 내용</h3>

          <div className="mt-2">
            {rows.map((row) => (
              <div key={row.step} className="border-b border-[var(--mg-line)] py-2.5 last:border-b-0">
                <div className="grid grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-2">
                  <span className="text-[11.5px] text-[var(--mg-muted)]">{row.label}</span>
                  <span className="min-w-0 text-[12px] leading-relaxed text-[var(--mg-ink-soft)]">
                    {row.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(row.step)}
                    className={`mg-btn mg-btn--ghost px-2.5 py-1 text-[11px] ${
                      step === row.step ? "border-[var(--mg-brand-line)] text-[var(--mg-brand-deep)]" : ""
                    }`}
                  >
                    {row.step}단계 수정
                  </button>
                </div>

                {step === row.step && step < 5 ? (
                  <div className="mt-2.5 rounded-lg border border-[var(--mg-line)] bg-white/[0.02] p-3">
                    {step === 1 ? (
                      <label className="block">
                        <span className="text-[11px] text-[var(--mg-muted)]">과목</span>
                        <select
                          value={subject}
                          onChange={(event) => setSubject(event.target.value)}
                          className="mg-field box-border mt-1.5 cursor-pointer"
                        >
                          {SUBJECTS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}

                    {step === 2 ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={material}
                          onChange={(event) => setMaterial(event.target.value)}
                          aria-label="자료 이름"
                          className="mg-field box-border"
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            value={range}
                            onChange={(event) => setRange(event.target.value)}
                            aria-label="범위"
                            className="mg-field box-border min-w-0 flex-1"
                          />
                          <input
                            type="number"
                            min={1}
                            value={pages}
                            onChange={(event) => setPages(Math.max(1, Number(event.target.value) || 1))}
                            aria-label="페이지 수"
                            className="mg-field box-border sm:w-[104px]"
                          />
                        </div>
                      </div>
                    ) : null}

                    {step === 3 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-2 text-[11.5px] text-[var(--mg-muted)]">
                          하루
                          <input
                            type="number"
                            min={10}
                            step={5}
                            value={perDay}
                            onChange={(event) => setPerDay(Math.max(10, Number(event.target.value) || 10))}
                            aria-label="하루 목표 시간"
                            className="mg-field box-border w-[88px]"
                          />
                          분
                        </label>
                        <span className="text-[11.5px] text-[var(--mg-muted)]">
                          = 2.5분/p 기준 총 {totalMinutes}분
                        </span>
                      </div>
                    ) : null}

                    {step === 4 ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {WEEKDAYS.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              aria-pressed={days.includes(day)}
                              className={`h-8 w-8 cursor-pointer rounded-lg border text-[12px] font-semibold transition-colors ${
                                days.includes(day)
                                  ? "border-[var(--mg-brand-line)] bg-[var(--mg-brand-tint)] text-[var(--mg-brand-deep)]"
                                  : "border-[var(--mg-line-strong)] text-[var(--mg-muted)] hover:text-[var(--mg-ink)]"
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={period}
                          onChange={(event) => setPeriod(event.target.value)}
                          aria-label="반복 기간"
                          className="mg-field box-border"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-[var(--mg-muted)]">
            1단계에서 새 과목을 고르면 과목·자료·단원·분량 흐름으로 넘어가요. 2단계 범위는 PDF 목차에서 고르거나
            페이지를 직접 써도 돼요.
          </p>
        </div>

        <div className="mg-card--dashed min-w-0 rounded-[12px] p-3.5">
          <div className="flex items-center gap-2">
            <span className="mg-ai-mark">AI</span>
            <h3 className="text-[12.5px] font-semibold text-[var(--mg-ink)]">이렇게 넣을게요</h3>
          </div>

          <ul className="mt-3 flex flex-col gap-2">
            {planPreviewBlocks.map((block) => (
              <li key={block.id} className="mg-plan-item">
                <p className="text-[12px] font-semibold tabular-nums text-[var(--mg-ink)]">
                  {block.date} {block.time}
                </p>
                <p className="mt-1 text-[11.5px] tabular-nums text-[var(--mg-muted)]">
                  {block.range} · {block.pages} · {block.minutes}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[11px] leading-relaxed text-[var(--mg-muted)]">{planPreviewNote}</p>
        </div>
      </div>
    </DialogShell>
  );
}