import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@/pages/quiz/quiz.css";
import "./review.css";
import QuizHeader from "@/pages/quiz/components/QuizHeader";
import WeakConceptBar from "./components/WeakConceptBar";
import CustomQuizCard from "./components/CustomQuizCard";
import NoteList from "./components/NoteList";
import RetryDialog from "./components/RetryDialog";
import { reviewIntro, reviewNotes, reviewSubjects } from "@/mocks/review";
import { getNoteGroups, getWeakGroups, getWeakTotal } from "./utils";
import type { NoteTab, ReviewNote, ReviewSubject } from "./types";

const notes = reviewNotes as unknown as ReviewNote[];
const subjects = reviewSubjects as unknown as ReviewSubject[];

const TABS: { key: NoteTab; label: string }[] = [
  { key: "date", label: "일자별" },
  { key: "unit", label: "단원별" },
  { key: "count", label: "틀린 횟수별" },
];

export default function ReviewPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<NoteTab>("date");
  const [retryNote, setRetryNote] = useState<ReviewNote | null>(null);

  useEffect(() => {
    document.title = "피뢰침 | 복습·오답 노트";
    const desc = document.querySelector('meta[name="description"]');
    const text =
      "틀린 문제와 애매하게 맞힌 문제를 모아 누적 관리하는 복습 노트. 취약 개념만 골라 5문항 맞춤 퀴즈로 다시 확인하세요.";
    if (desc) desc.setAttribute("content", text);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = text;
      document.head.appendChild(meta);
    }
  }, []);

  const weakGroups = useMemo(() => getWeakGroups(notes), []);
  const groups = useMemo(() => getNoteGroups(notes, tab), [tab]);
  const weakTotal = getWeakTotal(weakGroups);

  const headerRight = (
    <div className="flex items-center gap-2">
      <span className="qz-chip hidden sm:inline-flex">누적 오답 {notes.length}문항</span>
      <Link to="/quiz" className="qz-btn qz-btn--ghost">
        오늘의 퀴즈
      </Link>
    </div>
  );

  return (
    <div className="qz-scope flex min-h-screen w-full flex-col bg-[var(--qz-paper)]">
      <QuizHeader right={headerRight} />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-16 pt-8 md:px-8 md:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--qz-brand-deep)]">
              <i className="ri-refresh-line text-[13px] leading-none" />
              복습 · 오답
            </p>
            <h1 className="mt-3 text-[28px] leading-tight text-[var(--qz-ink)] md:text-[34px]">누적 오답 노트</h1>
            <div className="mt-2 flex max-w-[620px] flex-col gap-0.5">
              {reviewIntro.map((line) => (
                <p key={line} className="text-[13px] leading-relaxed text-[var(--qz-muted)]">
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="qz-chip qz-chip--bad">
              <i className="ri-error-warning-line text-[12px] leading-none" />
              취약 개념 {weakTotal}개
            </span>
            <Link to="/books" className="qz-btn qz-btn--ghost">
              책 쌓기 보기
            </Link>
          </div>
        </div>

        <WeakConceptBar groups={weakGroups} noteCount={notes.length} />

        <div className="mt-5">
          <CustomQuizCard
            subjects={subjects}
            onStart={({ subjectId, unitLabel, level }) =>
              navigate("/quiz", { state: { subjectId, unitLabel, level, count: 5, custom: true } })
            }
          />
        </div>

        <NoteList
          tab={tab}
          tabs={TABS}
          groups={groups}
          total={notes.length}
          onTabChange={setTab}
          onRetry={setRetryNote}
        />
      </main>

      <footer className="border-t border-[var(--qz-line)] bg-[var(--qz-paper-warm)]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-[11.5px] text-[var(--qz-muted)] sm:flex-row md:px-8">
          <p>© 2026 피뢰침. 푼 만큼 남는 기록.</p>
          <p className="flex items-center gap-2">
            <i className="ri-refresh-line text-[12px] leading-none text-[var(--qz-brand-deep)]" />
            틀린 문제는 내일 퀴즈로 다시
          </p>
        </div>
      </footer>

      {retryNote ? <RetryDialog note={retryNote} onClose={() => setRetryNote(null)} /> : null}
    </div>
  );
}