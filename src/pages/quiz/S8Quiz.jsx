// S8 오늘의 퀴즈 — 신민종
// 과목 고르기(시안 없음, 제안안 구성) → 문항 풀이(와이어프레임 S8). 확실/애매를 고르지 않으면 넘어갈 수 없어요 (QZ-05).
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import AiBox from '@/components/common/AiBox.jsx';
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { POLICY } from '@/config/app.js';
import { CONFIDENCE, QUIZ_TYPE } from '@/config/labels.js';
import { useQuizSet, useQuizToday, useSubmitQuiz } from '@/hooks/useQuiz.js';

function SubjectPicker() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useQuizToday();
  if (isPending) return <LoadingState title="오늘의 퀴즈를 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">오늘의 퀴즈</h1>
        <p className="text-fg-2">
          오늘 계획의 {data.openRate}%를 넘기면 열려요. 과목별로 {data.openRate}%를 넘긴 과목은 먼저
          풀 수 있어요.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {data.subjects.map((s) => {
          const status = s.result
            ? 'done'
            : !s.open
              ? 'locked'
              : !s.hasQuestions
                ? 'empty'
                : 'open';
          return (
            <Card key={s.subjectId} className="flex flex-col gap-2.5">
              <h2 className="font-semibold" style={{ color: s.color }}>
                {s.name}
              </h2>
              <b className="num text-xl">{s.count ? `${s.count}문항` : '문항 수 확인 중'}</b>
              <p className="text-[13px] text-fg-2">
                {status === 'done' && `다 풀었어요 · ${s.result.correct}/${s.result.total}`}
                {status === 'locked' && `오늘 이 과목 ${s.rate}% · ${data.openRate}%부터 열려요`}
                {status === 'empty' && (
                  <>
                    이 과목 문항은 목업에 아직 없어요{' '}
                    <span className="align-middle">
                      <MockBadge />
                    </span>
                  </>
                )}
                {status === 'open' && `오늘 이 과목 ${s.rate}% · 풀 수 있어요`}
              </p>
              {status === 'done' ? (
                <Link className="btn" to={`${ROUTES.quizResult}?subject=${s.subjectId}`}>
                  결과 보기
                </Link>
              ) : (
                <Button
                  variant={status === 'open' ? 'primary' : 'secondary'}
                  disabled={status !== 'open'}
                  onClick={() => navigate(`${ROUTES.quiz}?subject=${s.subjectId}`)}
                >
                  {status === 'locked'
                    ? '아직 잠겨 있어요'
                    : status === 'empty'
                      ? '문항 준비 중'
                      : '풀기 시작'}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
      <p className="text-[13px] text-fg-2">오늘 풀지 않은 퀴즈는 내일 퀴즈에 합쳐서 나와요.</p>
    </>
  );
}

function Rules() {
  return (
    <Card className="flex flex-col gap-2">
      <h2 className="font-semibold">문항 구성</h2>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-[13px]">
        <li>공부한 단원마다 5문항 + 어제 오답 전부</li>
        <li>1회독은 하 · 2회독부터 난이도를 직접 골라요</li>
        <li>서술형은 0~100점 · {POLICY.essayPassScore}점부터 정답</li>
        <li>틀리거나 애매하게 맞힌 문제는 오답 노트로</li>
      </ul>
    </Card>
  );
}

function Player({ subjectId }) {
  const navigate = useNavigate();
  const { data: set, isPending, isError, error, refetch } = useQuizSet(subjectId);
  const submit = useSubmitQuiz();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: { choice, text, confidence } }

  if (isPending) return <LoadingState title="문항을 불러오는 중이에요" />;
  if (isError)
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
      <ErrorState onRetry={refetch} />
    );

  const q = set.questions[idx];
  const a = answers[q.id] ?? {};
  const set1 = (patch) => setAnswers((x) => ({ ...x, [q.id]: { ...x[q.id], ...patch } }));
  const answered = q.type === 'choice' ? a.choice != null : Boolean(a.text?.trim());
  const last = idx === set.questions.length - 1;
  const ready = answered && a.confidence;

  const onSubmit = () =>
    submit.mutate(
      { subjectId, answers },
      {
        onSuccess: () => navigate(`${ROUTES.quizResult}?subject=${subjectId}`),
        onError: (e) => toast.error(`채점하지 못했어요. ${e.message}`),
      },
    );

  if (submit.isPending)
    return <LoadingState title="채점하고 있어요 · 서술형은 AI가 맥락과 핵심 개념으로 채점해요" />;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">오늘의 퀴즈</h1>
          <p className="text-fg-2">
            {set.name} {set.questions.length}문항 · {set.composition}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge">
            {set.round} · 난이도 {set.difficulty}
          </span>
          <span className="badge badge-strong num">
            {idx + 1} / {set.questions.length}
          </span>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <AiBox label="AI">
          <p className="text-xs text-fg-2">자료 기반으로 AI가 출제</p>
          <p className="num text-[12.5px] text-fg-2">
            Q{idx + 1} · {QUIZ_TYPE[q.type]}
            {q.tag && ` · ${q.tag}`} · 근거 {set.name} {q.page}
            {q.mockFilled.length > 0 && (
              <span className="ml-2 align-middle">
                <MockBadge />
              </span>
            )}
          </p>
          <h2 className="text-lg font-semibold">{q.prompt}</h2>

          {q.type === 'choice' && (
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">보기</legend>
              {q.options.map((o, i) => (
                <label
                  key={o}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-sm border px-3.5 py-2.5 ${a.choice === i ? 'border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]' : 'border-line'}`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
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
              className="rounded-sm border border-line px-3 py-2"
              placeholder="답을 입력하세요"
              value={a.text ?? ''}
              onChange={(e) => set1({ text: e.target.value })}
              autoComplete="off"
            />
          )}
          {q.type === 'essay' && (
            <>
              <textarea
                id={`q-${q.id}`}
                aria-label="답"
                rows={4}
                className="rounded-sm border border-line px-3 py-2"
                placeholder="핵심 단계를 순서대로 적어 보세요"
                value={a.text ?? ''}
                onChange={(e) => set1({ text: e.target.value })}
              />
              <p className="text-xs text-fg-2">
                서술형은 AI가 표현이 아니라 맥락과 핵심 개념으로 0~100점을 매겨요.{' '}
                {POLICY.essayPassScore}점부터 정답이에요.
              </p>
            </>
          )}

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-semibold">얼마나 확신해요? (필수)</legend>
            <div className="flex gap-2">
              {Object.entries(CONFIDENCE).map(([k, label]) => (
                <label
                  key={k}
                  className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3.5 py-2 ${a.confidence === k ? 'border-ink bg-ink text-ink-fg' : 'border-line'}`}
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

          <div className="flex justify-between gap-2 pt-1">
            <Button disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>
              이전
            </Button>
            {last ? (
              <Button variant="primary" disabled={!ready} onClick={onSubmit}>
                제출하고 채점하기
              </Button>
            ) : (
              <Button variant="primary" disabled={!ready} onClick={() => setIdx((i) => i + 1)}>
                다음 문제
              </Button>
            )}
          </div>
        </AiBox>
        <aside className="flex flex-col gap-3">
          <Rules />
          <Link className="text-[13px] underline underline-offset-4" to={ROUTES.quiz}>
            과목 다시 고르기
          </Link>
        </aside>
      </div>
    </>
  );
}

export default function S8Quiz() {
  const [params] = useSearchParams();
  const subjectId = params.get('subject');
  return subjectId ? <Player key={subjectId} subjectId={subjectId} /> : <SubjectPicker />;
}
