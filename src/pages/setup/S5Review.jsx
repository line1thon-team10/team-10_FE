// S5 내용·분량 확인 — 신민종
// TODO(확인필요): 승인 후 시연일(11/9)로 넘어가는 방법(계정 전환)은 미정이에요. mock은 승인하면 11/9 시드 홈으로 가요.
import { ArrowRight, Layers, Shuffle } from 'lucide-react';
import { MotionConfig, motion } from 'motion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import AiBox from '@/components/common/AiBox.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import SubjectTag from '@/components/common/SubjectTag.jsx';
import SetupHead from '@/components/setup/SetupHead.jsx';
import { toDay } from '@/config/date.js';
import { useApprove, usePlanDraft } from '@/hooks/usePlan.js';

const minutesLabel = (m) =>
  m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : `${m}분`;
const BAR_MAX = 150; // 막대 높이 기준(분)
const SPLIT_SEC = 0.6; // 단원 막대가 블록으로 갈라지는 시간 (와이어 S5)

// 단원 막대 하나가 위에서부터 태스크 블록으로 갈라져요. 블록은 아직 예정(회색 점선)
function UnitSplit({ unit }) {
  const h = Math.max(10, Math.min(24, Math.round((unit.pages / unit.tasks) * 1.6)));
  const step = SPLIT_SEC / unit.tasks;
  return (
    <div className="flex w-[104px] flex-none flex-col gap-2">
      <div
        className="flex flex-col"
        role="img"
        aria-label={`${unit.no}단원 ${unit.pages}쪽을 태스크 ${unit.tasks}개로 나눔`}
      >
        {Array.from({ length: unit.tasks }, (_, i) => (
          <motion.span
            key={i}
            className="relative block rounded-[2px_4px_4px_2px] border border-dashed border-st-gray/70"
            style={{ height: h }}
            initial={{ marginTop: 0 }}
            animate={{ marginTop: i ? 3 : 0 }}
            transition={{ delay: i * step, duration: 0.15 }}
          >
            {/* 갈라지기 전의 단원 막대 */}
            <motion.span
              className="absolute -inset-px rounded-[inherit] bg-line-2"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: i * step, duration: 0.15 }}
            />
          </motion.span>
        ))}
      </div>
      <p className="text-[12px] leading-snug">
        {unit.no}. {unit.title}
      </p>
      <p className="num text-[11px] text-fg-2">
        {unit.pages}p · {unit.tasks}개
      </p>
    </div>
  );
}

