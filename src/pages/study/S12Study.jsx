// S12 집중 모드 · S12-1 공부 끝 — 신민종
// 공부 시간은 화면이 재지 않아요. 시작·멈춤·재개·종료를 서버에 보내고 받은 분만 보여줘요 (HM-07·08).
// 시간 숫자는 숨기고 [시간 보기]를 누르면 3초만. 새로고침해도 서버 측정이 이어져요.
// 종료하면 주소에 ?done=세션 id가 붙어서 새로고침해도 S12-1이 그대로 보여요.
import { BookOpen, Eye, FileText, Pause } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import PdfPageDialog from '@/components/common/PdfPageDialog.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { APP_NAME } from '@/config/app.js';
import {
  useActiveSession,
  useEndSession,
  usePauseSession,
  useResumeSession,
  useSession,
  useStartSession,
} from '@/hooks/useStudy.js';
import { useUiStore } from '@/stores/uiStore.js';
import { pagedRanges, rangeInputLabel, taskRangeLabel } from './recordInput.js';

const SHOW_TIME_MS = 3000;
const hm = (m) =>
  m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : m ? `${m}분` : '1분 미만';

function FocusHeader({ right }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-3 px-6">
        <p className="flex items-baseline gap-2">
          <span className="display text-[20px]">{APP_NAME}</span>
          <span className="text-[12.5px] text-fg-2">· 집중 모드</span>
        </p>
        {right}
      </div>
    </header>
  );
}

// 펼쳐지는 책 (들어올 때 한 번) · 멈추면 살짝 덮여요
function FocusBook({ closed }) {
  return (
    <span className={`focus-book ${closed ? 'is-closed' : ''}`} aria-hidden="true">
      <span className="focus-page focus-page-left" />
      <span className="focus-page focus-page-right" />
    </span>
  );
}

// HM-09: 예상 시간 2배가 지나면 오른쪽 아래에 조용히
function CheckIn({ onContinue, onEnd, busy }) {
  return (
    <div
      role="alertdialog"
      aria-label="아직 공부 중이에요?"
      className="fixed right-5 bottom-5 z-40 w-[min(320px,calc(100vw-40px))] rounded-2xl border border-dashed border-line-2 bg-surface p-4 shadow-[0_24px_48px_-28px_rgb(0_0_0/0.9)]"
    >
      <p className="text-[13.5px] font-semibold">아직 공부 중이에요?</p>
      <p className="mt-1 text-[11.5px] text-fg-2">
        예상 시간의 2배가 지났어요. 10분 동안 답이 없으면 지금 시점에서 멈춰요.
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="primary" disabled={busy} onClick={onContinue}>
          계속 공부
        </Button>
        <Button size="sm" disabled={busy} onClick={onEnd}>
          종료하기
        </Button>
      </div>
    </div>
  );
}

