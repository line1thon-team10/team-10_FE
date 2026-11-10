// S15-1 월간 리포트 (MO-03, Could · 디자인 home MonthReport) — 신민종
// 숫자만 보여주고 문장으로 평가하지 않아요. 집계는 서버. 측정 합계는 시드 측정 시간을 받기 전 MOCK
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { fmtMD } from '@/config/date.js';
import { GRADE } from '@/config/labels.js';
import { useMonthly, useMonthlyReport } from '@/hooks/useSchedule.js';

const hm = (m) => (m < 60 ? `${m}분` : `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}`);

function Stat({ label, value, sub, mock }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[12px] text-fg-2">
        {label}
        {mock && <MockBadge />}
      </span>
      <b className="display num text-[26px] leading-tight">{value}</b>
      {sub && <span className="num text-[11.5px] text-fg-2">{sub}</span>}
    </Card>
  );
}

export default function MonthReport({ month, onBack }) {
  const { data: r, isPending, isError, refetch } = useMonthlyReport(month, true);
  const { data: m } = useMonthly(month);
  if (isPending) return <LoadingState title="월간 리포트를 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;
  const sub = (id) => m?.subjects.find((x) => x.id === id);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12.5px] text-fg-2">
          {Number(month.slice(5))}월 리포트 · {fmtMD(r.from)} 계획 시작 ~ {fmtMD(r.until)} 오늘 기준
          · 숫자만 보여주고 문장으로 평가하지 않아요
        </p>
        <Button size="sm" onClick={onBack}>
          ← 책장으로
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="공부한 날"
          value={`${r.studyDays}일`}
          sub={`계획 있던 날 ${r.plannedDays}일 중`}
        />
        <Stat
          label="계획 달성"
          value={`${r.achievement.rate}%`}
          sub={`${r.achievement.done}p / ${r.achievement.plan}p · 보충 포함`}
        />
        <Stat
          label="공부 시간"
          value={hm(r.time.measuredMinutes)}
          sub={`집중 모드로 잰 시간만 · 계획 ${hm(r.time.plannedMinutes)}`}
          mock={r.mockFilled.includes('measuredMinutes')}
        />
        <Stat
          label="퀴즈"
          value={`${r.quiz.total}문항`}
          sub={`오답 ${r.quiz.wrong} · 애매 정답 ${r.quiz.unsureRight}`}
          mock={r.mockFilled.includes('quiz')}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="flex flex-col gap-2.5">
          <h2 className="text-[16px]">과목 비율 · 새로 끝낸 범위</h2>
          <div className="flex h-2.5 overflow-hidden rounded-full" aria-hidden="true">
            {r.subjects.map((x) => (
              <span
                key={x.subjectId}
                style={{ width: `${x.share}%`, background: sub(x.subjectId)?.color }}
              />
            ))}
          </div>
          {r.subjects.map((x) => (
            <p
              key={x.subjectId}
              className="num flex items-center justify-between gap-2 text-[12.5px]"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-3 w-1 rounded-full"
                  style={{ background: sub(x.subjectId)?.color }}
                  aria-hidden="true"
                />
                {sub(x.subjectId)?.name}
              </span>
              <span>
                {x.pages}p · {x.share}%
              </span>
            </p>
          ))}
        </Card>
        <Card className="flex flex-col gap-2">
          <h2 className="text-[16px]">단원 등급 변화</h2>
          {r.grades.map((g) => (
            <p
              key={`${g.subjectId}-${g.unitNo}`}
              className="num flex items-center justify-between gap-2 text-[12.5px]"
            >
              <span>
                {sub(g.subjectId)?.name} {g.unitNo}단원 {g.title}
              </span>
              <span>
                <span className="text-fg-2">
                  {g.before ? GRADE[g.before.grade].label : '퀴즈 전'}
                </span>{' '}
                →{' '}
                <b className="font-semibold">
                  {GRADE[g.after.grade].label} · {g.after.score}점
                </b>
              </span>
            </p>
          ))}
        </Card>
      </div>
    </div>
  );
}
