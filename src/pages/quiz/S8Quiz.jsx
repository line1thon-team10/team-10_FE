// S8 오늘의 퀴즈 — 신민종
// S8-1 과목 고르기 → S8 한 화면 한 문제 (서술형은 S8-3, 채점은 마지막 제출 때) → P3 → S8-2
// 풀 때는 근거 페이지와 정답 여부를 보여주지 않아요. 확실/애매를 골라야 다음으로 가요 (QZ-05·12)
import { Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ROUTES } from '@/app/screens.js';
import { MockBadge } from '@/components/common/Badge.jsx';
import { AiFail, AiProgress, SavedTag } from '@/components/common/AiProgress.jsx';
import AiWait from '@/components/common/AiWait.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import ProgressBar from '@/components/common/ProgressBar.jsx';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { CONFIDENCE, QUIZ_TYPE } from '@/config/labels.js';
import { useAiWait } from '@/hooks/useAiWait.js';
import { isAiFail } from '@/lib/aiError.js';
import { useQuizSet, useQuizToday, useSaveQuizAnswer, useSubmitQuiz } from '@/hooks/useQuiz.js';
import P3BookColor from './P3BookColor.jsx';
import {
  acceptAnswerSave,
  answerRequest,
  canSaveAnswer,
  createAnswerDraft,
  draftAnswers,
  editAnswerDraft,
  refreshAnswerDraft,
  chooseSavedAnswer,
} from './answerDraft.js';

const statusOf = (s) =>
  s.result ? 'done' : !s.open ? 'locked' : !s.hasQuestions ? 'empty' : 'open';