function Focus({ session, onEnded }) {
  const pause = usePauseSession();
  const resume = useResumeSession();
  const end = useEndSession();
  const { refetch } = useActiveSession();
  const [shown, setShown] = useState(null); // [시간 보기]로 받은 분
  const [reading, setReading] = useState(null); // 실제 materialId/page를 보존해 PDF를 열어요
  const ranges = pagedRanges(session.task);
  const defaultMaterial = session.material;
  const paused = session.status === 'paused';
  const busy = pause.isPending || resume.isPending || end.isPending;
  const fail = { onError: (e) => toast.error(e.message) };

  useEffect(() => {
    if (shown == null) return undefined;
    const id = setTimeout(() => setShown(null), SHOW_TIME_MS);
    return () => clearTimeout(id);
  }, [shown]);

  const showTime = async () => {
    const { data, error } = await refetch();
    if (error) toast.error(error.message);
    if (data) setShown(data.minutes);
  };
  const finish = async () => {
    try {
      // active 캐시가 비면서 Focus가 unmount되어도 종료 화면으로 이동해요.
      onEnded(await end.mutateAsync(session.id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <FocusHeader
        right={
          <button
            type="button"
            onClick={showTime}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line-2 px-3 py-1.5 text-[12px] font-semibold text-fg-soft hover:border-fg-soft hover:text-fg"
          >
            <Eye size={13} aria-hidden="true" />
            시간 보기
          </button>
        }
      />
      <main className="mx-auto flex w-full max-w-[860px] flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <FocusBook closed={paused} />
        {paused ? (
          <Card className="mt-6 w-full max-w-[420px] px-6 py-8">
            <h1 className="text-[22px]">잠깐 멈췄어요</h1>
            <p className="mt-2 text-[12.5px] text-fg-2">
              책이 살짝 덮였어요. 멈춘 시간은 측정에서 빠지고, 다시 시작하면 이어서 재요.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="primary"
                disabled={busy}
                onClick={() => resume.mutate(session.id, fail)}
              >
                다시 시작
              </Button>
              <Button disabled={busy} onClick={finish}>
                종료
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <h1 className="mt-6 max-w-[640px] text-[26px] leading-snug">
              {session.subjectName} · {session.task.title} 공부 중
            </h1>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="badge num">
                {taskRangeLabel(session.task)} · {session.task.pages}p
              </span>
              <span className="badge num">예상 {session.task.minutes}분</span>
            </div>
            <p className="display mt-10 text-[24px] leading-snug">{session.quote}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-2">
              <Button disabled={!defaultMaterial} onClick={() => setReading(defaultMaterial)}>
                <FileText size={13} aria-hidden="true" />
                자료 열기
              </Button>
              <Button disabled={busy} onClick={() => pause.mutate(session.id, fail)}>
                <Pause size={13} aria-hidden="true" />
                잠깐 멈춤
              </Button>
              <Button variant="primary" disabled={busy} onClick={finish}>
                종료
              </Button>
            </div>
            {ranges.length > 1 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {ranges.map((range, index) => (
                  <Button
                    key={range.id}
                    size="sm"
                    disabled={!range.materialId}
                    onClick={() => setReading({ id: range.materialId, page: range.from })}
                  >
                    {rangeInputLabel(session.task, range, index)} 열기
                  </Button>
                ))}
              </div>
            )}
            <p className="mt-9 max-w-[520px] text-[11.5px] text-fg-2">
              공부하는 동안 시간 숫자는 보이지 않아요. 오른쪽 위 [시간 보기]를 누르면 3초 동안
              보여요.
            </p>
          </>
        )}
      </main>
      {shown != null && (
        <div
          role="status"
          className="num fixed top-[74px] right-6 z-50 rounded-full border border-brand-line bg-brand-tint px-3.5 py-1.5 text-[12.5px] font-bold text-brand-deep"
        >
          {shown ? `${shown}분째` : '1분 미만'}
        </div>
      )}
      {reading && (
        <PdfPageDialog
          materialId={reading.id}
          page={reading.page}
          title={`${session.subjectName} 강의자료`}
          note="자료를 봐도 공부 측정은 계속돼요. 닫으면 공부 화면으로 돌아와요."
          onClose={() => setReading(null)}
        />
      )}
      {session.checkIn && (
        <CheckIn busy={busy} onContinue={() => resume.mutate(session.id, fail)} onEnd={finish} />
      )}
    </>
  );
}

// S12-1 공부 끝 (HM-08)
function Done({ session }) {
  const navigate = useNavigate();
  const openModal = useUiStore((s) => s.openModal);
  const record = () => {
    navigate(ROUTES.home);
    openModal('S7', {
      taskId: session.taskId,
      sessionId: session.id,
      sessionMinutes: session.minutes,
    });
  };
  return (
    <>
      <FocusHeader />
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-line-2 text-fg-soft">
          <BookOpen size={30} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-[28px]">
          {session.subjectName} {hm(session.minutes)} 공부했어요
        </h1>
        <p className="num mt-2 text-[12.5px] text-fg-2">
          오늘 총 {hm(session.todayMinutes)} · {session.subjectName} 지금까지{' '}
          {hm(session.subjectMinutes)}
        </p>
        <p className="mt-5 text-[13px] text-fg-soft">
          {session.autoStopped
            ? '알림에 10분 동안 답이 없어서 알림이 뜬 시점까지만 쟀어요. 이 기록은 속도 보정에서 빠져요.'
            : `멈춘 ${session.pausedMinutes}분은 빼고 쟀어요.`}{' '}
          이제 어디까지 했는지 기록하면 책이 쌓여요.
        </p>
        {session.recorded ? (
          <Link className="btn btn-primary mt-8" to={ROUTES.home}>
            홈으로
          </Link>
        ) : (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={record}>
              기록하기
            </Button>
            <Button
              onClick={() => {
                toast(`측정한 ${hm(session.minutes)}을 저장했어요. 홈에서 기록할 수 있어요`);
                navigate(ROUTES.home);
              }}
            >
              나중에 기록
            </Button>
          </div>
        )}
      </main>
    </>
  );
}

function DoneLoader({ id }) {
  const { data, isPending, isError, refetch } = useSession(id);
  if (isPending) return <LoadingState title="공부 기록을 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;
  return <Done session={data} />;
}

export default function S12Study() {
  const [params, setParams] = useSearchParams();
  const taskId = params.get('task');
  const doneId = params.get('done');
  const start = useStartSession();
  const { data: active, isPending, isError, error, refetch } = useActiveSession(!doneId);

  // 들어올 때 한 번만 정해요: 같은 태스크가 진행 중이면 이어서, 아니면 시작.
  // (종료 직후 진행 중 측정이 비어도 다시 시작하지 않게)
  const decided = useRef(null);
  const { mutate } = start;
  useEffect(() => {
    if (decided.current === taskId || doneId || !taskId || isPending || isError) return;
    decided.current = taskId;
    if (active?.taskId === taskId) return;
    mutate(taskId, { onError: (e) => toast.error(e.message) });
  }, [doneId, taskId, isPending, isError, active, mutate]);

  useEffect(() => {
    if (!doneId && active?.taskId === taskId && active.status === 'ended')
      setParams({ task: taskId, done: active.id }, { replace: true });
  }, [active, doneId, taskId, setParams]);

  if (doneId) return <DoneLoader id={doneId} />;
  if (!taskId)
    return (
      <ErrorState
        title="공부할 태스크를 골라 주세요"
        description="홈에서 태스크의 [시작]을 눌러 들어와요."
      />
    );
  if (isError)
    return (
      <ErrorState
        title="집중 상태를 불러오지 못했어요"
        description={error.message}
        onRetry={refetch}
      />
    );
  if (start.isError)
    return (
      <ErrorState
        title="집중 모드를 시작하지 못했어요"
        description={start.error.message}
        onRetry={() => mutate(taskId, { onError: (failure) => toast.error(failure.message) })}
      />
    );
  const session = active?.taskId === taskId ? active : null;
  if (!session) return <LoadingState title="책을 펼치는 중이에요" />;
  return (
    <Focus
      session={session}
      onEnded={(s) => setParams({ task: taskId, done: s.id }, { replace: true })}
    />
  );
}
