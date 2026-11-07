// S6 홈 — 신민종 (S6-2 조금 밀린 날, S6-3 AI 튜터 답변은 같은 주소의 상태로 11/9·11/10에 추가)
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import BookBlock from '@/components/book/BookBlock.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import ProgressBar from '@/components/common/ProgressBar.jsx';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import TaskCard from '@/components/home/TaskCard.jsx';
import { fmtFull, toDay } from '@/config/date.js';
import { PLAN_OPTION } from '@/config/labels.js';
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

// S6-2 조금 밀린 날: 기준 미만으로 밀린 분량을 오늘 맨 위로 이월했다는 안내 (RC-01)
function CarryNotice({ today, subjectsById }) {
  const ackOn = useUiStore((s) => s.noticeAckOn);
  const ack = useUiStore((s) => s.ackNotice);
  const n = today.notice;
  if (n?.type !== 'carry' || ackOn === today.date) return null;
  return (
    <section className="ai-box border-solid" aria-label="이월 안내">
      <span className="ai-chip">AI</span>
      {n.items.map((i) => {
        const name = subjectsById[i.subjectId]?.name;
        return (
          <div key={i.subjectId} className="flex flex-col gap-1">
            <strong>
              어제 {name} p.{i.from}–{i.to}({i.pages}p)를 못 했어요
            </strong>
            <p className="text-[13px] text-fg-2">
              {name} 하루 평균 계획(약 {i.dailyAvg}p)의 {i.ratio}%라 분배안 없이 오늘 맨 위에
              넣었어요. 밀린 양이 50%를 넘으면 다시 짜는 안을 보여줄게요.
            </p>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2">
        {/* TODO(확인필요): [기획 확인] '다른 날로 옮기기'를 누르면 어디로 가는지(캘린더에서 고르기 등) 정해지면 연결해요 */}
        <Button size="sm" disabled title="옮기는 방식 확인 중이에요">
          다른 날로 옮기기
        </Button>
        <Button size="sm" variant="primary" onClick={() => ack(today.date)}>
          확인
        </Button>
      </div>
    </section>
  );
}

// 분배안을 아직 고르지 않았을 때 (P2를 닫은 뒤)
function ReplanReminder({ today }) {
  const openModal = useUiStore((s) => s.openModal);
  if (!today.replan) return null;
  return (
    <section
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border-2 border-fg p-4"
      aria-label="분배안 안내"
    >
      <div className="flex flex-col gap-0.5">
        <strong>어제 {today.replan.totalPages}p가 밀렸어요</strong>
        <span className="text-[13px] text-fg-2">
          남은 일정을 다시 짠 안 3개 중 하나를 골라 주세요.
        </span>
      </div>
      <Button variant="primary" onClick={() => openModal('P2')}>
        분배안 보기
      </Button>
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

// 최근 7일 쌓은 책 — 요일별로 가로 책 더미 (11/7 결정 Q3 A, 참고 이미지 7)
function RecentBooksCard({ today }) {
  const dropped = useUiStore((s) => s.droppedTaskId);
  const setDropped = useUiStore((s) => s.setDroppedTaskId);
  // 떨어지는 움직임은 기록한 직후 한 번만 — 다른 탭에 갔다 와도 다시 떨어지지 않게 지워요
  useEffect(() => {
    if (!dropped) return undefined;
    const id = setTimeout(() => setDropped(null), 900);
    return () => clearTimeout(id);
  }, [dropped, setDropped]);
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
        className="flex items-end justify-between gap-1.5"
        role="img"
        aria-label="최근 7일 동안 쌓은 책"
      >
        {today.recentDays.map((d, i) => {
          const isToday = i === today.recentDays.length - 1;
          return (
            <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div
                className={`flex min-h-16 w-full max-w-11 flex-col-reverse gap-[2px] border-b-[3px] border-line px-0.5 pb-0.5 ${isToday ? 'rounded-t-sm bg-surface-2' : ''}`}
              >
                {d.blocks.map((b, k) => (
                  <BookBlock
                    key={k}
                    state={b.state}
                    seed={i * 2 + k}
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
        책 1권 = 태스크 1개 · 책에는 과목 색을 쓰지 않아요 · 점선 = 남은 계획
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
  const { data: today, isPending, isError, error, refetch } = useToday();
  const openModal = useUiStore((s) => s.openModal);
  const replanShownOn = useUiStore((s) => s.replanShownOn);
  const markReplanShown = useUiStore((s) => s.markReplanShown);

  // 분배안은 밀린 분량이 기준을 넘었을 때만, 다음 접속 시 한 번 자동으로 떠요 (정의서 3장)
  useEffect(() => {
    if (today?.replan && replanShownOn !== today.date) {
      markReplanShown(today.date);
      openModal('P2');
    }
  }, [today, replanShownOn, markReplanShown, openModal]);

  if (isPending) return <LoadingState title="오늘 할 일을 불러오는 중이에요" />;
  if (isError && error?.code === 'NO_PLAN')
    return (
      <EmptyState
        title="아직 계획이 없어요"
        description="일정과 강의자료를 넣으면 AI가 시험까지의 계획을 짜 드려요."
        action={
          <Link className="btn btn-primary" to={ROUTES.s1}>
            계획 만들기
          </Link>
        }
      />
    );
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
          <ReplanReminder today={today} />
          <CarryNotice today={today} subjectsById={subjectsById} />
          {today.notice?.type === 'replanned' && (
            <p className="text-[13px] text-fg-2">
              분배안 {today.notice.planKey} · {PLAN_OPTION[today.notice.planKey]}를 적용했어요. 어제
              몫을 오늘 할 일 맨 위에 넣었어요.
            </p>
          )}
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
