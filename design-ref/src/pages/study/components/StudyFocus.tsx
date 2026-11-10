import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StudyHeader from "./StudyHeader";
import { studyPdf, studyPhrases } from "@/mocks/studySession";
import type { StudyTarget } from "@/pages/study/page";

type Props = {
  target: StudyTarget;
  /** autoStopped: 알림에 답이 없어 자동 종료된 경우 */
  onFinish: (minutes: number, autoStopped?: boolean) => void;
};

function formatClock(totalSeconds: number): string {
  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) return `${totalMinutes}분`;
  const hour = Math.floor(totalMinutes / 60);
  const rest = totalMinutes % 60;
  return rest ? `${hour}시간 ${rest}분` : `${hour}시간`;
}

export default function StudyFocus({ target, onFinish }: Props) {
  const [params] = useSearchParams();
  /** ?fast=1 이면 1초를 1분처럼 빨리 감아요 (시연 확인용) */
  const fast = params.get("fast") === "1";
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfPage, setPdfPage] = useState(studyPdf.startPage);
  const [checkIn, setCheckIn] = useState(false);
  const [checkInAt, setCheckInAt] = useState<number | null>(null);
  const [phrase] = useState(() => studyPhrases[Math.floor(Math.random() * studyPhrases.length)]);

  useEffect(() => {
    if (paused) return;
    const tick = fast ? 60 : 1;
    const timer = window.setInterval(() => setElapsed((prev) => prev + tick), 1000);
    return () => window.clearInterval(timer);
  }, [paused, fast]);

  useEffect(() => {
    if (!showTime) return;
    const hide = window.setTimeout(() => setShowTime(false), 3000);
    return () => window.clearTimeout(hide);
  }, [showTime]);

  const expectedSeconds = target.expectedMinutes * 60;

  useEffect(() => {
    if (paused || checkIn) return;
    if (elapsed >= expectedSeconds * 2) {
      setCheckIn(true);
      setCheckInAt(elapsed);
    }
  }, [elapsed, expectedSeconds, paused, checkIn]);

  // 알림이 뜬 뒤 10분 동안 답이 없으면 알림이 온 시각까지만 측정하고 종료해요.
  useEffect(() => {
    if (!checkIn || checkInAt === null) return;
    const waitMs = fast ? 10000 : 600000;
    const timer = window.setTimeout(() => {
      onFinish(Math.max(1, Math.round(checkInAt / 60)), true);
    }, waitMs);
    return () => window.clearTimeout(timer);
  }, [checkIn, checkInAt, fast, onFinish]);

  const elapsedMinutes = Math.max(1, Math.round(elapsed / 60));
  const finish = () => onFinish(elapsedMinutes);

  const openPdf = () => {
    setPdfPage(studyPdf.startPage);
    setPdfOpen(true);
  };

  return (
    <div className="st-scope flex min-h-screen w-full flex-col bg-[var(--st-paper)]">
      <StudyHeader
        right={
          <button type="button" onClick={() => setShowTime(true)} className="st-timebtn">
            <i className="ri-eye-line text-[13px] leading-none" />
            시간 보기
          </button>
        }
      />

      <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        {paused ? (
          <div className="st-rise st-card w-full max-w-[420px] px-6 py-9">
            <span className="st-book st-book--closed mx-auto">
              <i className="ri-book-2-line text-[34px] leading-none" />
            </span>
            <h1 className="mt-6 text-[21px] text-[var(--st-ink)]">잠깐 멈췄어요</h1>
            <p className="mt-2.5 text-[12px] leading-relaxed text-[var(--st-muted)]">
              책이 살짝 닫혔어요. 멈춘 시간은 측정에서 빠지고, 다시 시작하면 이어서 세요.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={() => setPaused(false)} className="st-btn-solid">
                다시 시작
              </button>
              <button type="button" onClick={finish} className="st-btn-ghost">
                종료
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="st-rise">
              <span className="st-book">
                <i className="ri-book-open-line text-[42px] leading-none" />
              </span>
            </div>

            <h1 className="st-rise mt-6 max-w-[640px] text-[22px] leading-snug text-[var(--st-ink)] md:text-[27px]">
              {target.subject} · {target.unit} 공부 중
            </h1>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="st-chip">
                {target.pageRange} · {target.pages}p
              </span>
              <span className="st-chip">예상 {target.expectedMinutes}분</span>
            </div>

            <p className="st-rise mt-10 text-[21px] leading-snug text-[var(--st-ink)] md:text-[25px]">{phrase}</p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={openPdf} className="st-btn-ghost">
                자료 열기
              </button>
              <button type="button" onClick={() => setPaused(true)} className="st-btn-ghost">
                잠깐 멈춤
              </button>
              <button type="button" onClick={finish} className="st-btn-solid">
                종료
              </button>
            </div>

            <p className="mx-auto mt-9 max-w-[520px] text-[11px] leading-relaxed text-[var(--st-muted)]">
              공부하는 동안 시간 숫자는 보이지 않아요. 오른쪽 위 [시간 보기]를 누르면 3초 동안 &lsquo;38분&rsquo;처럼
              보여요.
            </p>
          </>
        )}
      </main>

      {showTime ? <div className="st-timepill">{formatClock(elapsed)}</div> : null}

      {pdfOpen ? (
        <div className="st-overlay" role="presentation" onClick={() => setPdfOpen(false)}>
          <div
            className="st-modal st-modal--pdf"
            role="dialog"
            aria-modal="true"
            aria-label="태스크 범위 PDF 보기"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 flex-wrap text-[12.5px] font-semibold leading-relaxed text-[var(--st-ink)]">
                {studyPdf.fileName}
                <span className="ml-1.5 font-medium tabular-nums text-[var(--st-muted)]">
                  · p.{pdfPage} / {studyPdf.totalPages}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setPdfOpen(false)}
                aria-label="PDF 닫기"
                className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-lg text-[var(--st-muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--st-ink)]"
              >
                <i className="ri-close-line text-[16px] leading-none" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--st-line)] bg-white/[0.02] px-4 py-10 text-center">
              <i className="ri-file-pdf-2-line text-[30px] leading-none text-[var(--st-ink-soft)]" />
              <p className="mt-3 text-[12px] text-[var(--st-muted)]">p.{pdfPage} 페이지 자리표시</p>
              <p className="mt-1 text-[10.5px] text-[var(--st-muted)]">
                AI 담당 확인 전이라 PDF 보기는 자리표시로 보여요.
              </p>
            </div>

            <p className="mt-3 text-[10.5px] leading-relaxed text-[var(--st-muted)]">
              자료를 봐도 측정은 계속돼요. 창을 닫으면 공부 화면으로 돌아옵니다.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPdfPage((prev) => Math.max(1, prev - 1))}
                  disabled={pdfPage <= 1}
                  className="st-btn-ghost px-3 py-2 text-[11.5px]"
                >
                  <i className="ri-arrow-left-s-line text-[13px] leading-none" />
                  이전 쪽
                </button>
                <button
                  type="button"
                  onClick={() => setPdfPage((prev) => Math.min(studyPdf.totalPages, prev + 1))}
                  disabled={pdfPage >= studyPdf.totalPages}
                  className="st-btn-ghost px-3 py-2 text-[11.5px]"
                >
                  다음 쪽
                  <i className="ri-arrow-right-s-line text-[13px] leading-none" />
                </button>
              </div>
              <button type="button" onClick={() => setPdfOpen(false)} className="st-btn-solid px-4 py-2 text-[11.5px]">
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {checkIn ? (
        <div className="st-checkin" role="status">
          <p className="flex items-center gap-1.5 text-[10.5px] text-[var(--st-muted)]">
            <i className="ri-alarm-line text-[12px] leading-none" />
            예상의 2배({target.expectedMinutes * 2}분)가 지났어요
          </p>
          <p className="mt-1.5 text-[13.5px] font-semibold text-[var(--st-ink)]">아직 공부 중이에요?</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCheckIn(false);
                setCheckInAt(null);
              }}
              className="st-btn-solid px-3.5 py-2 text-[11.5px]"
            >
              계속 공부
            </button>
            <button type="button" onClick={finish} className="st-btn-ghost px-3 py-2 text-[11.5px]">
              종료하기
            </button>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-[var(--st-muted)]">
            10분 동안 답이 없으면 알림이 온 시점에서 멈추고, 이 기록은 속도 보정에서 빼요.
          </p>
        </div>
      ) : null}
    </div>
  );
}