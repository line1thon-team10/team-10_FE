import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./home.css";
import HomeHeader from "./components/HomeHeader";
import WeekShelf from "./components/WeekShelf";
import MonthShelf from "./components/MonthShelf";
import MonthReport from "./components/MonthReport";
import DayDetail from "./components/DayDetail";
import TodayPanel from "./components/TodayPanel";
import WeeklyReport from "./components/WeeklyReport";
import { studyWeeks } from "@/mocks/weeklyStudy";
import { studyMonths } from "@/mocks/monthlyStudy";
import { todayOverview, todayTasks } from "@/mocks/todayStudy";
import {
  demoCatchUpAlertEnabled,
  demoCatchUpOverview,
  demoDay1110Overview,
  demoDay1110Tasks,
  demoMissedOverview,
  demoMissedTasks,
  demoNextDayOverview,
  demoNextDayTasks,
  demoPaceAlertEnabled,
} from "@/mocks/demoStates";
import type { StudyMonth, StudyWeek, TodayTask, TodayOverview } from "./types";
import { defaultDayKey, formatHours, formatMinutes, pageBounds } from "./utils";
import RecordDialog from "./components/RecordDialog";
import type { RecordResult } from "./components/RecordDialog";
import BookToast from "./components/BookToast";
import BookBoxDialog from "@/components/feature/BookBoxDialog";
import type { BoxNoticeState } from "@/components/feature/BookBoxDialog";
import PaceDialog from "@/pages/manage/components/PaceDialog";

const weeks = studyWeeks as StudyWeek[];
const months = studyMonths as StudyMonth[];
const CURRENT_INDEX = Math.max(
  weeks.findIndex((week) => week.label === "이번 주"),
  0,
);
const MONTH_START_INDEX = Math.max(
  months.findIndex((item) => item.days.some((day) => day.today)),
  0,
);

type ViewMode = "week" | "month";

const initialView = (): ViewMode => {
  if (typeof window === "undefined") return "week";
  return new URLSearchParams(window.location.search).get("view") === "month" ? "month" : "week";
};

const SESSION_TONES: Record<string, string> = {
  자료구조: "hp-sub-data",
  운영체제: "hp-sub-os",
  컴퓨터네트워크: "hp-sub-net",
};
const FALLBACK_TONES = ["hp-sub-data", "hp-sub-os", "hp-sub-net"];

/** 하루 마무리 박스는 하루에 한 번만 */
const DAY_END_KEY = "pyo:dayend:2026-11-06";
/** 하루 한 번만 자동 제안(분배안/속도 보정)을 띄우기 위한 키 */
const ALERT_SHOWN_KEY = "pyo:alert-shown:2026-11-09";

const dayEndAlreadyShown = () => {
  try {
    return window.localStorage.getItem(DAY_END_KEY) === "1";
  } catch {
    return false;
  }
};

const markDayEndShown = () => {
  try {
    window.localStorage.setItem(DAY_END_KEY, "1");
  } catch {
    /* 저장할 수 없으면 이번 한 번만 보여줍니다. */
  }
};

const alertAlreadyShown = () => {
  try {
    return window.localStorage.getItem(ALERT_SHOWN_KEY) === "1";
  } catch {
    return false;
  }
};

const markAlertShown = () => {
  try {
    window.localStorage.setItem(ALERT_SHOWN_KEY, "1");
  } catch {
    /* 저장할 수 없으면 이번 한 번만 보여줍니다. */
  }
};

/** 밤 11시 30분이 지났는지 */
const isLateNight = () => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 23 * 60 + 30 || minutes < 3 * 60;
};

/** "3단원 트리 · 이진 탐색 트리" → "3단원" */
const unitLabelOf = (unit: string) => {
  const matched = unit.match(/(\d+)\s*단원/g);
  if (!matched || matched.length === 0) return "이번 단원";
  const last = matched[matched.length - 1].match(/\d+/);
  return `${last?.[0] ?? "1"}단원`;
};

type ViewSwitchProps = {
  view: ViewMode;
  onChange: (next: ViewMode) => void;
};

