// S5 내용·분량 확인 — 신민종
// TODO(확인필요): [기획 확인] '분량 조정 − +'의 단위(페이지·태스크·하루 시간)와 동작이 문서에 없어서 버튼만 두고 막아 뒀어요.
// TODO(확인필요): 승인 후 시연일(11/9)로 넘어가는 방법(계정 전환)은 미정이에요. mock은 승인하면 11/9 시드 홈으로 가요.
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import AiBox from '@/components/common/AiBox.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import SubjectTag from '@/components/common/SubjectTag.jsx';
import { toDay } from '@/config/date.js';
import { useApprove, usePlanDraft } from '@/hooks/usePlan.js';

const minutesLabel = (m) =>
  m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : `${m}분`;
const BAR_MAX = 150; // 막대 높이 기준(분)

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
                className="flex w-7 flex-col-reverse overflow-hidden rounded-sm bg-surface-2"
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

  if (isPending) return <LoadingState title="계획을 만들고 있어요" />;
  if (isError) return <ErrorState title="계획을 만들지 못했어요" onRetry={refetch} />;

  const { summary } = draft;
  const kpis = [
    ['총 분량 (업로드 자료 기준)', `${summary.totalPages}p`],
    ['태스크 (15–60분)', `${summary.taskCount}개`],
    ['하루 평균 공부', minutesLabel(summary.dailyAvgMinutes)],
    ['첫 시험까지', `${summary.daysToFirstExam}일`],
  ];
  const first = draft.firstWeek[0]?.date;
  const last = draft.firstWeek.at(-1)?.date;

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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">분량과 배분을 확인하고 승인해 주세요</h1>
        <p className="text-fg-2">승인하면 시험일까지의 계획이 확정돼요.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(([k, v]) => (
          <Card key={k} className="flex flex-col gap-1">
            <span className="text-xs text-fg-2">{k}</span>
            <b className="num text-2xl">{v}</b>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">과목별 배분</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] [&_td]:border-b [&_td]:border-line [&_td]:px-2 [&_td]:py-2 [&_th]:px-2 [&_th]:pb-1 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-fg-2">
                <thead>
                  <tr>
                    <th>과목</th>
                    <th>목표</th>
                    <th>총 페이지</th>
                    <th>태스크</th>
                    <th>분량 조정</th>
                  </tr>
                </thead>
                <tbody>
                  {draft.allocation.map((s) => (
                    <tr key={s.subjectId}>
                      <td>
                        <SubjectTag name={s.name} color={s.color} />
                      </td>
                      <td>{s.goalLabel}</td>
                      <td className="num">{s.pages}p</td>
                      <td className="num">{s.tasks}개</td>
                      <td className="whitespace-nowrap">
                        <Button
                          size="sm"
                          disabled
                          title="조정 방식 확인 중이에요"
                          aria-label={`${s.name} 분량 줄이기`}
                        >
                          −
                        </Button>{' '}
                        <Button
                          size="sm"
                          disabled
                          title="조정 방식 확인 중이에요"
                          aria-label={`${s.name} 분량 늘리기`}
                        >
                          +
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold">
              첫 주 하루 분량 미리보기{' '}
              <span className="num text-sm font-normal text-fg-2">
                ({first && toDay(first).format('M/D dd')} ~ {last && toDay(last).format('M/D dd')})
              </span>
            </h2>
            <FirstWeek draft={draft} />
          </div>
        </Card>
        <aside className="flex flex-col gap-3">
          <AiBox label="AI">
            <h2 className="text-sm font-semibold">이렇게 나눈 이유</h2>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[13px]">
              {draft.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </AiBox>
          <Button onClick={() => navigate(ROUTES.s5_1)}>다시 나누기</Button>
          <Button variant="primary" disabled={approve.isPending} onClick={onApprove}>
            {approve.isPending ? '확정하는 중…' : '승인하고 계획 확정'}
          </Button>
        </aside>
      </div>
      <div>
        <Button onClick={() => navigate(ROUTES.s4)}>이전</Button>
      </div>
    </>
  );
}
