// S8-2 퀴즈 결과 — 신민종
import { Link, useSearchParams } from 'react-router';
import { ROUTES } from '@/app/screens.js';
import BookBlock from '@/components/book/BookBlock.jsx';
import AiBox from '@/components/common/AiBox.jsx';
import { MockBadge } from '@/components/common/Badge.jsx';
import Card from '@/components/common/Card.jsx';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { POLICY } from '@/config/app.js';
import { CONFIDENCE, GRADE, QUIZ_TYPE } from '@/config/labels.js';
import { useQuizResult } from '@/hooks/useQuiz.js';

const gradeOf = (score) =>
  score == null
    ? null
    : score >= POLICY.gradeStable
      ? 'stable'
      : score >= POLICY.gradeShaky
        ? 'shaky'
        : 'risk';

function ItemCard({ item }) {
  const wrongSure = !item.correct && item.confidence === 'sure';
  return (
    <article className="card flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
        <b className="num">Q{item.no}</b>
        <span className="badge">{QUIZ_TYPE[item.type]}</span>
        {item.tag && <span className="text-fg-2">({item.tag})</span>}
        <span className="ml-auto flex items-center gap-1.5">
          {item.score != null && <span className="num font-semibold">{item.score}점 ·</span>}
          <span
            className={item.correct ? 'badge badge-strong' : 'badge border-st-risk text-st-risk'}
          >
            {item.correct ? '정답' : '오답'}
          </span>
          <span className="badge">{CONFIDENCE[item.confidence]}</span>
        </span>
      </div>
      <p className="text-[14px]">{item.prompt}</p>
      {item.correct && item.confidence === 'unsure' && (
        <p className="text-[13px] text-fg-2">
          애매하게 맞힌 문제라 오답 노트에 남기고 내일 다시 나와요
        </p>
      )}
      {item.type === 'essay' && item.feedback && (
        <AiBox label="AI 채점">
          <p className="text-[13px]">
            {POLICY.essayPassScore}점부터 정답이에요. {item.feedback.good} {item.feedback.miss}{' '}
            <span className="num">근거 {item.page}</span>
          </p>
        </AiBox>
      )}
      {item.type !== 'essay' && item.explanation && (
        <AiBox label="AI 해설">
          <p className="text-[13px]">
            {item.explanation}
            {wrongSure && ' 확실하다고 했는데 틀린 문제라 해설을 먼저 보여줘요.'}{' '}
            <span className="num">근거 {item.page}</span>
            {item.mockFilled.includes('explanation') && (
              <span className="ml-1.5 align-middle">
                <MockBadge />
              </span>
            )}
          </p>
        </AiBox>
      )}
    </article>
  );
}

export default function S8_2Result() {
  const [params] = useSearchParams();
  const subjectId = params.get('subject') ?? 'ds';
  const { data: r, isPending, isError, error, refetch } = useQuizResult(subjectId);

  if (isPending) return <LoadingState title="결과를 불러오는 중이에요" />;
  if (isError)
    return error?.code === 'NO_RESULT' ? (
      <EmptyState
        title="아직 푼 퀴즈가 없어요"
        description="오늘의 퀴즈를 풀면 결과가 여기에 나와요."
        action={
          <Link className="btn btn-primary" to={ROUTES.quiz}>
            오늘의 퀴즈
          </Link>
        }
      />
    ) : (
      <ErrorState onRetry={refetch} />
    );

  const { summary } = r;
  const wrongNos = r.wrongAdded.filter((w) => w.reason === '오답').map((w) => `Q${w.no}`);
  const unsureNos = r.wrongAdded.filter((w) => w.reason !== '오답').map((w) => `Q${w.no}`);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            {r.name} 퀴즈 결과 · {summary.correct}/{summary.total}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-strong">확실 정답 {summary.sureCorrect}</span>
            <span className="badge">애매 정답 {summary.unsureCorrect}</span>
            <span className="badge border-st-risk text-st-risk">오답 {summary.wrong}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn" to={ROUTES.review}>
            오답 노트 보기
          </Link>
          <Link className="btn" to={ROUTES.books}>
            책 쌓기 보기
          </Link>
          <Link className="btn btn-primary" to={ROUTES.home}>
            홈으로
          </Link>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex min-w-0 flex-col gap-2.5" aria-label="문항별 결과">
          {r.items.map((it) => (
            <ItemCard key={it.questionId} item={it} />
          ))}
        </section>
        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h2 className="font-semibold">단원 이해도 변화</h2>
            {r.unitChanges.map((c) => (
              <div key={c.unitNo} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-[13.5px]">
                  <span>
                    {c.unitNo}. {c.title}
                  </span>
                  <span className="num font-semibold">
                    {c.before ?? '–'} → {c.after}
                  </span>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  {c.before == null ? (
                    <span className="text-center text-xs text-fg-3">퀴즈 전</span>
                  ) : (
                    <BookBlock state={gradeOf(c.before)} />
                  )}
                  <span aria-hidden="true">→</span>
                  <BookBlock state={c.grade} />
                </div>
                <span className="text-xs text-fg-2">
                  {GRADE[c.grade].label} · {GRADE[c.grade].signal}
                </span>
                {c.note && <p className="text-xs text-fg-2">{c.note}</p>}
              </div>
            ))}
          </Card>
          <Card className="flex flex-col gap-1.5">
            <h2 className="font-semibold">오답 노트에 {r.wrongAdded.length}문제</h2>
            <p className="text-[13px] text-fg-2">
              {[
                wrongNos.length && `${wrongNos.join('·')} 오답`,
                unsureNos.length && `${unsureNos.join('·')} 애매 정답`,
              ]
                .filter(Boolean)
                .join(', ')}{' '}
              → 내일 퀴즈에 다시 나와요
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
