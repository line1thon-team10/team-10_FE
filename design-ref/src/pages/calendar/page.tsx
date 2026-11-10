import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "@/pages/home/home.css";
import "./calendar.css";
import CalendarHeader from "./components/CalendarHeader";
import WeekGrid from "./components/WeekGrid";
import EmptyTimeDialog from "@/pages/manage/components/EmptyTimeDialog";
import RescheduleDialog from "@/pages/manage/components/RescheduleDialog";
import DeleteScopeDialog from "./components/DeleteScopeDialog";
import type { DeleteScope } from "./components/DeleteScopeDialog";
import { calendarWeeks } from "@/mocks/calendar";
import type { CalBlock, CalWeek } from "./types";
import { blockRange, subjectChipClass } from "./utils";

const CURRENT_INDEX = Math.max(
  calendarWeeks.findIndex((week) => week.label === "이번 주"),
  0,
);

type FlowInfo = { day: number; start: string; end: string; title: string };

export default function CalendarPage() {
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState<CalWeek[]>(() =>
    calendarWeeks.map((week) => ({ ...week, blocks: week.blocks.map((block) => ({ ...block })) })),
  );
  const [weekIndex, setWeekIndex] = useState(CURRENT_INDEX);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flow, setFlow] = useState<"reschedule" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CalBlock | null>(null);
  const [emptyInfo, setEmptyInfo] = useState<{ slotLabel: string; title: string; subtitle: string } | null>(
    null,
  );
  const [flowInfo, setFlowInfo] = useState<FlowInfo | null>(null);
  const [toast, setToast] = useState("");
  const [title, setTitle] = useState("");
  const [addDay, setAddDay] = useState(2);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    document.title = "피뢰침 | 주간 캘린더";
    const desc = document.querySelector('meta[name="description"]');
    const text =
      "고정 일정 사이 빈 시간에 공부가 어떻게 들어갔는지 주간 시간표로 확인하고, 일정을 말로 추가해 다시 조정하는 피뢰침의 캘린더입니다.";
    if (desc) desc.setAttribute("content", text);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = text;
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const week = weeks[weekIndex];
  const selected = week.blocks.find((block) => block.id === selectedId) ?? null;
  const isFixed = selected ? selected.kind !== "study" && selected.kind !== "custom" : false;

  const setWeekBlocks = (next: CalBlock[]) => {
    setWeeks((prev) =>
      prev.map((item, index) => (index === weekIndex ? { ...item, blocks: next } : item)),
    );
  };

  const changeWeek = (next: number) => {
    if (next < 0 || next >= weeks.length) return;
    setWeekIndex(next);
    setSelectedId(null);
  };

  const deleteSelected = () => {
    if (!selected) return;
    setWeekBlocks(week.blocks.filter((block) => block.id !== selected.id));
    setSelectedId(null);
    setToast(
      selected.kind === "study"
        ? `${selected.title} 블록을 지웠어요. 비는 시간은 빈 시간 제안에서 다시 짤 수 있어요.`
        : "일정을 지웠어요. 남는 시간은 그대로 비워 두었습니다.",
    );
  };

  const toMin = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return (hour || 0) * 60 + (minute || 0);
  };
  const toTime = (value: number) =>
    `${String(Math.floor(value / 60) % 24).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

  // 공부 블록은 지우지 않고 다음 공부일로 미뤄요.
  const postponeSelected = () => {
    if (!selected) return;
    const subject = selected.subject ?? "";
    const laterDays = Array.from({ length: 6 }, (_, index) => selected.day + index + 1).filter(
      (day) => day <= 6,
    );
    const found = laterDays.find((day) =>
      week.blocks.some((block) => block.day === day && block.kind === "study" && block.subject === subject),
    );
    const targetDay = found ?? Math.min(selected.day + 1, 6);
    if (targetDay === selected.day) {
      setToast("이번 주에 옮길 다음 날이 없어요.");
      return;
    }
    const sameDay = week.blocks.filter(
      (block) => block.day === targetDay && block.kind === "study" && block.subject === subject,
    );
    const start = sameDay.length
      ? toTime(Math.min(...sameDay.map((block) => toMin(block.start))))
      : selected.start;
    const duration = Math.max(15, toMin(selected.end) - toMin(selected.start));
    const end = toTime(toMin(start) + duration);
    setWeekBlocks(
      week.blocks.map((block) =>
        block.id === selected.id ? { ...block, day: targetDay, start, end } : block,
      ),
    );
    const label = week.days[targetDay]?.date ?? "";
    setToast(`${subject} ${selected.unit ?? selected.title}을 ${label} 첫 태스크로 옮겼어요`);
    setSelectedId(null);
  };

  // 반복 고정 일정: 이번만 / 앞으로 모두를 고른 다음 빈 시간 3안을 보여줘요.
  const applyDeleteScope = (scope: DeleteScope) => {
    const target = deleteTarget;
    if (!target) return;
    setDeleteTarget(null);

    if (scope === "once") {
      setWeekBlocks(week.blocks.filter((block) => block.id !== target.id));
    } else {
      setWeeks((prev) =>
        prev.map((item, index) =>
          index < weekIndex
            ? item
            : {
                ...item,
                blocks: item.blocks.filter(
                  (block) =>
                    !(
                      block.kind === target.kind &&
                      block.title === target.title &&
                      block.start === target.start &&
                      block.end === target.end
                    ),
                ),
              },
        ),
      );
    }

    setSelectedId(null);
    const day = week.days[target.day];
    const slot = `${day?.date ?? ""}(${day?.label ?? ""}) ${target.start}–${target.end}`;
    setEmptyInfo({
      slotLabel: slot,
      title: `${slot}이 비었어요`,
      subtitle:
        scope === "all"
          ? `남은 ${day?.label ?? ""}요일 ${target.start}–${target.end}이 비어요`
          : `${target.title} 일정을 이번만 지웠어요. 빈 시간을 어떻게 쓸까요?`,
    });
  };

  const openDeleteDemo = () => {
    const target =
      week.blocks.find((block) => block.kind === "fixed" && block.title === "알바" && block.day === 4) ??
      week.blocks.find((block) => block.kind !== "study" && block.kind !== "custom");
    if (!target) {
      setToast("이번 주에는 지울 고정 일정이 없어요.");
      return;
    }
    setSelectedId(target.id);
    setDeleteTarget(target);
  };

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = title.trim();
    if (!value) {
      setNotice("추가할 일정을 먼저 적어 주세요. 예: 토요일 저녁에 팀플 회의 생겼어");
      return;
    }
    const block: CalBlock = {
      id: `custom-${Date.now()}`,
      day: addDay,
      start: "19:00",
      end: "21:00",
      title: value,
      kind: "custom",
      dashed: true,
      reason: "말로 추가한 일정이라 겹치는 공부 블록을 다시 조정했어요.",
    };
    setWeekBlocks([...week.blocks, block]);
    setSelectedId(block.id);
    setFlowInfo({ day: addDay, start: "19:00", end: "21:00", title: value });
    setFlow("reschedule");
    setTitle("");
    setNotice("");
  };

  return (
    <div className="hp-scope flex min-h-screen w-full flex-col bg-[var(--hp-paper)]">
      <CalendarHeader />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-14 pt-8 md:px-8 md:pt-9">
        <div className="hp-rise flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--hp-brand-deep)]">
              <i className="ri-calendar-line text-[13px] leading-none" />
              주간 캘린더 · {week.label}
            </p>
            <h1 className="mt-2.5 text-[26px] leading-tight text-[var(--hp-ink)] md:text-[32px]">{week.range}</h1>
            <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-[var(--hp-muted)]">
              고정 일정 사이 빈 시간에 공부가 들어가 있어요. 블록을 누르면 범위와 배치 이유가 보여요.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <div className="cl-toggle" role="group" aria-label="보기 전환">
              <button type="button" className="is-active" aria-pressed="true">
                주
              </button>
              <button
                type="button"
                onClick={() => navigate("/home?view=month")}
                className="cursor-pointer"
                aria-pressed="false"
              >
                월
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => changeWeek(weekIndex - 1)}
                disabled={weekIndex === 0}
                className="cl-btn cl-btn--ghost"
              >
                이전 주
              </button>
              <button
                type="button"
                onClick={() => changeWeek(CURRENT_INDEX)}
                className="cl-btn cl-btn--ghost"
              >
                이번 주
              </button>
              <button
                type="button"
                onClick={() => changeWeek(weekIndex + 1)}
                disabled={weekIndex === weeks.length - 1}
                className="cl-btn cl-btn--ghost"
              >
                다음 주
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_308px]">
          <section className="hp-rise hp-d1 rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-3 md:p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-[11.5px] font-medium tabular-nums text-[var(--hp-muted)]">{week.rangeShort}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-[var(--hp-muted)]">
                <i className="ri-drag-move-2-line text-[12px] leading-none" />
                블록을 누르면 오른쪽에 자세히 보여요
              </p>
            </div>
            <WeekGrid week={week} selectedId={selectedId} onSelect={setSelectedId} />
          </section>

          <aside className="flex flex-col gap-3.5">
            <section className="cl-card">
              <h2 className="text-[13.5px] font-semibold text-[var(--hp-ink)]">이번 주 공부</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {week.study.map((line) => (
                  <li key={line.subject} className="flex items-start gap-2 text-[12px] leading-relaxed">
                    <span className={`cl-dot mt-[6px] ${subjectChipClass(line.subject)}`} aria-hidden="true" />
                    <span className="min-w-0 text-[var(--hp-ink-soft)]">
                      <strong className="font-semibold text-[var(--hp-ink)]">{line.subject}</strong> {line.count}
                      <span className="text-[var(--hp-muted)]"> · {line.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="cl-card">
              <h2 className="text-[13.5px] font-semibold text-[var(--hp-ink)]">범례</h2>
              <ul className="mt-3 flex flex-col gap-2.5 text-[11.5px] text-[var(--hp-muted)]">
                <li className="flex items-center gap-2.5">
                  <span className="h-2.5 w-5 flex-none rounded-sm bg-white/[0.09] ring-1 ring-inset ring-white/[0.08]" />
                  고정 일정
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-2.5 w-5 flex-none rounded-sm border-l-[3px] border-l-[#4f46e5] bg-[rgba(79,70,229,0.2)]" />
                  공부 (왼쪽 띠 = 과목 색)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-2.5 w-5 flex-none rounded-sm border border-dashed border-[var(--hp-line-strong)] bg-white/[0.03]" />
                  말로 추가한 일정
                </li>
                <li className="flex items-center gap-2.5">
                  <i className="ri-arrow-right-line text-[13px] leading-none" />
                  공부 블록은 지우지 않고 미뤄요
                </li>
              </ul>
            </section>

            <section className="cl-card">
              <h2 className="text-[13.5px] font-semibold text-[var(--hp-ink)]">
                {selected ? "선택한 블록" : "블록을 누르면"}
              </h2>

              {selected ? (
                <div className="mt-3">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] font-semibold text-[var(--hp-ink)]">
                    <span className={`cl-dot ${subjectChipClass(selected.subject)}`} aria-hidden="true" />
                    {selected.title}
                  </p>
                  {selected.unit ? (
                    <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--hp-ink-soft)]">{selected.unit}</p>
                  ) : null}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-[var(--hp-line-strong)] px-2 py-0.5 text-[10.5px] tabular-nums text-[var(--hp-muted)]">
                      {blockRange(selected)}
                    </span>
                    {selected.pageRange ? (
                      <span className="rounded-full border border-[var(--hp-line-strong)] px-2 py-0.5 text-[10.5px] tabular-nums text-[var(--hp-muted)]">
                        {selected.pageRange}
                      </span>
                    ) : null}
                    {selected.minutes ? (
                      <span className="rounded-full border border-[var(--hp-line-strong)] px-2 py-0.5 text-[10.5px] text-[var(--hp-muted)]">
                        {selected.minutes}분
                      </span>
                    ) : null}
                  </div>
                  {selected.reason ? (
                    <p className="mt-3 rounded-lg border border-dashed border-[var(--hp-line-strong)] px-2.5 py-2 text-[11px] leading-relaxed text-[var(--hp-muted)]">
                      <i className="ri-sparkling-line mr-1 text-[11px] leading-none text-[var(--hp-brand-deep)]" />
                      {selected.reason}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!selected) return;
                        if (isFixed) setDeleteTarget(selected);
                        else if (selected.kind === "study") postponeSelected();
                        else deleteSelected();
                      }}
                      className="cl-btn cl-btn--ghost"
                    >
                      <i
                        className={`${isFixed || !selected || selected.kind !== "study" ? "ri-delete-bin-line" : "ri-arrow-right-line"} text-[12px] leading-none`}
                      />
                      {isFixed ? "이 고정 일정 지우기" : selected.kind === "study" ? "다음 공부일로 미루기" : "이 블록 지우기"}
                    </button>
                    <button type="button" onClick={() => setSelectedId(null)} className="cl-btn cl-btn--ghost">
                      선택 해제
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-[11.5px] leading-relaxed text-[var(--hp-muted)]">
                  <p className="rounded-lg border border-dashed border-[var(--hp-line-strong)] px-2.5 py-2">
                    자료구조 3단원 이진 탐색 트리 · AVL 트리
                    <br />
                    p.72–95 · 50분 · 시험 D–3, 교수님이 강조한 단원
                  </p>
                </div>
              )}
            </section>

            <section className="cl-card">
              <h2 className="text-[13.5px] font-semibold text-[var(--hp-ink)]">고정 일정을 지우면</h2>
              <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--hp-muted)]">
                빈 시간을 어떻게 쓸지 AI가 3안을 보여줘요. 반복 일정은 &lsquo;이번만 / 앞으로 모두&rsquo;를 고르고
                바꿔요.
              </p>
              <button type="button" onClick={openDeleteDemo} className="cl-btn cl-btn--ghost mt-3">
                예: 11/13 알바 삭제해 보기
                <i className="ri-arrow-right-line text-[12px] leading-none" />
              </button>
            </section>
          </aside>
        </div>

        <section className="hp-rise hp-d2 mt-5 rounded-2xl border border-dashed border-[var(--hp-line-strong)] bg-[var(--hp-card)] p-3.5 md:p-4">
          <form onSubmit={handleAdd} className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold text-[var(--hp-brand-deep)]">
              <span className="cl-ai-mark">AI</span>
              말로 일정 추가
            </span>
            <select
              value={addDay}
              onChange={(event) => setAddDay(Number(event.target.value))}
              aria-label="추가할 요일"
              className="cl-field box-border sm:w-[132px]"
            >
              {week.days.map((day, index) => (
                <option key={`${week.id}-add-${day.date}`} value={index}>
                  {day.date} ({day.label})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 목요일 저녁에 조모임 생겼어"
              aria-label="말로 일정 추가"
              className="cl-field box-border min-w-0 flex-1"
            />
            <button type="submit" className="cl-btn cl-btn--solid justify-center px-5 py-2.5">
              추가
            </button>
          </form>
          <p className="mt-2 flex items-start gap-1.5 px-0.5 text-[11px] leading-relaxed text-[var(--hp-muted)]">
            <i className="ri-information-line mt-0.5 text-[12px] leading-none" />
            {notice || "추가하면 19:00–21:00로 들어가고, 겹치는 공부 블록은 옆 날로 다시 조정해요."}
          </p>
        </section>
      </main>

      <footer className="border-t border-[var(--hp-line)] bg-[var(--hp-paper-warm)]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-[11.5px] text-[var(--hp-muted)] sm:flex-row md:px-8">
          <p>© 2026 피뢰침. 계획이 바뀌어도 기록은 그대로.</p>
          <p className="flex items-center gap-2">
            <span className="hp-chip hp-sub-data" aria-hidden="true" />
            공부 블록의 왼쪽 띠가 과목 색이에요
          </p>
        </div>
      </footer>

      {deleteTarget ? (
        <DeleteScopeDialog
          dateLabel={`${week.days[deleteTarget.day]?.date ?? ""}(${week.days[deleteTarget.day]?.label ?? ""})`}
          title={deleteTarget.title}
          timeLabel={`${deleteTarget.start}–${deleteTarget.end}`}
          onClose={() => setDeleteTarget(null)}
          onNext={applyDeleteScope}
        />
      ) : null}

      {emptyInfo ? (
        <EmptyTimeDialog
          slotLabel={emptyInfo.slotLabel}
          title={emptyInfo.title}
          subtitle={emptyInfo.subtitle}
          onClose={() => setEmptyInfo(null)}
          onApply={(optionId) => {
            setEmptyInfo(null);
            setToast(
              optionId === "et-move"
                ? "빈 시간에 다음 태스크를 넣는 안을 적용했어요. 캘린더에서 블록을 눌러 확인하세요."
                : "일정은 지우고 빈 시간은 그대로 두었어요. 나중에 다시 제안할게요.",
            );
          }}
        />
      ) : null}

      {flow === "reschedule" && flowInfo ? (
        <RescheduleDialog
          dateLabel={`${week.days[flowInfo.day]?.date ?? ""}(${week.days[flowInfo.day]?.label ?? ""})`}
          timeLabel={`${flowInfo.start}–${flowInfo.end}`}
          title={flowInfo.title.slice(0, 20)}
          onClose={() => setFlow(null)}
          onDraw={() => setFlow(null)}
          onApply={() => {
            setFlow(null);
            setToast("겹치는 공부를 금·토로 나눠 옮겼어요. 캘린더에서 점선 블록을 눌러 고칠 수 있어요.");
          }}
        />
      ) : null}

      {toast ? (
        <div className="cl-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}