// S1 일정·목표 대화 — 신민종
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import ChatPanel from '@/components/common/ChatPanel.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { fmtMD } from '@/config/date.js';
import { scheduleLine } from '@/config/schedule.js';
import { useOnboarding, useSendMessage } from '@/hooks/useOnboarding.js';

const STATUS = { pending: '입력 전', asking: '추가 질문 중', confirmed: '확정' };

export default function S1Schedule() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useOnboarding();
  const send = useSendMessage();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const onSend = (text) => send.mutate(text, { onError: (e) => toast.error(e.message) });

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">일정과 시험, 목표를 편하게 말해 주세요</h1>
        <p className="text-fg-2">알바·수업·약속처럼 복잡한 일정도 그대로 말하면 AI가 정리해요.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <ChatPanel
          title="AI와 대화로 설정"
          messages={data.messages}
          chips={data.chips}
          onSend={onSend}
          pending={send.isPending}
          inputId="s1-message"
          placeholder={
            data.subjects.length
              ? '답을 입력하거나 위 칩을 골라 보내요'
              : '예: 월수금 저녁 6시부터 10시까지 카페 알바, 기말은 자료구조 11월 12일…'
          }
        />
        <aside className="flex min-w-0 flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h2 className="font-semibold">정리된 내용</h2>
            {data.subjects.length === 0 ? (
              <p className="text-sm text-fg-3">말한 내용이 여기에 과목·시험일·목표로 정리돼요.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] [&_td]:border-b [&_td]:border-line [&_td]:py-2 [&_td]:pr-2 [&_th]:pb-1 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-fg-2">
                  <thead>
                    <tr>
                      <th>과목</th>
                      <th>시험일</th>
                      <th>목표</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.subjects.map((s) => (
                      <tr key={s.id}>
                        <td className="font-medium">{s.name}</td>
                        <td className="num">{fmtMD(s.examDate)}</td>
                        <td title={s.goalDetail ?? undefined}>
                          {s.goal ?? <span className="text-fg-3">-</span>}
                          {s.target != null && (
                            <span className="num text-fg-2"> ({s.target}점)</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={s.status === 'confirmed' ? 'badge badge-strong' : 'badge'}
                          >
                            {STATUS[s.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-fg-3">
              받는 정보: 교수님 강조 범위 · 합격 기준 · 등급·학점 기준 · 시험 반영 비율
            </p>
          </Card>
          <Card className="flex flex-col gap-2">
            <h2 className="font-semibold">반복 일정</h2>
            {data.schedules.length === 0 ? (
              <p className="text-sm text-fg-3">아직 없어요.</p>
            ) : (
              <ul className="flex list-disc flex-col gap-1 pl-5 text-[13.5px]">
                {data.schedules.map((e) => (
                  <li key={e.id} className="num">
                    {scheduleLine(e)}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <p className="text-xs text-fg-2">
            모든 과목의 목표가 구체적으로 정해져야 다음 단계로 갈 수 있어요.
          </p>
          <Button variant="primary" disabled={!data.done} onClick={() => navigate(ROUTES.s2)}>
            {data.done ? '다음: 캘린더 확인' : '(목표 확정 후) 다음: 캘린더 확인'}
          </Button>
        </aside>
      </div>
    </>
  );
}