function FirstWeek({ draft }) {
  const order = draft.allocation;
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-end justify-between gap-2"
        role="img"
        aria-label="첫 주 하루 공부 시간"
      >
        {draft.firstWeek.map((d) => {
          const total = order.reduce((n, s) => n + (d.minutes[s.subjectId] ?? 0), 0);
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="num text-[11px] text-fg-2">{total}분</span>
              <div
                className="flex w-7 flex-col-reverse overflow-hidden rounded-sm bg-white/[0.06]"
                style={{ height: 120 }}
              >
                {order.map((s) =>
                  d.minutes[s.subjectId] ? (
                    <i
                      key={s.subjectId}
                      style={{
                        height: (d.minutes[s.subjectId] / BAR_MAX) * 120,
                        background: s.color,
                      }}
                      title={`${s.name} ${d.minutes[s.subjectId]}분`}
                    />
                  ) : null,
                )}
              </div>
              <span className="text-xs text-fg-2">{toDay(d.date).format('dd')}</span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        {order.map((s) => (
          <SubjectTag key={s.subjectId} name={s.name} color={s.color} />
        ))}
      </div>
      <p className="text-xs text-fg-3">막대 높이 = 공부 시간(분) · 과목 색은 일정 칸에만 써요</p>
    </div>
  );
}

export default function S5Review() {
  const navigate = useNavigate();
  const { data: draft, isPending, isError, refetch } = usePlanDraft();
  const approve = useApprove();
  const [active, setActive] = useState(null);

  if (isPending) return <LoadingState title="계획을 만들고 있어요" />;
  if (isError) return <ErrorState title="계획을 만들지 못했어요" onRetry={refetch} />;

  const { summary } = draft;
  const subject = draft.allocation.find((a) => a.subjectId === active) ?? draft.allocation[0];

  const onApprove = () =>
    approve.mutate(undefined, {
      onSuccess: () => {
        toast('계획을 확정했어요');
        navigate(ROUTES.home);
      },
      onError: (e) => toast.error(`확정하지 못했어요. ${e.message}`),
    });

  return (
    <>
      <SetupHead
        title={`강의자료 ${summary.totalPages}페이지를 태스크 ${summary.taskCount}개로 나눴어요`}
        desc="단원 막대가 15~60분짜리 블록으로 쪼개져요. 승인하면 시험일까지의 계획이 확정돼요."
      >
        <Button onClick={() => navigate(ROUTES.s4)}>이전</Button>
        <Button onClick={() => navigate(ROUTES.s5_1)}>
          <Shuffle size={13} aria-hidden="true" />
          다시 나누기
        </Button>
        <Button variant="primary" disabled={approve.isPending} onClick={onApprove}>
          {approve.isPending ? '확정하는 중…' : '이대로 계획 확정'}
          <ArrowRight size={14} aria-hidden="true" />
        </Button>
      </SetupHead>

      <div className="flex flex-wrap gap-2" aria-label="과목">
        {draft.allocation.map((a) => (
          <button
            key={a.subjectId}
            type="button"
            aria-pressed={a.subjectId === subject.subjectId}
            onClick={() => setActive(a.subjectId)}
            className={`num rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold whitespace-nowrap transition-colors ${a.subjectId === subject.subjectId ? 'border-transparent bg-ink text-ink-fg' : 'border-line-2 text-fg-soft hover:border-fg-soft'}`}
          >
            {a.name} · {a.pages}p · {a.tasks}개
          </button>
        ))}
      </div>

      <AiBox label="AI 단원 → 태스크 블록">
        <MotionConfig reducedMotion="user">
          {/* key: 과목을 바꾸면 갈라지는 장면을 다시 보여줘요 */}
          <div key={subject.subjectId} className="flex items-start gap-4 overflow-x-auto pb-1">
            {subject.units.map((u) => (
              <UnitSplit key={u.no} unit={u} />
            ))}
          </div>
        </MotionConfig>
        <p className="text-[11.5px] text-fg-2">
          블록은 아직 예정(점선)이에요. 공부를 기록하면 같은 블록이 책 선반에 쌓여요. 시험 범위에서
          뺀 단원은 여기 없어요.
        </p>
      </AiBox>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-line bg-bg-2 px-4 py-3 text-[12.5px] text-fg-2">
        <span className="flex items-center gap-1.5">
          <Layers size={13} className="text-brand-deep" aria-hidden="true" />
          <b className="num font-semibold text-fg">총 {summary.totalPages}p</b>· 태스크{' '}
          {summary.taskCount}개
        </span>
        <span>하루 평균 {minutesLabel(summary.dailyAvgMinutes)}</span>
        <span>첫 시험까지 {summary.daysToFirstExam}일</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <Card className="flex min-w-0 flex-col gap-3">
          <h2 className="text-[15px]">
            첫 주 하루 분량 미리보기{' '}
            <span className="num font-sans text-[12.5px] text-fg-2">
              ({toDay(draft.firstWeek[0].date).format('M/D dd')} ~{' '}
              {toDay(draft.firstWeek.at(-1).date).format('M/D dd')})
            </span>
          </h2>
          <FirstWeek draft={draft} />
        </Card>
        <AiBox label="AI">
          <h2 className="text-[15px]">이렇게 나눈 이유</h2>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[13px]">
            {draft.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </AiBox>
      </div>
    </>
  );
}
