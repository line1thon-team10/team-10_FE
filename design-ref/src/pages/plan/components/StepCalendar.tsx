import { useMemo, useState, type FormEvent } from "react";
import { blockRange, minutesToTime, timeToMinutes } from "@/pages/plan/utils";
import { examSchedule, weekdayLabels } from "@/mocks/planSetup";
import type { PlanBlock, PlanWeek, PlanSubject } from "@/pages/plan/types";

const START_HOUR = 8;
const END_HOUR = 23;
const HOUR_HEIGHT = 42;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);

type Props = {
  week: PlanWeek;
  subjects: PlanSubject[];
  weekIndex: number;
  weekCount: number;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onThisWeek: () => void;
  onAddBlock: (payload: { title: string; day: number; start: string; end: string }) => void;
  onUpdateBlock: (id: string, patch: Partial<PlanBlock>) => void;
  onDeleteBlock: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

const KIND_CLASS: Record<PlanBlock["kind"], string> = {
  fixed: "ps-block--fixed",
  class: "ps-block--class",
  appointment: "ps-block--appointment",
  custom: "ps-block--custom",
};

export default function StepCalendar({
  week,
  weekIndex,
  weekCount,
  selectedBlockId,
  onSelectBlock,
  onPrevWeek,
  onNextWeek,
  onThisWeek,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onPrev,
  onNext,
}: Props) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(3);
  const [notice, setNotice] = useState("");
  const [showFree, setShowFree] = useState(false);

  const selectedBlock = week.blocks.find((block) => block.id === selectedBlockId) ?? null;

  const isFreeSlot = (dayIndex: number, hour: number) =>
    !week.blocks.some(
      (block) =>
        block.day === dayIndex &&
        timeToMinutes(block.start) < (hour + 1) * 60 &&
        timeToMinutes(block.end) > hour * 60,
    );

  const summary = useMemo(() => {
    const fixedMinutes = week.blocks.reduce(
      (total, block) => total + Math.max(0, timeToMinutes(block.end) - timeToMinutes(block.start)),
      0,
    );
    const totalWindow = 7 * (END_HOUR - START_HOUR) * 60;
    const freeMinutes = Math.max(0, totalWindow - fixedMinutes);
    let freeHours = 0;
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      HOURS.forEach((hour) => {
        if (isFreeSlot(dayIndex, hour)) freeHours += 1;
      });
    }
    return {
      fixed: Math.round(fixedMinutes / 60),
      free: Math.round(freeMinutes / 60),
      freeHours,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week.blocks]);

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = title.trim();
    if (!value) {
      setNotice("추가할 일정을 먼저 적어 주세요. 예: 토요일 저녁 7시 팀플 회의");
      return;
    }
    onAddBlock({ title: value, day, start: "19:00", end: "21:00" });
    setTitle("");
    setNotice("추가했어요. 공부는 다음 단계에서 빈 시간에만 넣어요.");
  };

  return (
    <div className="ps-rise">
      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[25px] leading-snug text-[var(--ps-ink)] md:text-[31px]">
            이렇게 정리했어요. 틀린 곳을 고쳐 주세요
          </h1>
          <p className="mt-2.5 max-w-[620px] text-[13px] leading-relaxed text-[var(--ps-muted)]">
            공부 계획은 비어 있는 시간에만 들어갑니다. 블록을 누르면 수정·삭제, 빈 칸을 누르면 추가할 수 있어요.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onPrev} className="ps-btn-ghost">
            이전
          </button>
          <button type="button" onClick={onNext} className="ps-btn-solid">
            다음: 자료 올리기
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.75fr_1fr]">
        <div className="ps-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ps-line)] px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="ps-ai-mark">AI</span>
              <h2 className="truncate text-[13px] font-semibold text-[var(--ps-ink)]">
                말한 내용을 정리한 캘린더 · {week.label}
              </h2>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowFree((prev) => !prev)}
                aria-pressed={showFree}
                className={`px-2.5 py-1.5 text-[11.5px] ${
                  showFree
                    ? "ps-btn-ghost border-[var(--ps-brand-line)] bg-[var(--ps-brand-tint)] text-[var(--ps-brand-deep)]"
                    : "ps-btn-ghost"
                }`}
              >
                <i className="ri-calendar-schedule-line text-[12px] leading-none" />
                {showFree ? "빈 시간 숨기기" : "빈 시간 찾기"}
              </button>
              <button
                type="button"
                onClick={onPrevWeek}
                disabled={weekIndex === 0}
                className="ps-btn-ghost px-2.5 py-1.5 text-[11.5px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                이전 주
              </button>
              <button type="button" onClick={onThisWeek} className="ps-btn-ghost px-2.5 py-1.5 text-[11.5px]">
                이번 주
              </button>
              <button
                type="button"
                onClick={onNextWeek}
                disabled={weekIndex === weekCount - 1}
                className="ps-btn-ghost px-2.5 py-1.5 text-[11.5px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음 주
              </button>
            </div>
          </div>

          <div className="px-3 pb-4 pt-3 sm:px-4">
            <p className="mb-2 px-1 text-[11px] text-[var(--ps-muted)]">{week.range}</p>
            <div className="ps-cal-scroll">
              <div className="ps-cal-min">
                <div className="ps-cal-head">
                  <span />
                  {weekdayLabels.map((label) => (
                    <span key={label} className="ps-cal-head-cell">
                      {label}
                    </span>
                  ))}
                </div>

                <div className="ps-cal-body">
                  <div className="ps-cal-axis">
                    {HOURS.map((hour) => (
                      <div key={hour} className="ps-cal-time" style={{ height: HOUR_HEIGHT }}>
                        {`${String(hour).padStart(2, "0")}:00`}
                      </div>
                    ))}
                  </div>

                  {weekdayLabels.map((label, dayIndex) => (
                    <div key={label} className="ps-cal-col">
                      {HOURS.map((hour) => (
                        <div key={hour} className="ps-cal-slot" style={{ height: HOUR_HEIGHT }}>
                          {showFree && isFreeSlot(dayIndex, hour) ? (
                            <span className="ps-free-slot">
                              <i className="ri-sun-line text-[10px] leading-none" />
                              빈 시간
                            </span>
                          ) : null}
                        </div>
                      ))}
                      {week.blocks
                        .filter((block) => block.day === dayIndex)
                        .map((block) => {
                          const start = timeToMinutes(block.start);
                          const end = timeToMinutes(block.end);
                          const top = ((start - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                          const height = Math.max(24, ((end - start) / 60) * HOUR_HEIGHT - 3);
                          if (top < 0) return null;
                          return (
                            <button
                              key={block.id}
                              type="button"
                              onClick={() => onSelectBlock(block.id)}
                              title={`${block.title} ${blockRange(block)}`}
                              className={`ps-block ${KIND_CLASS[block.kind]} ${
                                block.dashed && block.kind !== "custom" ? "border-dashed" : ""
                              } ${selectedBlockId === block.id ? "is-selected" : ""}`}
                              style={{ top, height }}
                            >
                              <span className="ps-block-title">{block.title}</span>
                              <span className="ps-block-time block">{blockRange(block)}</span>
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--ps-line)] px-4 py-4 sm:px-5">
            {selectedBlock ? (
              <div>
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <p className="text-[11.5px] font-semibold text-[var(--ps-brand-deep)]">선택한 일정 고치기</p>
                  <button
                    type="button"
                    onClick={() => onSelectBlock(null)}
                    className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-[var(--ps-muted)] hover:text-[var(--ps-ink)]"
                  >
                    <i className="ri-close-line text-[13px] leading-none" />
                    선택 해제
                  </button>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={selectedBlock.title}
                    onChange={(event) => onUpdateBlock(selectedBlock.id, { title: event.target.value })}
                    aria-label="일정 이름"
                    className="ps-field box-border min-w-0 flex-1"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={selectedBlock.start}
                      onChange={(event) =>
                        onUpdateBlock(selectedBlock.id, {
                          start: event.target.value,
                          end:
                            timeToMinutes(event.target.value) >= timeToMinutes(selectedBlock.end)
                              ? minutesToTime(timeToMinutes(event.target.value) + 60)
                              : selectedBlock.end,
                        })
                      }
                      aria-label="시작 시간"
                      className="ps-field w-[112px]"
                    />
                    <span className="text-[11px] text-[var(--ps-muted)]">–</span>
                    <input
                      type="time"
                      value={selectedBlock.end}
                      onChange={(event) => onUpdateBlock(selectedBlock.id, { end: event.target.value })}
                      aria-label="종료 시간"
                      className="ps-field w-[112px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteBlock(selectedBlock.id);
                      onSelectBlock(null);
                    }}
                    className="ps-btn-ghost justify-center border-[rgba(255,119,16,0.4)] text-[var(--ps-brand-deep)]"
                  >
                    <i className="ri-delete-bin-line text-[13px] leading-none" />
                    삭제
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdd}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="ps-ai-mark hidden sm:flex">AI</span>
                  <select
                    value={day}
                    onChange={(event) => setDay(Number(event.target.value))}
                    aria-label="추가할 요일"
                    className="ps-field box-border sm:w-[96px]"
                  >
                    {weekdayLabels.map((label, index) => (
                      <option key={label} value={index}>
                        {label}요일
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="예: 다음 주 목요일 저녁 7시 팀플 회의, 토요일 약속은 취소"
                    aria-label="말로 일정 추가"
                    className="ps-field box-border min-w-0 flex-1"
                  />
                  <button type="submit" className="ps-btn-solid justify-center px-5">
                    추가
                  </button>
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--ps-muted)]">
                  <i className="ri-information-line mt-0.5 text-[12px] leading-none" />
                  {notice || "추가하면 19:00–21:00로 들어가요. 점선 블록을 눌러 이름과 시간을 고칠 수 있어요."}
                </p>
              </form>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="ps-card p-5">
            <h2 className="text-[14px] font-semibold text-[var(--ps-ink)]">시험 일정</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {examSchedule.map((exam) => (
                <li key={exam.id} className="flex items-start gap-2 text-[12.5px] text-[var(--ps-ink-soft)]">
                  <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-[var(--ps-ink-soft)]" />
                  <span className="min-w-0">
                    <strong className="font-semibold text-[var(--ps-ink)]">{exam.date}</strong> {exam.subject}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ps-card p-5">
            <h2 className="text-[14px] font-semibold text-[var(--ps-ink)]">이번 주 요약</h2>
            <ul className="mt-3 flex flex-col gap-2">
              <li className="flex items-start gap-2 text-[12.5px] text-[var(--ps-ink-soft)]">
                <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-[var(--ps-ink-soft)]" />
                <span>
                  고정 일정 <strong className="font-semibold text-[var(--ps-ink)]">{summary.fixed}시간</strong>
                </span>
              </li>
              <li className="flex items-start gap-2 text-[12.5px] text-[var(--ps-ink-soft)]">
                <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-[var(--ps-ink-soft)]" />
                <span>
                  {showFree ? "이번 주 빈 시간 " : "공부 가능한 빈 시간 "}
                  <strong className="font-semibold text-[var(--ps-ink)]">{summary.freeHours}시간</strong>
                  {showFree ? " · 여기에 공부가 들어가요" : ""}
                </span>
              </li>
            </ul>
          </div>

          <div className="ps-card p-5">
            <h2 className="text-[14px] font-semibold text-[var(--ps-ink)]">범례</h2>
            <ul className="mt-3 flex flex-col gap-2.5 text-[12px] text-[var(--ps-muted)]">
              <li className="flex items-center gap-2.5">
                <span className="ps-legend-chip ps-legend-chip--fixed" />
                일정
              </li>
              <li className="flex items-center gap-2.5">
                <span className="ps-legend-chip ps-legend-chip--class" />
                수업
              </li>
              <li className="flex items-center gap-2.5">
                <span className="ps-legend-chip ps-legend-chip--appointment" />
                약속
              </li>
              <li className="flex items-center gap-2.5">
                <span className="ps-legend-chip ps-legend-chip--custom" />
                방금 말로 추가한 일정
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}