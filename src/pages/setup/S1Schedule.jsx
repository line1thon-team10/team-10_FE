// S1 일정·목표 대화 — 신민종
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import ChatPanel from '@/components/common/ChatPanel.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import SetupHead from '@/components/setup/SetupHead.jsx';
import { fmtMD } from '@/config/date.js';
import { GOAL_STATUS } from '@/config/labels.js';
import { scheduleLine } from '@/config/schedule.js';
import { useOnboarding, useSendMessage } from '@/hooks/useOnboarding.js';

const STATUS_TONE = {
  confirmed: 'border-brand-line bg-brand-tint text-brand-deep',
  asking: 'border-line-2 bg-white/[0.08] text-fg',
  pending: 'border-line text-fg-2',
};

// 과목 카드 4칸 (ON-02): 빈칸은 [목표 학점]처럼 표시
function Cell({ label, value, wide }) {
  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${wide ? 'col-span-2' : ''}`}>
      <span className="text-[11px] text-fg-2">{label}</span>
      {value ? (
        <span className="num text-[12.5px] text-fg-soft">{value}</span>
      ) : (
        <span className="text-[12.5px] text-fg-3">[{label}]</span>
      )}
    </div>
  );
}

function SubjectCard({ s }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-bg-2 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 flex-none rounded-full bg-brand" aria-hidden="true" />
          <b className="truncate text-[13px] font-semibold">{s.name}</b>
        </span>
        <span
          className={`rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold whitespace-nowrap ${STATUS_TONE[s.status]}`}
        >
          {GOAL_STATUS[s.status]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        <Cell label="시험 날짜" value={s.examDate && fmtMD(s.examDate)} />
        <Cell
          label="목표 학점"
          value={s.goal && `${s.goal}${s.target != null ? ` (${s.target}점)` : ''}`}
        />
        <Cell label="시험 총 목표" value={s.goalTotal} wide />
        <Cell label="기타 정보" value={s.goalEtc} wide />
      </div>
    </div>
  );
}

export default function S1Schedule() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useOnboarding();
  const send = useSendMessage();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const onSend = (text) => send.mutate(text, { onError: (e) => toast.error(e.message) });

  return (
    <>
      <SetupHead
        title="일정과 시험, 목표를 적어 주세요"
        desc="말로 편하게 적으면 AI가 과목·시험일·목표로 정리해요. 알바·수업·약속 같은 고정 일정도 함께 말해 주세요."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChatPanel
          title="일정·목표 정리 · AI와 대화"
          messages={data.messages}
          chips={data.chips}
          onSend={onSend}
          pending={send.isPending}
          inputId="s1-message"
          placeholder={
            data.subjects.length
              ? '답을 입력하거나 위 칩을 여러 개 골라 한 번에 보내요'
              : '예: 월수금 저녁 6시부터 10시까지 카페 알바, 기말은 자료구조 11월 12일…'
          }
        />
        <aside className="flex min-w-0 flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[15px]">정리된 내용</h2>
              {data.subjects.length > 0 && (
                <span className="badge">{data.subjects.length}과목</span>
              )}
            </div>
            {data.subjects.length === 0 ? (
              <p className="text-sm text-fg-3">말한 내용이 여기에 과목 카드로 정리돼요.</p>
            ) : (
              data.subjects.map((s) => <SubjectCard key={s.id} s={s} />)
            )}
            <p className="text-[11px] text-fg-2">
              받는 정보: 교수님 강조 범위 · 합격 기준 · 등급·학점 기준 · 시험 반영 비율
            </p>
          </Card>
          <Card className="flex flex-col gap-2">
            <h2 className="text-[15px]">반복 일정</h2>
            {data.schedules.length === 0 ? (
              <p className="text-sm text-fg-3">아직 없어요.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {data.schedules.map((e) => (
                  <li key={e.id} className="num flex items-start gap-2 text-[12.5px] text-fg-soft">
                    <span
                      className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-brand"
                      aria-hidden="true"
                    />
                    {scheduleLine(e)}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
      <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-[12px] ${data.done ? 'text-fg-2' : 'text-brand-deep'}`}>
          {data.done
            ? '정리된 내용은 다음 단계에서도 고칠 수 있어요. 공부 계획은 빈 시간에만 넣어요.'
            : '모든 과목의 목표가 정해져야 다음 단계로 갈 수 있어요.'}
        </p>
        <Button variant="primary" disabled={!data.done} onClick={() => navigate(ROUTES.s2)}>
          다음: 캘린더 확인
          <ArrowRight size={14} aria-hidden="true" />
        </Button>
      </div>
    </>
  );
}
