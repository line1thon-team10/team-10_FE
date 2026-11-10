import { useState } from "react";
import { Link } from "react-router-dom";
import type { TodayOverview, TodayTask, TodayTaskStatus } from "@/pages/home/types";
import { formatMinutes } from "@/pages/home/utils";
import LateBanner from "@/pages/home/components/LateBanner";
import MoveTaskDialog from "@/pages/home/components/MoveTaskDialog";
import AskBar from "@/pages/home/components/AskBar";
import CatchUpDialog from "@/pages/manage/components/CatchUpDialog";
import PlanAddDialog from "@/pages/manage/components/PlanAddDialog";

type Props = {
  overview: TodayOverview;
  tasks: TodayTask[];
  /** 페이지 기준 오늘 계획 진행률 */
  pageProgress: { done: number; total: number; percent: number };
  onRecord: (taskId: string) => void;
  onEditPages: (taskId: string) => void;
  /** 밀린 분량 분배안을 적용했을 때 (회복 박스) */
  onDistribute?: () => void;
  /** 오늘 밀린 분량 안내 배너 */
  late?: "none" | "small" | "big";
  /** 화면에 들어오자마자 분배안 팝업을 열지 */
  autoCatchUp?: boolean;
};

const STATUS_LABEL: Record<TodayTaskStatus, string> = {
  done: "기록 완료",
  active: "진행 중",
  pending: "시작 전",
  partial: "부분 완료",
};

const STATUS_CLASS: Record<TodayTaskStatus, string> = {
  done: "border-[rgba(89,160,111,0.45)] bg-[rgba(89,160,111,0.12)] text-[#8ecfa4]",
  active: "border-[var(--hp-brand-line)] bg-[var(--hp-brand-tint)] text-[var(--hp-brand-deep)]",
  pending: "border-[var(--hp-line-strong)] bg-white/[0.03] text-[var(--hp-muted)]",
  partial: "border-[rgba(211,164,74,0.45)] bg-[rgba(211,164,74,0.12)] text-[#ecc583]",
};

