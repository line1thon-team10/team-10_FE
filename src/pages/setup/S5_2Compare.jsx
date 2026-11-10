// S5-2 다시 나누기 비교 — 신민종
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import AiBox from '@/components/common/AiBox.jsx';
import { SavedTag } from '@/components/common/AiProgress.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import { EmptyState, LoadingState } from '@/components/common/StateView.jsx';
import SetupHead from '@/components/setup/SetupHead.jsx';
import { fmtMD, minutesLabel, toDay } from '@/config/date.js';
import { useApplyResplit, useCancelResplit, useResplit } from '@/hooks/usePlan.js';

const BAR_MAX = 180; // 막대 높이 기준(분)
const statLabel = (unit, v) => (unit === 'day' ? `${v}일` : minutesLabel(v));

// 2주(14칸) 날짜별 공부 시간. 바뀐 날은 굵은 테두리 + '바뀜' 글자 (흑백에서도 구분, G-1)
function TwoWeeks({ title, days, field, ai }) {
  const Box = ai ? AiBox : Card;
  return (
    <Box {...(ai ? { label: 'AI 새 안' } : {})} className="flex min-w-0 flex-col gap-3">
      <h2 className="text-[14px] font-semibold">
        {title} · {fmtMD(days[0].date)} ~ {fmtMD(days.at(-1).date)}
      </h2>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <div
            key={d.date}
            className={`flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 ${d.changed ? 'border-2 border-fg' : 'border border-line'}`}
          >
            <span className="num text-[10.5px] text-fg-2">{toDay(d.date).format('M/D dd')}</span>
            <span className="flex h-10 items-end">
              <i
                className="block w-3 rounded-sm bg-fg-soft"
                style={{ height: Math.max(2, (d[field] / BAR_MAX) * 40) }}
              />
            </span>
            <span className="num text-[11px]">{d[field] ? minutesLabel(d[field]) : '0분'}</span>
            <span className={`text-[10px] font-semibold ${d.changed ? '' : 'invisible'}`}>
              바뀜
            </span>
          </div>
        ))}
      </div>
    </Box>
  );
}

export default function S5_2Compare() {
  const navigate = useNavigate();
  const { data, isPending, isError } = useResplit();
  const apply = useApplyResplit();
  const cancel = useCancelResplit();
  const busy = apply.isPending || cancel.isPending;

  if (isPending) return <LoadingState title="비교할 안을 불러오고 있어요" />;
  if (isError)
    return (
      <EmptyState
        title="비교할 새 안이 없어요"
        description="다시 나누기를 요청하면 기존 안과 나란히 보여드려요."
        action={
          <Link className="btn btn-sm" to={ROUTES.s5_1}>
            다시 나누기 요청
          </Link>
        }
      />
    );

  const decide = (m, msg) =>
    m.mutate(undefined, {
      onSuccess: () => {
        toast(msg);
        navigate(ROUTES.s5);
      },
      onError: (e) => toast.error(e.message),
    });

  return (
    <>
      <SetupHead title="기존 안과 새 안을 비교해 보세요">
        <Button onClick={() => navigate(ROUTES.s5_1)} disabled={busy}>
          요청 바꿔서 다시
        </Button>
        <Button onClick={() => decide(cancel, '이전 안으로 되돌렸어요')} disabled={busy}>
          이전 안으로 되돌리기
        </Button>
        <Button
          variant="primary"
          onClick={() => decide(apply, '새 안으로 바꿨어요 · 확정은 이 화면에서 해요')}
          disabled={busy}
        >
          이 안으로 승인
          <ArrowRight size={14} aria-hidden="true" />
        </Button>
      </SetupHead>

      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="badge">요청: {data.request}</span>
        <span className="badge">유지: {data.keep}</span>
        {data.saved && <SavedTag />}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((s) => (
          <Card key={s.label} className="flex flex-col gap-1.5 px-4 py-3.5">
            <p className="text-[11.5px] text-fg-2">{s.label}</p>
            <p className="num flex items-baseline gap-2">
              <span className="text-[13px] text-fg-2">{statLabel(s.unit, s.before)}</span>
              <ArrowRight size={12} className="text-fg-3" aria-label="에서" />
              <b className="text-[16px] font-semibold">{statLabel(s.unit, s.after)}</b>
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TwoWeeks title="기존 안" days={data.days} field="before" />
        <TwoWeeks title="새 안" days={data.days} field="after" ai />
      </div>
      <p className="text-[11px] text-fg-3">굵은 테두리 = 바뀐 날 · 막대 높이 = 공부 시간</p>

      <AiBox label="AI">
        <h2 className="text-[14px] font-semibold">이렇게 바꿨어요</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[13px]">
          {data.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </AiBox>
    </>
  );
}
