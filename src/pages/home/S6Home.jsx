// S6 홈 — 신민종 (S6-2 조금 밀린 날, S6-3 AI 튜터 답변은 같은 주소의 상태로 11/9·11/10에 추가)
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import BookBlock from '@/components/book/BookBlock.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import ProgressBar from '@/components/common/ProgressBar.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import TaskCard from '@/components/home/TaskCard.jsx';
import { fmtFull, toDay } from '@/config/date.js';
import { useToday } from '@/hooks/useToday.js';
import { useUiStore } from '@/stores/uiStore.js';

function QuizBanner({ today }) {
  const navigate = useNavigate();
  const { quiz } = today;
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={quiz.open ? 'primary' : 'secondary'}
        disabled={!quiz.open}
        onClick={() => navigate(ROUTES.quiz)}
      >
        {quiz.open
          ? `오늘의 퀴즈 풀기 · ${quiz.totalCount}문항`
          : `오늘의 퀴즈 · ${quiz.openRate}%부터`}
      </Button>
      {!quiz.open && (
        <span className="num text-xs text-fg-2">
          {quiz.openRate}%까지 {quiz.remainPages}p 남음
        </span>
      )}
    </div>
  );
}

// 70% 미만 안내 박스 (HM-06, QZ-02). 문구는 데이터 세트 5장
function QuizGuideBox({ today, subjectsById, onContinue }) {
  const navigate = useNavigate();
  const { quiz, progress, date } = today;
  const closedOn = useUiStore((s) => s.quizBoxClosedOn);
  const closeBox = useUiStore((s) => s.closeQuizBox);
  if (quiz.open) return null;

  const note = <p className="text-xs text-fg-2">오늘 풀지 않은 퀴즈는 내일 퀴즈에 합쳐서 나와요</p>;
  if (closedOn === date) return note; // 닫아도 안내 한 줄은 남아요

  const nextTask = today.tasks.find((t) => t.status !== 'done');
  const nextSubject = nextTask && subjectsById[nextTask.subjectId];
  const openCount = quiz.openSubjects.reduce((n, s) => n + s.count, 0);
  return (
    <section
      className="flex flex-col gap-3 rounded-md border-2 border-fg p-4"
      aria-label="오늘의 퀴즈 안내"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <strong>
            오늘 계획의 {progress.rate}%를 했어요. {quiz.openRate}%까지 {quiz.remainPages}페이지
            남았어요.
          </strong>
          <p className="text-[13px] text-fg-2">
            70% 이상 공부하고 퀴즈를 풀면 기억에 더 오래 남아요.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm"
          aria-label="안내 닫기"
          onClick={() => closeBox(date)}
        >
          ✕
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {nextTask && (
          <Button variant="primary" onClick={() => onContinue(nextTask.id)}>
            {nextSubject?.name} 이어서 공부하기
          </Button>
        )}
        {openCount > 0 && (
          <Button onClick={() => navigate(ROUTES.quiz)}>
            끝난 과목 퀴즈만 풀기 · {openCount}문항
          </Button>
        )}
      </div>
      {note}
    </section>
  );
}

function ExamsCard({ today, subjectsById }) {
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="font-semibold">시험까지</h2>
      {today.exams.map((e) => (
        <div key={e.subjectId} className="flex items-center justify-between gap-2 text-[13.5px]">
          <span>{subjectsById[e.subjectId]?.name}</span>
          <span className="num text-fg-2">
            D-{e.dday}
            {e.readiness != null && ` · 준비도 ${e.readiness}%`}
          </span>
        </div>
      ))}
    </Card>
  );
}

