import { useNavigate } from "react-router-dom";
import StudyHeader from "./StudyHeader";
import { studyDoneSummary } from "@/mocks/studySession";

type Props = {
  minutes: number;
  subject: string;
  taskId?: string;
  /** 알림에 답이 없어 자동 종료된 경우 */
  autoStopped?: boolean;
};

export default function StudyDone({ minutes, subject, taskId, autoStopped = false }: Props) {
  const navigate = useNavigate();

  const goRecord = () => {
    if (taskId) navigate(`/home?record=${encodeURIComponent(taskId)}&minutes=${minutes}`);
    else navigate("/home");
  };

  return (
    <div className="st-scope flex min-h-screen w-full flex-col bg-[var(--st-paper)]">
      <StudyHeader />

      <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col items-center justify-center px-4 py-14 text-center">
        <div className="st-rise">
          <span className="st-book st-book--closed">
            <i className="ri-book-2-line text-[34px] leading-none" />
          </span>
        </div>

        <h1 className="st-rise mt-7 text-[24px] leading-snug text-[var(--st-ink)] md:text-[31px]">
          {subject} {minutes}분 공부했어요
        </h1>

        <p className="st-rise mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-[12px] text-[var(--st-muted)]">
          <span>
            오늘 총 {studyDoneSummary.todayTotal} · {subject} 지금까지 {studyDoneSummary.subjectTotal}
          </span>
        </p>

        <p className="mt-5 text-[12.5px] leading-relaxed text-[var(--st-ink-soft)]">
          멈춘 {studyDoneSummary.pauseMinutes}분은 빼고 셌어요. 이제 어디까지 했는지 기록하면 책이 쌓여요.
        </p>

        {autoStopped ? (
          <p className="mt-2 flex items-center justify-center gap-1.5 rounded-full border border-[var(--st-line-strong)] px-3 py-1 text-[10.5px] text-[var(--st-muted)]">
            <i className="ri-alarm-line text-[11px] leading-none" />
            답이 없어서 알림이 온 때까지만 쟀어요
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={goRecord} className="st-btn-solid">
            기록하기
          </button>
          <button type="button" onClick={() => navigate("/home")} className="st-btn-ghost">
            나중에 기록
          </button>
        </div>

        <p className="mx-auto mt-8 max-w-[560px] text-[10.5px] leading-relaxed text-[var(--st-muted)]">
          [나중에 기록]을 눌러도 측정한 {minutes}분은 저장되고, 홈 태스크 카드에 &lsquo;기록 전 · {minutes}분&rsquo;으로
          남아요.
        </p>
      </main>
    </div>
  );
}