export default function TodayPanel({
  overview,
  tasks,
  pageProgress,
  onRecord,
  onEditPages,
  onDistribute,
  late = "small",
  autoCatchUp = false,
}: Props) {
  const [lateVisible, setLateVisible] = useState(late !== "none");
  const [catchOpen, setCatchOpen] = useState(autoCatchUp);
  const [catchDone, setCatchDone] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveDone, setMoveDone] = useState(false);
  const [guideVisible, setGuideVisible] = useState(true);
  const [planAddOpen, setPlanAddOpen] = useState(false);
  const [addedPlan, setAddedPlan] = useState("");
  const remaining = tasks.filter((task) => task.status !== "done").length;
  // 페이지 기준: 완료 페이지 ÷ 오늘 계획 페이지, 남은 페이지는 70%가 되는 데 필요한 만큼(올림)
  const pagePercent = Math.min(pageProgress.percent, 100);
  const needPages = Math.max(0, Math.ceil(pageProgress.total * 0.7) - pageProgress.done);
  const quizUnlocked = pagePercent >= 70;
  const nextTask = tasks.find((task) => task.status !== "done") ?? tasks[0];

  return (
    <section id="today" className="scroll-mt-24">
      {pagePercent < 70 && guideVisible ? (
        <div className="hp-rise mb-3 rounded-2xl border border-dashed border-[var(--hp-brand-line)] bg-[var(--hp-brand-tint)] p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--hp-brand-deep)]">
                <i className="ri-flag-line text-[12px] leading-none" />
                70% 목표
              </p>
              <p className="mt-1.5 text-[13.5px] font-semibold leading-relaxed text-[var(--hp-ink)]">
                오늘 계획의 {pagePercent}%를 했어요. 70%까지 {needPages}페이지 남았어요.
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--hp-muted)]">
                70% 이상 공부하고 퀴즈를 풀면 기억에 더 오래 남아요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGuideVisible(false)}
              aria-label="70% 목표 안내 닫기"
              className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-lg text-[var(--hp-muted)] transition-colors hover:bg-white/[0.07] hover:text-[var(--hp-ink)]"
            >
              <i className="ri-close-line text-[14px] leading-none" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              to={`/study?task=${nextTask?.id ?? ""}`}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--hp-solid)] px-3.5 py-1.5 text-[11.5px] font-semibold text-[var(--hp-solid-ink)] transition-colors hover:bg-[var(--hp-solid-hover)]"
            >
              <i className="ri-play-fill text-[11px] leading-none" />
              {nextTask ? `${nextTask.subject} 이어서 공부하기` : "이어서 공부하기"}
            </Link>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--hp-brand-line)] px-3.5 py-1.5 text-[11.5px] font-semibold text-[var(--hp-brand-deep)] transition-colors hover:bg-white/[0.06]"
            >
              <i className="ri-file-list-3-line text-[12px] leading-none" />
              끝난 과목 퀴즈만 풀기
            </Link>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--hp-brand-deep)]">
              <i className="ri-sun-line text-[13px] leading-none" />
              오늘의 공부 · {overview.date} · 자료구조 시험 D-3
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="text-[21px] text-[var(--hp-ink)] md:text-[24px]">
                오늘 할 일 {remaining}/{tasks.length}
              </h2>
              <button
                type="button"
                onClick={() => setPlanAddOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-[var(--hp-line-strong)] px-2.5 py-1 text-[10.5px] font-semibold text-[var(--hp-muted)] transition-colors hover:border-[var(--hp-ink-soft)] hover:text-[var(--hp-ink)]"
              >
                <i className="ri-add-line text-[11px] leading-none" />
                계획 추가
              </button>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--hp-muted)]">
              계획해 둔 범위를 과목별로 눌러 바로 집중 모드로 들어갈 수 있어요. 어제 못 한 범위는 맨 위에 올려
              뒀어요.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
            <div>
              <p className="text-[11px] font-medium text-[var(--hp-muted)]">오늘 진행률 (페이지)</p>
              <p className="hp-display mt-1 flex items-baseline gap-1.5 text-[22px] leading-none text-[var(--hp-ink)]">
                {pagePercent}%
                <span className="text-[12px] font-medium tabular-nums text-[var(--hp-muted)]">
                  ({pageProgress.done}/{pageProgress.total}p)
                </span>
              </p>
              <p className="mt-1.5 text-[11px] text-[var(--hp-muted)]">
                공부 {formatMinutes(overview.studiedMinutes)} · 책 {overview.books}권
              </p>
            </div>
          </div>
        </div>

        {lateVisible ? (
          <LateBanner
            variant={late === "big" ? "big" : "small"}
            onMove={() => {
              if (late === "big") setCatchOpen(true);
              else setMoveOpen(true);
            }}
            onConfirm={() => setLateVisible(false)}
          />
        ) : moveDone ? (
          <p className="mt-4 flex items-center gap-1.5 rounded-xl border border-dashed border-[var(--hp-line-strong)] px-3.5 py-2.5 text-[11.5px] text-[var(--hp-ink-soft)]">
            <i className="ri-check-line text-[13px] leading-none text-[var(--hp-brand-deep)]" />
            11/10 첫 태스크로 옮겼어요.
          </p>
        ) : catchDone ? (
          <p className="mt-4 flex items-center gap-1.5 rounded-xl border border-dashed border-[var(--hp-line-strong)] px-3.5 py-2.5 text-[11.5px] text-[var(--hp-ink-soft)]">
            <i className="ri-check-line text-[13px] leading-none text-[var(--hp-brand-deep)]" />
            밀린 분량을 11/10 오후로 나눠 넣었어요. 남은 태스크는 그대로예요.
          </p>
        ) : null}

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 text-[11.5px] text-[var(--hp-muted)]">
            <span>
              {pagePercent >= 70 ? (
                <>오늘 계획의 70%를 넘었어요</>
              ) : (
                <>
                  70%까지{" "}
                  <strong className="font-semibold tabular-nums text-[var(--hp-ink)]">{needPages}p</strong> 남았어요
                </>
              )}
            </span>
            <span className="tabular-nums">{pagePercent}%</span>
          </div>
          <div className="mt-2 h-[6px] w-full overflow-hidden rounded-full bg-[var(--hp-line)]">
            <div
              className="h-full rounded-full bg-[var(--hp-brand)] transition-[width] duration-500"
              style={{ width: `${pagePercent}%` }}
            />
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--hp-muted)]">
            <i className="ri-file-list-3-line text-[12px] leading-none" />
            페이지 기준 오늘 계획
            <strong className="font-semibold tabular-nums text-[var(--hp-ink-soft)]">
              {pageProgress.done}p / {pageProgress.total}p
            </strong>
            <span className="tabular-nums text-[var(--hp-brand-deep)]">{pageProgress.percent}%</span>
          </p>
        </div>

        <ul className="mt-5 flex flex-col gap-2">
          {tasks.map((task) => {
            const done = task.status === "done";
            const ratio = Math.min(
              Math.round((task.studiedMinutes / Math.max(task.expectedMinutes, 1)) * 100),
              100,
            );
            return (
              <li
                key={task.id}
                className={`hp-task flex flex-col gap-3 rounded-xl border border-[var(--hp-line)] bg-white/[0.02] px-3.5 py-3 sm:flex-row sm:items-center sm:gap-4 ${
                  done ? "opacity-70" : ""
                }`}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/[0.05] text-[var(--hp-brand-deep)]">
                    <i className={`${task.icon} text-[15px] leading-none`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-[11.5px] font-semibold text-[var(--hp-brand-deep)]">{task.subject}</span>
                      <span
                        className={`truncate text-[13.5px] font-medium ${
                          done ? "text-[var(--hp-muted)] line-through" : "text-[var(--hp-ink)]"
                        }`}
                      >
                        {task.unit}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-[var(--hp-muted)]">
                      <span className="tabular-nums">{task.pageRange}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {task.pages}p
                        {task.status === "partial" ? ` · 계획 ${task.plannedPages}p` : ""}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>예상 {task.expectedMinutes}분</span>
                      {task.note ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[var(--hp-ink-soft)]">{task.note}</span>
                        </>
                      ) : null}
                    </p>
                    {task.recordNote ? (
                      <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--hp-brand-deep)]">
                        <i className="ri-arrow-right-line mt-[3px] text-[11px] leading-none" />
                        <span>{task.recordNote}</span>
                      </p>
                    ) : null}
                    {task.studiedMinutes > 0 ? (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-[4px] w-full max-w-[220px] overflow-hidden rounded-full bg-[var(--hp-line)]">
                          <div
                            className={`h-full rounded-full ${
                              done ? "bg-[rgba(89,160,111,0.9)]" : "bg-[var(--hp-brand)]"
                            }`}
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[10.5px] tabular-nums text-[var(--hp-muted)]">
                          {task.studiedMinutes}분
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end sm:pl-2">
                  <span
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_CLASS[task.status]}`}
                  >
                    {done ? <i className="ri-check-line text-[12px] leading-none" /> : null}
                    {STATUS_LABEL[task.status]}
                  </span>
                  <button
                    type="button"
                    onClick={() => (done || task.status === "partial" ? onEditPages(task.id) : onRecord(task.id))}
                    className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-[var(--hp-line-strong)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--hp-ink-soft)] transition-colors hover:border-[var(--hp-ink-soft)] hover:text-[var(--hp-ink)]"
                  >
                    <i className="ri-edit-line text-[12px] leading-none" />
                    {done || task.status === "partial" ? "페이지 고치기" : "기록하기"}
                  </button>
                  <Link
                    to={`/study?task=${task.id}`}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold transition-colors ${
                      done || task.status === "partial"
                        ? "text-[var(--hp-muted)] hover:bg-white/[0.07] hover:text-[var(--hp-ink)]"
                        : "bg-[var(--hp-solid)] text-[var(--hp-solid-ink)] hover:bg-[var(--hp-solid-hover)]"
                    }`}
                  >
                    {done || task.status === "partial" ? null : (
                      <i className="ri-play-fill text-[11px] leading-none" />
                    )}
                    {done || task.status === "partial"
                      ? "다시 보기"
                      : task.status === "active"
                        ? "이어서 시작"
                        : "공부 시작"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        <AskBar />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--hp-line-strong)] bg-white/[0.02] px-3.5 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--hp-ink)]">
              <i className="ri-refresh-line text-[13px] leading-none text-[var(--hp-brand-deep)]" />
              공부한 만큼, 퀴즈로 확인해요
            </p>
            <p className="mt-1 text-[11.5px] text-[var(--hp-muted)]">
              {overview.date} 기준 · 과목을 골라 풀 수 있어요 · 풀기는 선택이에요
            </p>
          </div>
          {quizUnlocked ? (
            <Link
              to="/quiz"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--hp-solid)] px-3.5 py-1.5 text-[11.5px] font-semibold text-[var(--hp-solid-ink)] transition-colors hover:bg-[var(--hp-solid-hover)]"
            >
              <i className="ri-file-list-3-line text-[12px] leading-none" />
              오늘의 퀴즈 풀기
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center gap-1.5 whitespace-nowrap rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[11.5px] font-semibold text-[var(--hp-muted)] opacity-80"
            >
              <i className="ri-lock-line text-[12px] leading-none" />
              70%까지 {needPages}p 남음
            </button>
          )}
        </div>

        <p className="mt-2 flex items-start gap-1.5 px-0.5 text-[11px] leading-relaxed text-[var(--hp-muted)]">
          <i className="ri-information-line mt-0.5 text-[12px] leading-none" />
          오늘 풀지 않은 퀴즈는 내일 퀴즈에 합쳐서 나와요.
        </p>

        {addedPlan ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-dashed border-[var(--hp-line-strong)] px-3 py-2 text-[11px] leading-relaxed text-[var(--hp-ink-soft)]">
            <i className="ri-check-line text-[12px] leading-none text-[var(--hp-brand-deep)]" />
            계획을 추가했어요 · {addedPlan}
            <button
              type="button"
              onClick={() => setAddedPlan("")}
              className="ml-auto cursor-pointer whitespace-nowrap text-[10.5px] font-semibold text-[var(--hp-muted)] hover:text-[var(--hp-ink)]"
            >
              닫기
            </button>
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[var(--hp-line)] pt-3.5">
          <p className="flex items-center gap-1.5 text-[11.5px] text-[var(--hp-muted)]">
            <i className="ri-timer-flash-line text-[13px] leading-none" />
            남은 태스크 {remaining}개 · 시작하면 집중 모드에서 시간을 재요
          </p>
        </div>
      </div>

      {planAddOpen ? (
        <PlanAddDialog
          onClose={() => setPlanAddOpen(false)}
          onAdd={(plan) => {
            setPlanAddOpen(false);
            setAddedPlan(`${plan.subject} ${plan.range} · ${plan.days}`);
          }}
        />
      ) : null}

      {catchOpen ? (
        <CatchUpDialog
          onClose={() => setCatchOpen(false)}
          onApply={() => {
            setCatchOpen(false);
            setLateVisible(false);
            setCatchDone(true);
            onDistribute?.();
          }}
        />
      ) : null}

      {moveOpen ? (
        <MoveTaskDialog
          onClose={() => setMoveOpen(false)}
          onMove={() => {
            setMoveOpen(false);
            setLateVisible(false);
            setMoveDone(true);
          }}
        />
      ) : null}
    </section>
  );
}