// 최근 7일 쌓은 책 — TODO(확인필요): 책 모양은 S9 구성(Q3) 확정 후 같은 컴포넌트로 바꿔요
function RecentBooksCard({ today }) {
  const dropped = useUiStore((s) => s.droppedTaskId);
  const todayBooks =
    today.recentDays.at(-1)?.blocks.filter((b) => b.state !== 'planned').length ?? 0;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">최근 7일 쌓은 책</h2>
        <span className="badge">
          오늘 {todayBooks}권 · {today.streakDays}일 연속
        </span>
      </div>
      <div
        className="flex items-end justify-between gap-2"
        role="img"
        aria-label="최근 7일 동안 쌓은 책"
      >
        {today.recentDays.map((d, i) => {
          const isToday = i === today.recentDays.length - 1;
          return (
            <div key={d.date} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex w-8 flex-col-reverse gap-[3px] ${isToday ? 'rounded-sm outline-2 outline-offset-4 outline-fg' : ''}`}
              >
                {d.blocks.map((b, k) => (
                  <BookBlock
                    key={k}
                    state={b.state}
                    className="blk-mini"
                    drop={b.taskId != null && b.taskId === dropped}
                  />
                ))}
              </div>
              <span className={`text-xs ${isToday ? 'font-bold' : 'text-fg-3'}`}>
                {isToday ? '오늘' : toDay(d.date).format('dd')}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-fg-3">
        블록 1개 = 태스크 1개 · 블록에는 과목 색을 쓰지 않아요 · 점선 = 남은 계획
      </p>
      <Link to={ROUTES.books} className="text-[13px] font-semibold underline underline-offset-4">
        과목·단원별로 보기 →
      </Link>
    </Card>
  );
}

// 하단 고정 AI 튜터 (TU-01, Should) — 답변 화면(S6-3)은 11/10에 연결해요
function TutorBar() {
  return (
    <form
      className="sticky bottom-0 -mx-5 -mb-5 mt-auto flex items-center gap-2 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur"
      onSubmit={(e) => {
        e.preventDefault();
        toast('AI 튜터는 아직 연결 전이에요 (S6-3)');
      }}
    >
      <span className="ai-chip self-center">AI 튜터</span>
      <input
        id="tutor-question"
        className="min-w-0 flex-1 rounded-sm border border-line px-3 py-2"
        placeholder="올린 자료 내용 무엇이든 물어보세요 (답에 근거 페이지 표시)"
        autoComplete="off"
      />
      <Button type="submit" variant="primary">
        질문
      </Button>
    </form>
  );
}

export default function S6Home() {
  const { data: today, isPending, isError, refetch } = useToday();
  const openModal = useUiStore((s) => s.openModal);
  if (isPending) return <LoadingState title="오늘 할 일을 불러오는 중이에요" />;
  if (isError) return <ErrorState title="오늘 할 일을 불러오지 못했어요" onRetry={refetch} />;

  const subjectsById = Object.fromEntries(today.subjects.map((s) => [s.id, s]));
  const firstExam = [...today.exams].sort((a, b) => a.dday - b.dday)[0];
  const { progress } = today;
  const openRecord = (taskId) => openModal('S7', { taskId });

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex min-w-0 flex-col gap-4" aria-label="오늘 할 일">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-[13px] text-fg-2">
                {fmtFull(today.date)} · {subjectsById[firstExam.subjectId]?.name} 시험 D-
                {firstExam.dday}
              </p>
              <h1 className="text-2xl font-bold">
                오늘 할 일 {progress.doneCount}/{progress.totalCount} · {progress.rate}%{' '}
                <span className="num text-base font-semibold text-fg-2">
                  ({progress.donePages}/{progress.totalPages}p)
                </span>
              </h1>
            </div>
            <QuizBanner today={today} />
          </div>
          <ProgressBar
            value={progress.rate}
            mark={today.quiz.openRate}
            label={`오늘 계획 ${progress.rate}%`}
          />
          <QuizGuideBox today={today} subjectsById={subjectsById} onContinue={openRecord} />
          <div className="flex flex-col gap-2.5">
            {today.tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                subject={subjectsById[t.subjectId]}
                onRecord={openRecord}
              />
            ))}
          </div>
        </section>
        <aside className="flex flex-col gap-4">
          <ExamsCard today={today} subjectsById={subjectsById} />
          <RecentBooksCard today={today} />
        </aside>
      </div>
      <TutorBar />
    </>
  );
}
