// S15 월간 보기 (MO-01·02 · 디자인 home MonthShelf) — 신민종
// 하루 = 세워 꽂힌 책 1권. 그날 계획한 페이지를 얼마나 했는지만큼 책이 차요 (100% 상한, 보충 포함).
// 아래는 과목 비율 막대(과목 색). 오늘 칸 테두리, 오늘 이후는 점선 칸, 계획 없던 날은 빈 칸. 집계는 서버
import { MockBadge } from '@/components/common/Badge.jsx';
import Card from '@/components/common/Card.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { DAY_NAMES } from '@/config/schedule.js';
import { useMonthly } from '@/hooks/useSchedule.js';

function Day({ d, colorOf }) {
  const total = d.bySubject.reduce((n, x) => n + x.pages, 0);
  const border = d.today
    ? 'border-2 border-brand'
    : d.future && d.planned
      ? 'border border-dashed border-line-2'
      : 'border border-line';
  return (
    <div
      className={`flex min-h-[132px] min-w-0 flex-col gap-1.5 rounded-xl p-2 ${border} ${d.inMonth ? '' : 'opacity-35'}`}
      title={d.planned ? `${d.date} · ${d.done}/${d.plan}p` : `${d.date} · 계획 없음`}
    >
      <div className="flex items-baseline justify-between gap-1">
        <span className={`num text-[12px] ${d.today ? 'font-bold text-brand-deep' : 'text-fg-2'}`}>
          {Number(d.date.slice(8))}
        </span>
        {d.rate != null && <b className="num text-[11.5px]">{d.rate}%</b>}
      </div>
      {d.planned ? (
        <>
          {/* 세워 꽂힌 책: 차오른 만큼 채움 */}
          <div
            className="relative mx-auto h-16 w-7 overflow-hidden rounded-[3px] border border-line-2 bg-white/[0.03]"
            role="img"
            aria-label={d.rate != null ? `${d.rate}% 했어요` : '아직 오지 않은 날'}
          >
            {d.rate != null && (
              <span
                className="absolute inset-x-0 bottom-0 bg-fg-soft"
                style={{ height: `${d.rate}%` }}
              />
            )}
          </div>
          {total > 0 && (
            <div className="flex h-1.5 overflow-hidden rounded-full" aria-label="과목 비율">
              {d.bySubject.map((x) => (
                <span
                  key={x.subjectId}
                  style={{ width: `${(x.pages / total) * 100}%`, background: colorOf(x.subjectId) }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <span className="flex-1" />
      )}
      {d.labels.map((l) => (
        <span key={l} className="truncate text-[10.5px] text-fg-2">
          {l.endsWith('시험') ? l : `+${l}`}
        </span>
      ))}
      {d.estimated && <span className="text-[10px] text-brand-deep">추정 포함</span>}
    </div>
  );
}

export default function MonthShelf({ month }) {
  const { data, isPending, isError, refetch } = useMonthly(month);
  if (isPending) return <LoadingState title="월간 책장을 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;
  const colorOf = (id) => data.subjects.find((x) => x.id === id)?.color;
  return (
    <Card className="flex flex-col gap-3">
      <p className="text-[12.5px] text-fg-2">
        하루 = 세워 꽂힌 책 1권. 그날 계획한 페이지를 얼마나 했는지만큼 책이 차요.
      </p>
      {data.note && (
        <p className="flex items-center gap-2 text-[12px] text-brand-deep">
          {data.note} <MockBadge />
        </p>
      )}
      <div className="grid grid-cols-7 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <span key={d} className="text-center text-[11.5px] text-fg-2">
            {DAY_NAMES[d]}
          </span>
        ))}
        {data.days.map((d) => (
          <Day key={d.date} d={d} colorOf={colorOf} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[11.5px] text-fg-2">
        {data.subjects.map((x) => (
          <span key={x.id} className="flex items-center gap-1.5">
            <span
              className="h-2 w-3 rounded-sm"
              style={{ background: x.color }}
              aria-hidden="true"
            />
            {x.name}
          </span>
        ))}
        <span>· 테두리 = 오늘 · 점선 = 아직 오지 않은 날 · 빈 칸 = 계획 없던 날</span>
      </div>
    </Card>
  );
}