// S8-1 퀴즈 고르기 (디자인 QuizPick)
function SubjectPicker() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useQuizToday();
  if (isPending) return <LoadingState title="오늘의 퀴즈를 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;
  const opened = data.subjects.filter((s) => statusOf(s) !== 'locked');
  const locked = data.subjects.filter((s) => statusOf(s) === 'locked');
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="label text-brand-deep">오늘의 퀴즈</p>
          <h1 className="mt-2 text-[30px]">오늘의 퀴즈</h1>
          <p className="mt-2 text-[13px] text-fg-2">
            오늘 계획의 {data.rate}%를 했어요. 과목을 골라 풀어 보세요. 풀기는 선택이에요.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-sm" to={ROUTES.review}>
            누적 오답 노트
          </Link>
          <Link className="btn btn-sm" to={ROUTES.home}>
            홈으로
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {opened.map((s) => {
          const status = statusOf(s);
          return (
            <Card key={s.subjectId} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="flex items-center gap-2 text-[17px]">
                  <span
                    className="h-3.5 w-1 rounded-full"
                    style={{ background: s.color }}
                    aria-hidden="true"
                  />
                  {s.name}
                </h2>
                <span className="badge border-brand-line text-brand-deep">
                  {status === 'done' ? '다 풂' : `열림 · 오늘 ${s.rate}%`}
                </span>
              </div>
              <p className="display num text-[30px] leading-none">{s.count}문항</p>
              {s.lines.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {s.lines.map((l) => (
                    <li key={l} className="flex items-start gap-1.5 text-[12px] text-fg-2">
                      <span
                        className="mt-[7px] h-1 w-1 flex-none rounded-full bg-line-2"
                        aria-hidden="true"
                      />
                      {l}
                    </li>
                  ))}
                </ul>
              ) : (
                // 구성 줄(lines)이 없는 과목은 '구성 확인 중'으로 보여요
                <p className="text-[12px] text-fg-3">구성 확인 중</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {s.difficulty && (
                  <span className="badge">
                    {s.difficulty} · {s.round}
                  </span>
                )}
                {s.essayCount > 0 && <span className="badge">서술형 {s.essayCount}</span>}
                {status === 'empty' && <MockBadge />}
              </div>
              {status === 'done' ? (
                <Link
                  className="btn mt-auto w-full"
                  to={`${ROUTES.quizResult}?subject=${s.subjectId}`}
                >
                  다 풂 · {s.result.correct}/{s.result.total} 결과 보기
                </Link>
              ) : (
                <Button
                  className="mt-auto w-full"
                  variant={status === 'open' ? 'primary' : 'secondary'}
                  disabled={status !== 'open'}
                  onClick={() => navigate(`${ROUTES.quiz}?subject=${s.subjectId}`)}
                >
                  {status === 'empty' ? '문항 준비 중' : '풀기'}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
      {locked.map((s) => (
        <div
          key={s.subjectId}
          aria-disabled="true"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-line-2 px-4 py-3"
        >
          <p className="flex flex-wrap items-baseline gap-2 text-fg-2">
            <b className="text-[15px] font-semibold">{s.name}</b>
            <span className="num text-[12px]">
              {s.count}문항 · 오늘 {s.rate}%
            </span>
          </p>
          <span className="flex items-center gap-1.5 text-[12px] text-fg-2">
            <Lock size={12} aria-hidden="true" />
            잠김 · {data.openRate}%부터 열려요
          </span>
        </div>
      ))}
      <p className="text-[12px] text-fg-2">오늘 풀지 않은 퀴즈는 내일 퀴즈에 합쳐서 나와요.</p>
    </>
  );
}

// 마지막 제출 때 채점 대기 (디자인 QuizGrading · NF-05·10)
function Grading({ startedAt, failed, onRetry, onSaved }) {
  const wait = useAiWait(startedAt, !failed);
  return (
    <Card className="mx-auto flex w-full max-w-[560px] flex-col gap-3">
      <h2 className="text-[18px]">채점하고 있어요</h2>
      <p className="text-[12.5px] text-fg-2">
        답은 저장했어요. 서술형은 AI가 표현이 아니라 맥락과 핵심 개념으로 0~100점을 매겨요.
      </p>
      {failed ? (
        // 채점 실패 (NF-10): 답은 저장돼 있어요. 결과는 저장된 채점(70점 · 빠진 단계 · 근거 p.82)으로
        <div className="flex flex-col gap-2">
          <p className="text-[12.5px]">답은 저장했고 채점되면 결과에 넣을게요.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="primary" onClick={onSaved}>
              결과 보기
            </Button>
            <Button size="sm" onClick={onRetry}>
              다시 시도
            </Button>
          </div>
        </div>
      ) : (
        <AiWait
          phase={wait}
          label="AI가 서술형을 채점하고 있어요"
          retryNote="응답이 없으면 저장된 채점으로 결과를 보여드려요"
          onRetry={onSaved}
        />
      )}
    </Card>
  );
}

function Player({ subjectId, quizId }) {
  const [, setParams] = useSearchParams();
  const [savedSet, setSavedSet] = useState(false); // AI 출제가 안 되면 저장된 결과 (NF-10)
  const { data: set, isPending, isError, error, refetch } = useQuizSet(subjectId, savedSet, quizId);
  useEffect(() => {
    if (!set?.quizId || quizId === set.quizId) return;
    setParams(
      (params) => {
        const next = new URLSearchParams(params);
        next.set('quizId', set.quizId);
        return next;
      },
      { replace: true },
    );
  }, [quizId, set?.quizId, setParams]);

  // AI 상태 (NF-05·10): 퀴즈 준비 / 실패 / 저장된 결과
  if (isPending)
    return (
      <Card className="mx-auto flex w-full max-w-[560px] flex-col gap-3">
        <h2 className="text-[18px]">오늘의 퀴즈를 준비하고 있어요</h2>
        <AiProgress
          label="오늘 공부한 범위에서 문제를 고르고 있어요"
          onSaved={() => setSavedSet(true)}
        />
      </Card>
    );
  if (!set && isError && isAiFail(error))
    return (
      <Card className="mx-auto w-full max-w-[560px]">
        <AiFail
          message="문제를 불러오지 못했어요 · 오늘 기록은 저장돼 있어요"
          onRetry={refetch}
          onSaved={() => setSavedSet(true)}
        />
      </Card>
    );
  if (!set && isError)
    return error?.code === 'NO_QUIZ' ? (
      <EmptyState
        title="이 과목 문항은 아직 준비 중이에요"
        description="다른 과목을 먼저 풀어 주세요."
        action={
          <Link className="btn" to={ROUTES.quiz}>
            과목 고르기
          </Link>
        }
      />
    ) : (
      // 서버 문구를 같이 보여요 (예: QUIZ_LOCKED '오늘 계획의 70%를 넘기면 열려요')
      <ErrorState description={error?.message} onRetry={refetch} />
    );

  if (!set.quizId || !set.questions.length)
    return (
      <ErrorState
        description="퀴즈 세트를 확인하지 못했어요. 다시 불러와 주세요."
        onRetry={refetch}
      />
    );
  return <QuizPlayer key={set.quizId} set={set} subjectId={subjectId} reload={refetch} />;
}

function QuizPlayer({ set, subjectId, reload }) {
  const navigate = useNavigate();
  const submit = useSubmitQuiz();
  const save = useSaveQuizAnswer();
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState(() => createAnswerDraft(set));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [conflict, setConflict] = useState(null);
  const inFlight = useRef(false);
  const [startedAt, setStartedAt] = useState(null);
  const [result, setResult] = useState(null);
  const toResult = () => navigate(`${ROUTES.quizResult}?subject=${set.resultFor}`);
  // 문제 뽑기 세트처럼 책 색이 안 바뀌면 P3 없이 결과로
  if (result && result.bookChanges.length)
    return <P3BookColor result={result} onClose={toResult} />;

  const send = (savedGrading = false) => {
    setStartedAt(Date.now());
    submit.mutate(
      { subjectId, quizId: set.quizId, answers: draftAnswers(draft), savedGrading },
      { onSuccess: (r) => (r.bookChanges.length ? setResult(r) : toResult()) },
    );
  };
  if (startedAt)
    return (
      <Grading
        startedAt={startedAt}
        failed={submit.isError}
        onRetry={() => send(false)}
        onSaved={() => send(true)}
      />
    );

  const total = set.questions.length;
  const q = set.questions[idx];
  const a = draft.items[q.id].input;
  const set1 = (patch) => setDraft((state) => editAnswerDraft(state, q.id, patch));
  const last = idx === total - 1;
  const ready = canSaveAnswer(draft, q.id);
  const busy = saving || conflict?.status === 'loading';

  const refreshConflict = async (questionId) => {
    setConflict({ questionId, status: 'loading' });
    try {
      const { data } = await reload({ throwOnError: true });
      if (data.quizId !== draft.quizId) throw new Error('같은 퀴즈의 답안을 불러오지 못했어요.');
      setDraft((state) => refreshAnswerDraft(state, data, questionId));
      setConflict({ questionId, status: 'ready' });
      setSaveError('');
    } catch (error) {
      setConflict({ questionId, status: 'error' });
      setSaveError(error.message);
    }
  };
  const saveNext = async () => {
    if (inFlight.current || !ready) return;
    inFlight.current = true;
    setSaving(true);
    setSaveError('');
    setConflict(null);
    const request = answerRequest(draft, q.id);
    try {
      const response = await save.mutateAsync({ subjectId, ...request });
      setDraft((state) => acceptAnswerSave(state, request, response));
      if (last) send(false);
      else setIdx((i) => i + 1);
    } catch (error) {
      if (error.code === 'ANSWER_CONFLICT') await refreshConflict(q.id);
      else setSaveError(error.message);
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="label text-brand-deep">오늘의 퀴즈</p>
          <h1 className="mt-2 text-[24px]">
            {set.name} {total}문항 · {set.composition}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="badge">
              {set.round} · 난이도 {set.difficulty}
            </span>
            <span className="badge">한 화면에 한 문제</span>
            {set.saved && <SavedTag />}
          </div>
        </div>
        <Button size="sm" disabled={busy} onClick={() => navigate(ROUTES.quiz)}>
          과목 다시 고르기
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={((idx + 1) / total) * 100} label={`${idx + 1} / ${total}`} />
        </div>
        <b className="num text-[13px]">
          {idx + 1} / {total}
        </b>
      </div>

      <Card className="mx-auto flex w-full max-w-[760px] flex-col gap-4 p-6">
        <p className="num flex flex-wrap items-center gap-2 text-[12.5px] text-fg-2">
          <span className="ai-chip">AI 출제</span>Q{idx + 1} · {QUIZ_TYPE[q.type]}
          {q.tag && ` · ${q.tag}`}
          {q.mockFilled.length > 0 && <MockBadge />}
        </p>
        <h2 className="font-sans text-[18px] font-semibold">{q.prompt}</h2>

        {q.type === 'choice' && (
          <fieldset className="flex flex-col gap-2" disabled={busy}>
            <legend className="sr-only">보기</legend>
            {q.options.map((o, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[13.5px] transition-colors ${a.choice === i ? 'border-brand-line bg-brand-tint' : 'border-line-2 hover:border-fg-2'}`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  className="accent-brand"
                  checked={a.choice === i}
                  onChange={() => set1({ choice: i })}
                />
                {o}
              </label>
            ))}
          </fieldset>
        )}
        {q.type === 'short' && (
          <input
            id={`q-${q.id}`}
            aria-label="답"
            className="rounded-xl border border-line-2 bg-bg px-3.5 py-2.5"
            placeholder="답을 입력하세요"
            value={a.text ?? ''}
            onChange={(e) => set1({ text: e.target.value })}
            autoComplete="off"
            disabled={busy}
          />
        )}
        {/* S8-3 서술형: 여러 줄 입력. 채점은 마지막 제출 때라 기다리지 않고 다음 문제로 */}
        {q.type === 'essay' && (
          <>
            <textarea
              id={`q-${q.id}`}
              aria-label="답"
              rows={6}
              className="rounded-xl border border-line-2 bg-bg px-3.5 py-2.5"
              placeholder="핵심 단계를 순서대로 적어 보세요"
              value={a.text ?? ''}
              onChange={(e) => set1({ text: e.target.value })}
              disabled={busy}
            />
            <p className="text-[11.5px] text-fg-2">
              다음으로 넘어갈 때 답을 저장해요. 답을 비운 채로도 저장할 수 있어요.
            </p>
          </>
        )}

        <fieldset className="flex flex-col gap-1.5" disabled={busy}>
          <legend className="mb-1.5 text-[13px] font-semibold">얼마나 확신해요? (필수)</legend>
          <div className="flex gap-2">
            {Object.entries(CONFIDENCE).map(([k, label]) => (
              <label
                key={k}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${a.confidence === k ? 'border-ink bg-ink text-ink-fg' : 'border-line-2 hover:border-fg-2'}`}
              >
                <input
                  type="radio"
                  name={`conf-${q.id}`}
                  className="sr-only"
                  checked={a.confidence === k}
                  onChange={() => set1({ confidence: k })}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {saveError && (
          <p role="alert" className="text-[13px] text-fg-2">
            {saveError} 입력은 유지했어요.
          </p>
        )}
        {conflict && (
          <div
            className="flex flex-col gap-2 rounded-xl border border-line-2 p-3"
            aria-live="polite"
          >
            <p className="text-[13px]">
              {conflict.status === 'loading'
                ? '같은 퀴즈의 최신 답안을 확인하고 있어요.'
                : conflict.status === 'error'
                  ? '최신 답안을 다시 불러온 뒤 저장해 주세요.'
                  : '다른 곳에서 저장한 답이 있어요. 작성 중인 입력은 유지했어요.'}
            </p>
            {conflict.status === 'ready' && (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="primary" disabled={!ready || busy} onClick={saveNext}>
                  내 입력으로 다시 저장
                </Button>
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    setDraft((state) => chooseSavedAnswer(state, q.id));
                    setConflict(null);
                  }}
                >
                  서버 답안 사용
                </Button>
              </div>
            )}
            {conflict.status === 'error' && (
              <Button size="sm" onClick={() => refreshConflict(q.id)}>
                최신 답안 다시 불러오기
              </Button>
            )}
          </div>
        )}
        {saving && (
          <p role="status" className="text-[12px] text-fg-2">
            답안을 저장하고 있어요.
          </p>
        )}
        <div className="flex justify-between gap-2 border-t border-line pt-4">
          <Button
            disabled={idx === 0 || busy || Boolean(conflict)}
            onClick={() => {
              setSaveError('');
              setIdx((i) => i - 1);
            }}
          >
            이전
          </Button>
          <Button
            variant="primary"
            disabled={!ready || busy || Boolean(conflict)}
            onClick={saveNext}
          >
            {saving ? '저장 중…' : last ? '제출하고 채점하기' : '다음'}
          </Button>
        </div>
      </Card>
    </>
  );
}

export default function S8Quiz() {
  const [params] = useSearchParams();
  const subjectId = params.get('subject');
  return subjectId ? (
    <Player key={subjectId} subjectId={subjectId} quizId={params.get('quizId')} />
  ) : (
    <SubjectPicker />
  );
}