function ViewSwitch({ view, onChange }: ViewSwitchProps) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-[var(--hp-line-strong)] p-1"
      role="group"
      aria-label="보기 전환"
    >
      <button
        type="button"
        onClick={() => onChange("week")}
        aria-pressed={view === "week"}
        className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
          view === "week"
            ? "bg-[var(--hp-solid)] text-[var(--hp-solid-ink)]"
            : "text-[var(--hp-muted)] hover:text-[var(--hp-ink)]"
        }`}
      >
        주간 보기
      </button>
      <button
        type="button"
        onClick={() => onChange("month")}
        aria-pressed={view === "month"}
        className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
          view === "month"
            ? "bg-[var(--hp-solid)] text-[var(--hp-solid-ink)]"
            : "text-[var(--hp-muted)] hover:text-[var(--hp-ink)]"
        }`}
      >
        월간 보기
      </button>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<TodayTask[]>(() => todayTasks.map((task) => ({ ...task })));
  const [recordTarget, setRecordTarget] = useState<{ taskId: string; measuredMinutes?: number } | null>(null);
  const [bookToast, setBookToast] = useState<{ subject: string; unitLabel: string; books: number } | null>(null);
  const [dropSignal, setDropSignal] = useState(0);
  const [boxNotice, setBoxNotice] = useState<BoxNoticeState | null>(null);
  const [view, setView] = useState<ViewMode>(initialView);
  const [weekIndex, setWeekIndex] = useState(CURRENT_INDEX);
  const [selectedKey, setSelectedKey] = useState(() => defaultDayKey(weeks[CURRENT_INDEX]));
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = useState(() => defaultDayKey(months[MONTH_START_INDEX]));
  const [reportOpen, setReportOpen] = useState(false);
  const [paceOpen, setPaceOpen] = useState(false);
  const [autoCatch, setAutoCatch] = useState(false);

  const week = weeks[weekIndex];
  const month = months[MONTH_START_INDEX];
  const demoRaw = searchParams.get("demo");
  const demoMode =
    demoRaw === "1110" || demoRaw === "pre" || demoRaw === "catchup" || demoRaw === "nextday" || demoRaw === "pace"
      ? demoRaw
      : null;
  const demoOverview =
    demoMode === "catchup"
      ? demoCatchUpOverview
      : demoMode === "nextday"
        ? demoNextDayOverview
        : demoMode === "pre"
          ? demoMissedOverview
          : demoMode === "1110"
            ? demoDay1110Overview
            : todayOverview;
  const selectedDay = week.days.find((day) => day.key === selectedKey) ?? week.days[0];
  const selectedMonthDay = month.days.find((day) => day.key === selectedMonthKey) ?? month.days[0];
  const today = weeks[CURRENT_INDEX].days.find((day) => day.today);
  const nextTask = tasks.find((task) => task.status !== "done") ?? tasks[0];

  const studiedMinutes = tasks.reduce((sum, task) => sum + task.studiedMinutes, 0);
  const overview: TodayOverview = {
    ...demoOverview,
    studiedMinutes,
    books: Math.round(studiedMinutes / 30),
  };
  const totalPages = tasks.reduce((sum, task) => sum + task.plannedPages, 0);
  const donePages = tasks.reduce((sum, task) => sum + task.donePages, 0);
  const pagePercent = totalPages ? Math.round((donePages / totalPages) * 100) : 0;
  const recordTask = recordTarget ? tasks.find((task) => task.id === recordTarget.taskId) ?? null : null;

  // 집중 모드에서 넘어온 기록 요청은 한 번만 팝업으로 열고 주소에서 지웁니다.
  useEffect(() => {
    const recordId = searchParams.get("record");
    if (!recordId) return;
    const minutesRaw = Number(searchParams.get("minutes"));
    if (tasks.some((task) => task.id === recordId)) {
      setRecordTarget({
        taskId: recordId,
        measuredMinutes:
          Number.isFinite(minutesRaw) && minutesRaw > 0 ? Math.round(minutesRaw) : undefined,
      });
    }
    const next = new URLSearchParams(searchParams);
    next.delete("record");
    next.delete("minutes");
    setSearchParams(next, { replace: true });
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = reportOpen ? "피뢰침 | 월간 리포트" : "피뢰침 | 오늘의 공부 · 이번 주 기록";
    const desc = document.querySelector('meta[name="description"]');
    const text = reportOpen
      ? "한 달 동안 공부한 날, 계획 달성, 공부 시간, 퀴즈 문항과 단원 등급을 숫자로 정리한 월간 리포트입니다."
      : "오늘 할 공부를 과목·범위별로 시작하고, 하루에 공부한 만큼 책이 쌓이는 이번 주 기록과 월간 책장을 한 화면에서 확인하세요.";
    if (desc) desc.setAttribute("content", text);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = text;
      document.head.appendChild(meta);
    }
  }, [reportOpen]);

  // 데모 상태를 고르면 그날의 오늘 할 일로 바꿔 줍니다.
  useEffect(() => {
    setRecordTarget(null);
    setBoxNotice(null);
    setBookToast(null);
    if (demoMode === "1110") {
      setTasks(demoDay1110Tasks.map((task) => ({ ...task })));
    } else if (demoMode === "nextday") {
      setTasks(demoNextDayTasks.map((task) => ({ ...task })));
    } else if (demoMode === "pre" || demoMode === "catchup") {
      setTasks(demoMissedTasks.map((task) => ({ ...task })));
    } else {
      setTasks(todayTasks.map((task) => ({ ...task })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  // 밤 11시 30분이 지났고 오늘 계획이 70% 이상이면 하루 마무리 박스를 한 번 띄웁니다.
  useEffect(() => {
    if (!isLateNight() || pagePercent < 70 || dayEndAlreadyShown()) return;
    markDayEndShown();
    setBoxNotice({ variant: "day", percent: pagePercent, books: Math.round(studiedMinutes / 30) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 하루 한 번, 밀림 분배안 → 속도 보정 순서로 하나만 자동으로 띄웁니다.
  useEffect(() => {
    if (demoMode === "pace") {
      setPaceOpen(true);
      return;
    }
    if (demoMode === "catchup") {
      setAutoCatch(true);
      return;
    }
    if (demoMode) return;
    const paceTarget = demoPaceAlertEnabled;
    const catchTarget = demoCatchUpAlertEnabled;
    if (!paceTarget && !catchTarget) return;
    if (alertAlreadyShown()) return;
    markAlertShown();
    if (catchTarget) setAutoCatch(true);
    else setPaceOpen(true);
  }, [demoMode]);

  const scrollToRecords = () => {
    window.requestAnimationFrame(() => {
      const target = document.getElementById("records");
      if (!target) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  };

  const moveWeek = (next: number) => {
    if (next < 0 || next >= weeks.length) return;
    setWeekIndex(next);
    setSelectedKey(defaultDayKey(weeks[next]));
    setShowDetail(false);
  };

  const switchView = (next: ViewMode) => {
    if (next === view) return;
    setView(next);
    setShowDetail(false);
    setReportOpen(false);
    navigate(next === "month" ? "/home?view=month" : "/home", { replace: true });
    scrollToRecords();
  };

  const selectDay = (key: string) => {
    setSelectedKey(key);
    setShowDetail(true);
    scrollToRecords();
  };

  const summaryMinutes = selectedMonthDay.sessions.reduce((sum, session) => sum + session.minutes, 0);

  const submitRecord = (result: RecordResult) => {
    if (!recordTask || !recordTarget) {
      setRecordTarget(null);
      return;
    }
    const plannedRange = recordTask.plannedRange ?? recordTask.pageRange;
    const bounds = pageBounds(plannedRange);
    const fullPages = bounds.end - bounds.start + 1;
    const measured = recordTarget.measuredMinutes;
    const estimateFor = (doneNow: number) =>
      measured ?? (recordTask.recordMode ? 0 : Math.round(recordTask.expectedMinutes * doneNow));

    let recordedPages = 0;

    const nextTasks: TodayTask[] = tasks.map((task) => {
      if (task.id !== recordTask.id) return task;

      if (result.mode === "done") {
        recordedPages = fullPages;
        return {
          ...task,
          status: "done",
          pageRange: `p.${bounds.start}–${bounds.end}`,
          pages: fullPages,
          donePages: fullPages,
          studiedMinutes: task.studiedMinutes + estimateFor(0.85),
          recordMode: "done",
          recordNote: "완료로 기록했어요",
        };
      }

      if (result.mode === "partial") {
        const donePagesNow = Math.max(1, Math.min(result.endPage - bounds.start + 1, fullPages));
        recordedPages = donePagesNow;
        return {
          ...task,
          status: "partial",
          pageRange: `p.${bounds.start}–${bounds.start + donePagesNow - 1}`,
          plannedRange,
          pages: donePagesNow,
          donePages: donePagesNow,
          studiedMinutes:
            task.studiedMinutes + estimateFor(donePagesNow / Math.max(fullPages, 1)),
          recordMode: "partial",
          recordNote: `남은 p.${bounds.start + donePagesNow}–${bounds.end}는 내일 첫 태스크로 옮겼어요`,
        };
      }

      return {
        ...task,
        status: task.status === "done" ? "pending" : task.status,
        donePages: 0,
        studiedMinutes: task.studiedMinutes + (measured ?? 0),
        recordMode: "missed",
        recordNote: `오늘 범위 p.${bounds.start}–${bounds.end}를 내일 첫 태스크로 옮겼어요`,
      };
    });

    const nextStudied = nextTasks.reduce((sum, task) => sum + task.studiedMinutes, 0);
    const nextTotal = nextTasks.reduce((sum, task) => sum + task.plannedPages, 0);
    const nextDone = nextTasks.reduce((sum, task) => sum + task.donePages, 0);
    const nextPercent = nextTotal ? Math.round((nextDone / nextTotal) * 100) : 0;

    setTasks(nextTasks);
    setRecordTarget(null);

    if (recordedPages > 0) setDropSignal((prev) => prev + 1);

    const submitted = nextTasks.find((task) => task.id === recordTask.id);
    const allRecorded = nextTasks.every((task) => Boolean(task.recordMode));
    const unitTotal = recordTask.unitTaskCount ?? 1;
    const unitDone = (recordTask.unitTaskDone ?? 0) + 1;
    const unitComplete = submitted?.status === "done" && unitDone >= unitTotal;
    const todayBooks = Math.round(nextStudied / 30);

    // 1) 하루 마무리: 오늘 태스크를 다 기록했고 계획의 70% 이상이면 하루 한 번
    if (allRecorded && nextPercent >= 70 && !dayEndAlreadyShown()) {
      markDayEndShown();
      setBoxNotice({ variant: "day", percent: nextPercent, books: todayBooks });
      return;
    }

    // 2) 단원 마지막 태스크를 끝낸 경우
    if (unitComplete) {
      setBoxNotice({
        variant: "unit",
        percent: nextPercent,
        books: todayBooks,
        subject: recordTask.subject,
        unitLabel: unitLabelOf(recordTask.unit),
      });
      return;
    }

    // 3) 그 밖에는 책 한 권이 떨어지고 작은 알림만 2초
    if (recordedPages > 0) {
      setBookToast({
        subject: recordTask.subject,
        unitLabel: unitLabelOf(recordTask.unit),
        books: todayBooks,
      });
    }
  };

  return (
    <div className="hp-scope flex min-h-screen w-full flex-col bg-[var(--hp-paper)]">
      <HomeHeader />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-14 pt-8 md:px-8 md:pt-10">
        <section className="hp-rise flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold tracking-wide text-[var(--hp-muted)]">
                  <i className="ri-flashlight-line text-[13px] leading-none text-[var(--hp-brand)]" />
                  {overview.date} · 자료구조 시험 D-3
                </span>
                <h1 className="mt-4 text-[30px] leading-tight text-[var(--hp-ink)] md:text-[38px]">
                  한 주의 공부가
                  <br className="sm:hidden" /> 책으로 쌓입니다
                </h1>
                <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-[var(--hp-muted)]">
                  공부한 시간만큼 책이 한 권씩 쌓여요. 지나간 날은 책이 가득하고, 아직 오지 않은 날은 비어 있습니다.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3 md:border-l md:border-[var(--hp-line)] md:pl-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--hp-brand-deep)] md:hidden">
                  <i className="ri-book-2-fill text-[18px] leading-none" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11.5px] font-medium text-[var(--hp-muted)]">오늘 쌓인 책</p>
                  <p className="hp-display mt-1 text-[22px] leading-none text-[var(--hp-ink)]">
                    {today ? `${formatHours(today.hours)} · ${today.books?.length ?? 0}권` : "아직 0권"}
                  </p>
                  <p className="mt-1.5 text-[11.5px] text-[var(--hp-muted)]">
                    남은 태스크 {tasks.filter((task) => task.status !== "done").length}개
                  </p>
                  <Link
                    to={nextTask ? `/study?task=${nextTask.id}` : "/study"}
                    className="mt-3 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--hp-solid)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--hp-solid-ink)] transition-colors hover:bg-[var(--hp-solid-hover)]"
                  >
                    <i className="ri-play-fill text-[12px] leading-none" />
                    {nextTask?.status === "active" ? "이어서 공부 시작" : "공부 시작"}
                  </Link>
                </div>
              </div>
            </section>

            <div className="hp-rise hp-d1 mt-10">
              <TodayPanel
                key={demoMode ?? "default"}
                overview={overview}
                tasks={tasks}
                late={demoMode === "1110" || demoMode === "pace" ? "none" : demoMode === "catchup" ? "big" : "small"}
                autoCatchUp={autoCatch || demoMode === "catchup"}
                pageProgress={{ done: donePages, total: totalPages, percent: pagePercent }}
                onRecord={(taskId) => setRecordTarget({ taskId })}
                onEditPages={(taskId) => setRecordTarget({ taskId })}
                onDistribute={() =>
                  setBoxNotice({ variant: "recovery", percent: pagePercent, books: overview.books })
                }
              />
            </div>

        <section
          id="records"
          className="mt-12 scroll-mt-24 border-t border-[var(--hp-line)] pt-9"
        >
          {reportOpen && view === "month" ? (
            <MonthReport monthLabel={month.label} monthRange={month.range} onBack={() => setReportOpen(false)} />
          ) : (
            <>
              <div className="hp-rise hp-d2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  {view === "week" ? (
                    <>
                      <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--hp-brand-deep)]">
                        이번 주 기록 · {week.range}
                      </p>
                      <h2 className="mt-2.5 text-[24px] text-[var(--hp-ink)] md:text-[28px]">
                        {week.label === "이번 주" ? "이번 주 기록" : `${week.label} 기록`}
                      </h2>
                      <p className="mt-2 max-w-[540px] text-[13px] leading-relaxed text-[var(--hp-muted)]">
                        태스크를 기록할 때마다 책 한 권. 책 색으로 그 단원의 지금 상태를 확인하세요.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--hp-brand-deep)]">
                        월간 기록 · {month.range}
                      </p>
                      <h2 className="mt-2.5 text-[24px] text-[var(--hp-ink)] md:text-[28px]">
                        2026년 {month.label} 책장
                      </h2>
                      <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-[var(--hp-muted)]">
                        하루 = 세워 꽂힌 책 1권. 그날 계획한 페이지를 얼마나 했는지만큼 책이 차요.
                      </p>
                    </>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                  {view === "week" ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveWeek(weekIndex - 1)}
                        disabled={weekIndex === 0}
                        aria-label="이전 주"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[var(--hp-ink)] transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:text-[var(--hp-line-strong)] disabled:hover:bg-transparent"
                      >
                        <i className="ri-arrow-left-s-line text-lg leading-none" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWeek(weekIndex + 1)}
                        disabled={weekIndex === weeks.length - 1}
                        aria-label="다음 주"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[var(--hp-ink)] transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:text-[var(--hp-line-strong)] disabled:hover:bg-transparent"
                      >
                        <i className="ri-arrow-right-s-line text-lg leading-none" />
                      </button>
                      {weekIndex !== CURRENT_INDEX ? (
                        <button
                          type="button"
                          onClick={() => moveWeek(CURRENT_INDEX)}
                          className="ml-0.5 cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--hp-brand-deep)] transition-colors hover:bg-white/[0.07]"
                        >
                          이번 주로
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReportOpen(true)}
                      className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--hp-line-strong)] px-3.5 py-1.5 text-[12px] font-semibold text-[var(--hp-ink-soft)] transition-colors hover:bg-white/[0.06] hover:text-[var(--hp-ink)]"
                    >
                      <i className="ri-bar-chart-box-line text-[13px] leading-none" />
                      월간 리포트
                    </button>
                  )}
                  <ViewSwitch view={view} onChange={switchView} />
                </div>
              </div>

              {view === "week" ? (
                <>
                  <div className="hp-rise hp-d2 mt-6 rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-4 md:p-6">
                    <WeekShelf week={week} selectedKey={selectedKey} onSelect={selectDay} dropSignal={dropSignal} />
                  </div>

                  {showDetail ? (
                    <div className="hp-rise mt-8 grid gap-8 border-t border-[var(--hp-line)] pt-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
                      <div key={`day-${selectedKey}`} className="hp-rise">
                        <DayDetail day={selectedDay} weekRange={week.range} />
                      </div>
                      <div
                        key={`report-${selectedKey}`}
                        className="hp-rise border-t border-[var(--hp-line)] pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
                      >
                        <WeeklyReport week={week} isCurrent={weekIndex === CURRENT_INDEX} />
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="hp-rise hp-d2 mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_296px]">
                  <div className="min-w-0 rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-3.5 md:p-5">
                    <MonthShelf month={month} selectedKey={selectedMonthKey} onSelect={setSelectedMonthKey} />
                    <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--hp-line)] pt-3.5 text-[11.5px] text-[var(--hp-muted)]">
                      <li className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="hp-chip hp-bk-gray" aria-hidden="true" />
                        책 높이 = 한 페이지 ÷ 계획 페이지
                      </li>
                      <li className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="hp-swatch hp-sub-data h-2.5 w-2.5" aria-hidden="true" />
                        <span className="hp-swatch hp-sub-os h-2.5 w-2.5" aria-hidden="true" />
                        <span className="hp-swatch hp-sub-net h-2.5 w-2.5" aria-hidden="true" />
                        아래 막대 = 그날 페이지의 과목 비율
                      </li>
                      <li className="flex items-center gap-1.5 whitespace-nowrap">
                        <i className="ri-calendar-check-line text-[13px] leading-none" />
                        점선 책 = 예정된 학습
                      </li>
                    </ul>
                  </div>

                  <aside className="flex flex-col gap-3.5">
                    <div className="rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-4">
                      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] font-semibold text-[var(--hp-ink)]">
                        {selectedMonthDay.date} ({selectedMonthDay.label})
                        {selectedMonthDay.today ? (
                          <span className="text-[10.5px] font-bold text-[var(--hp-brand-deep)]">· 오늘</span>
                        ) : null}
                      </p>

                      {selectedMonthDay.future ? (
                        <div className="mt-3">
                          <p className="text-[11.5px] text-[var(--hp-muted)]">아직 오지 않은 날이에요</p>
                          {selectedMonthDay.plan ? (
                            <p className="mt-2 rounded-lg border border-dashed border-[var(--hp-line-strong)] px-2.5 py-2 text-[11.5px] leading-relaxed text-[var(--hp-ink-soft)]">
                              <i className="ri-calendar-check-line mr-1 text-[11px] leading-none text-[var(--hp-brand-deep)]" />
                              {selectedMonthDay.plan}
                            </p>
                          ) : null}
                          <Link
                            to="/calendar"
                            className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-[var(--hp-brand-deep)]"
                          >
                            캘린더에서 시간 보기
                            <i className="ri-arrow-right-line text-[11px] leading-none" />
                          </Link>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <p className="text-[11.5px] text-[var(--hp-muted)]">
                            공부 {formatMinutes(summaryMinutes)} · 책{" "}
                            <strong className="font-semibold text-[var(--hp-ink)]">
                              {selectedMonthDay.books?.length ?? 0}권
                            </strong>
                          </p>
                          <ul className="mt-3 flex flex-col gap-2">
                            {selectedMonthDay.sessions.map((session, index) => (
                              <li key={`${selectedMonthDay.key}-${session.subject}`} className="flex items-center gap-2">
                                <span
                                  className={`hp-swatch h-2.5 w-2.5 flex-none ${
                                    SESSION_TONES[session.subject] ?? FALLBACK_TONES[index % 3]
                                  }`}
                                  aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1 truncate text-[11.5px] text-[var(--hp-ink-soft)]">
                                  {session.subject}
                                </span>
                                <span className="shrink-0 text-[11px] tabular-nums text-[var(--hp-muted)]">
                                  {session.minutes}분
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-4">
                      <h3 className="text-[13px] font-semibold text-[var(--hp-ink)]">읽는 법</h3>
                      <ul className="mt-3 flex flex-col gap-2 text-[11.5px] leading-relaxed text-[var(--hp-muted)]">
                        <li className="flex gap-2">
                          <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--hp-muted)]" />
                          책 높이 = 그날 페이지 ÷ 계획 페이지 (최대 100%)
                        </li>
                        <li className="flex gap-2">
                          <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--hp-muted)]" />
                          아래 막대 = 그날 페이지의 과목 비율 (과목 색)
                        </li>
                        <li className="flex gap-2">
                          <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--hp-muted)]" />
                          점선 책 = 아직 오지 않은 날 · 빈 칸 = 계획 없음
                        </li>
                        <li className="flex gap-2">
                          <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--hp-muted)]" />
                          날짜를 누르면 이 칸에 그날 내용이 나와요
                        </li>
                      </ul>
                    </div>
                  </aside>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="border-t border-[var(--hp-line)] bg-[var(--hp-paper-warm)]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-[11.5px] text-[var(--hp-muted)] sm:flex-row md:px-8">
          <p>© 2026 피뢰침. 공부한 만큼 쌓이는 기록.</p>
          <p className="flex items-center gap-2">
            <span className="hp-chip hp-bk-gray" aria-hidden="true" />
            책 1권 = 태스크 1개
          </p>
        </div>
      </footer>

      {recordTask && recordTarget ? (
        <RecordDialog
          task={recordTask}
          measuredMinutes={recordTarget.measuredMinutes}
          otherDonePages={Math.max(0, donePages - recordTask.donePages)}
          totalPages={totalPages}
          onClose={() => setRecordTarget(null)}
          onSubmit={submitRecord}
        />
      ) : null}

      {bookToast ? (
        <BookToast
          subject={bookToast.subject}
          unitLabel={bookToast.unitLabel}
          books={bookToast.books}
          onDone={() => setBookToast(null)}
        />
      ) : null}

      {paceOpen ? (
        <PaceDialog
          onClose={() => setPaceOpen(false)}
          onApply={() => {
            setPaceOpen(false);
            setBoxNotice({ variant: "recovery", percent: pagePercent, books: overview.books });
          }}
        />
      ) : null}

      {boxNotice ? (
        <BookBoxDialog
          {...boxNotice}
          onClose={() => setBoxNotice(null)}
          onQuiz={() => {
            setBoxNotice(null);
            navigate("/quiz");
          }}
          onBooks={() => {
            setBoxNotice(null);
            navigate("/books");
          }}
          onPlan={() => {
            setBoxNotice(null);
            navigate("/manage");
          }}
        />
      ) : null}
    </div>
  );
}