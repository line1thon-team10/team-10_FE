// S8-2 퀴즈 결과 — 신민종
import { FileText } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import BookBlock from '@/components/book/BookBlock.jsx';
import AiBox from '@/components/common/AiBox.jsx';
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import PdfPageDialog from '@/components/common/PdfPageDialog.jsx';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { POLICY } from '@/config/app.js';
import { CONFIDENCE, GRADE, QUIZ_TYPE } from '@/config/labels.js';
import { useMoreQuiz, useQuizResult } from '@/hooks/useQuiz.js';

const gradeOf = (score) =>
  score == null
    ? null
    : score >= POLICY.gradeStable
      ? 'stable'
      : score >= POLICY.gradeShaky
        ? 'shaky'
        : 'risk';

// 근거 페이지 칩 → 원본 PDF 그 쪽 + 문장 하이라이트 (QZ-13)
function PageChip({ item, onOpen }) {
  return (
    <button
      type="button"
      className="badge self-start hover:border-fg-2 hover:text-fg"
      disabled={!item.evidence}
      title={item.evidence ? undefined : '이 문항은 근거 원본이 아직 없어요'}
      onClick={() => onOpen(item.evidence)}
    >
      <FileText size={11} aria-hidden="true" />
      근거 {item.page}
    </button>
  );
}

function ItemCard({ item, saved, onOpen }) {
  const wrongSure = !item.correct && item.confidence === 'sure';
  return (
    <article className={`card flex flex-col gap-2.5 ${item.correct ? '' : 'border-st-risk/40'}`}>
      <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
        <b className="num">Q{item.no}</b>
        <span className="text-fg-2">
          {QUIZ_TYPE[item.type]}
          {item.tag && ` · ${item.tag}`}
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          {item.score != null && <span className="num font-semibold">{item.score}점</span>}
          <span
            className={
              item.correct
                ? 'badge border-st-stable/50 text-st-stable'
                : 'badge border-st-risk/60 text-st-risk'
            }
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
        <AiBox label={saved ? 'AI 채점 · 저장된 채점' : 'AI 채점'}>
          <p className="text-[13px]">
            {POLICY.essayPassScore}점부터 정답이에요. {item.feedback.good} {item.feedback.miss}
          </p>
        </AiBox>
      )}
      {item.type !== 'essay' && item.explanation && (
        <AiBox label="AI 해설">
          <p className="text-[13px]">
            {item.explanation}
            {wrongSure && ' 확실하다고 했는데 틀린 문제라 해설을 먼저 보여줘요.'}
            {item.mockFilled.includes('explanation') && (
              <span className="ml-1.5 align-middle">
                <MockBadge />
              </span>
            )}
          </p>
        </AiBox>
      )}
      <PageChip item={item} onOpen={onOpen} />
    </article>
  );
}

// 더 풀기 결과 (QZ-11): 원래 결과 아래에 이어 붙이고, 이해도 변화를 책으로 보여줘요 (G-1: 책 위 글자)
function MoreResult({ m, onOpen }) {
  const c = m.moreUnitChange;
  return (
    <section className="flex flex-col gap-2.5" aria-label={`${m.unitNo}단원 더 풀기 결과`}>
      <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-line">
        <div>
          <p className="label text-brand-deep">더 풀기</p>
          <h2 className="mt-1 text-[18px]">
            {m.unitNo}단원 {m.summary.total}문항 · {m.summary.correct}/{m.summary.total}
          </h2>
          <p className="num mt-1 text-[12px] text-fg-2">
            확실 정답 {m.summary.sureCorrect} · 애매 정답 {m.summary.unsureCorrect} · 오답{' '}
            {m.summary.wrong}
          </p>
        </div>
        {c && (
          <div className="flex flex-col items-end gap-1.5">
            <span className="num text-[13px]">
              {c.unitNo}단원 이해도 {c.before.score} → <b>{c.after.score}</b>
            </span>
            <div className="grid w-[220px] grid-cols-[1fr_auto_1fr] items-center gap-2">
              <BookBlock state={c.before.grade} />
              <span aria-hidden="true">→</span>
              <BookBlock state={c.after.grade} />
            </div>
          </div>
        )}
      </Card>
      {m.items.map((it) => (
        <ItemCard key={it.questionId} item={it} onOpen={onOpen} />
      ))}
    </section>
  );
}

export default function S8_2Result() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const subjectId = params.get('subject') ?? 'ai';
  const { data: r, isPending, isError, error, refetch } = useQuizResult(subjectId);
  const more = useMoreQuiz();
  const [pdf, setPdf] = useState(null); // { materialId, page, quote }

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
  // 더 풀기 (QZ-11): 오늘 새로 나온 단원 5문항 (단원마다 하루 한 번)
  const newUnit = r.items.find((it) => !it.tag)?.unitNo;
  const moreDone = r.more.some((m) => m.unitNo === newUnit);
  const startMore = () =>
    more.mutate(
      { subjectId, unitNo: newUnit },
      {
        onSuccess: ({ quizId }) => navigate(`${ROUTES.quiz}?subject=${quizId}`),
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="label text-brand-deep">오늘의 퀴즈 결과</p>
          <h1 className="text-[28px]">
            {r.name} 퀴즈 결과 · {summary.correct}/{summary.total}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span className="badge border-st-stable/50 text-st-stable">
              확실 정답 {summary.sureCorrect}
            </span>
            <span className="badge border-brand-line text-brand-deep">
              애매 정답 {summary.unsureCorrect}
            </span>
            <span className="badge border-st-risk/60 text-st-risk">오답 {summary.wrong}</span>
          </div>
          <p className="text-[12.5px] text-fg-2">정답·해설은 여기서 한 번에 봐요</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {newUnit && !moreDone && (
            <Button disabled={more.isPending} onClick={startMore}>
              {more.isPending ? '문항을 고르는 중…' : `더 풀기 (${newUnit}단원 5문항)`}
            </Button>
          )}
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
            <ItemCard
              key={it.questionId}
              item={it}
              saved={r.essayGrading === 'saved'}
              onOpen={setPdf}
            />
          ))}
          {r.more.map((m) => (
            <MoreResult key={m.subjectId} m={m} onOpen={setPdf} />
          ))}
        </section>
        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h2 className="text-[16px]">단원 이해도 변화</h2>
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
            <h2 className="text-[16px]">오답 노트에 {r.wrongAdded.length}문제</h2>
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
      {pdf && (
        <PdfPageDialog
          materialId={pdf.materialId}
          page={pdf.page}
          quote={pdf.quote}
          onClose={() => setPdf(null)}
        />
      )}
    </>
  );
}
