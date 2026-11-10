// S11 캘린더 (주간) — 신민종
// 고정 일정(회색) + 공부 블록(과목 색 띠) + 시험일, 블록을 누르면 범위·배치 이유 (ON-04 · 디자인 calendar WeekGrid)
// 반복 일정은 이번만 / 앞으로 모두 삭제 (ON-07) → 빈 시간 안 P5 (ON-08). 아래에서 말로 일정 추가 → S6-4 (ON-06)
// [월]은 지시문 13(S15 월간 보기) 전까지 숨겨요. 블록 시각은 목업 규칙이에요 (MOCK)
import koLocale from '@fullcalendar/core/locales/ko';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Mic } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import CalEvent from '@/components/common/CalEvent.jsx';
import Card from '@/components/common/Card.jsx';
import Modal from '@/components/common/Modal.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import EmptyTimeDialog from '@/components/plan/EmptyTimeDialog.jsx';
import { toDay } from '@/config/date.js';
import { useDemoState } from '@/hooks/useDemo.js';
import { useDeleteSchedule, useVoicePreview, useWeekCalendar } from '@/hooks/useSchedule.js';
import S6_4Reschedule from '@/pages/home/modals/S6_4Reschedule.jsx';

const weekStartOf = (d) => toDay(d).subtract((toDay(d).day() + 6) % 7, 'day'); // 월요일
const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : `${m}분`);
const range = (b) => (b.from ? `p.${b.from}–${b.to}` : '범위 없음');
const LEGEND = [
  ['ev-class', '수업'],
  ['ev-job', '알바'],
  ['ev-meet', '약속'],
  ['ev-added', '말로 추가한 일정'],
];

// 반복 일정 삭제 범위 (디자인 DeleteScopeDialog)
function DeleteScopeDialog({ event, busy, onPick, onClose }) {
  return (
    <Modal
      title={`${event.title} 일정을 지울까요?`}
      onClose={onClose}
      footer={<Button onClick={onClose}>취소</Button>}
    >
      <p className="num -mt-2 text-[12.5px] text-fg-2">
        {toDay(event.date).format('M/D (dd)')} {event.start}–{event.end} · 일정을 지워도 공부 블록은
        그대로예요
      </p>
      <div className="flex flex-col gap-2">
        <Button disabled={busy} onClick={() => onPick('once')}>
          이번만 삭제 ({toDay(event.date).format('M/D')})
        </Button>
        {event.repeat && (
          <Button disabled={busy} onClick={() => onPick('future')}>
            앞으로 모두 삭제 ({toDay(event.date).format('M/D')}부터)
          </Button>
        )}
      </div>
    </Modal>
  );
}

function VoiceAdd({ onPreview }) {
  const [text, setText] = useState('');
  const preview = useVoicePreview();
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    preview.mutate(text.trim(), {
      onSuccess: (p) => {
        onPreview(p);
        setText('');
      },
      onError: (err) => toast.error(err.message),
    });
  };
  return (
    <form className="flex flex-col gap-2" onSubmit={submit}>
      <label htmlFor="cal-voice" className="flex items-center gap-2 text-[13px] font-semibold">
        <span className="ai-chip">AI</span>말로 일정 추가
      </label>
      <div className="flex gap-2">
        <input
          id="cal-voice"
          className="min-w-0 flex-1 rounded-full border border-line-2 bg-bg px-4 py-2"
          placeholder="예: 목요일 저녁에 조모임 생겼어"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
        />
        <Button type="submit" disabled={!text.trim() || preview.isPending}>
          <Mic size={13} aria-hidden="true" />
          {preview.isPending ? '정리하는 중…' : '추가'}
        </Button>
      </div>
    </form>
  );
}

function Week({ from }) {
  const to = toDay(from).add(6, 'day').format('YYYY-MM-DD');
  const { data, isPending, isError, refetch } = useWeekCalendar(from, to);
  const del = useDeleteSchedule();
  const [picked, setPicked] = useState(null); // 고른 공부 블록 id
  const [deleting, setDeleting] = useState(null); // 지울 고정 일정
  const [empty, setEmpty] = useState(null); // P5 빈 시간 안
  const [voice, setVoice] = useState(null); // S6-4 미리보기

  if (isPending) return <LoadingState title="캘린더를 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const block = data.study.find((b) => b.id === picked);
  const examOn = (date) => data.exams.filter((x) => x.date === date);
  const events = [
    ...data.fixed.map((f) => ({
      id: f.id,
      title: f.title,
      start: `${f.date}T${f.start}`,
      end: `${f.date}T${f.end}`,
      classNames: [f.added ? 'ev-added' : `ev-${f.kind}`],
      extendedProps: { type: 'fixed' },
    })),
    ...data.study.map((b) => ({
      id: b.id,
      title: `${b.subjectName} · ${b.title}`,
      start: `${b.date}T${b.start}`,
      end: `${b.date}T${b.end}`,
      backgroundColor: 'var(--color-surface-2)',
      borderColor: b.color,
      textColor: 'var(--color-fg)',
      classNames: ['ev-study', picked === b.id ? 'is-picked' : ''],
      extendedProps: { type: 'study' },
    })),
  ];
  const onDelete = (scope) =>
    del.mutate(
      { id: deleting.id, scope },
      {
        onSuccess: (r) => {
          setDeleting(null);
          setEmpty(r);
        },
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Card className="cal-wrap flex min-w-0 flex-col gap-3">
        <FullCalendar
          key={from}
          plugins={[timeGridPlugin]}
          initialView="timeGridWeek"
          initialDate={from}
          now={data.today} // '오늘'은 데모 날짜 (브라우저 시계 X)
          locale={koLocale}
          firstDay={1}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="24:00:00"
          height="auto"
          nowIndicator={false}
          headerToolbar={false}
          events={events}
          dayHeaderContent={(arg) => {
            const date = toDay(arg.date).format('YYYY-MM-DD');
            return (
              <div className="flex flex-col items-center gap-0.5 py-1">
                <span className="text-[12px]">{toDay(arg.date).format('M/D (dd)')}</span>
                {examOn(date).map((x) => (
                  <span
                    key={x.subjectId}
                    className="rounded px-1 text-[10px] font-bold text-ink-fg"
                    style={{ background: x.color }}
                  >
                    {x.name} 시험
                  </span>
                ))}
              </div>
            );
          }}
          eventContent={(arg) => <CalEvent event={arg.event} />}
          eventMinHeight={18}
          slotEventOverlap={false} // 실제로 시간이 겹치는 일정만 나란히
          eventClick={(info) => {
            const type = info.event.extendedProps.type;
            if (type === 'study') setPicked(info.event.id);
            else setDeleting(data.fixed.find((f) => f.id === info.event.id));
          }}
        />
        <VoiceAdd onPreview={setVoice} />
      </Card>
      <aside className="flex flex-col gap-4">
        <Card className="flex flex-col gap-2" aria-live="polite">
          <h2 className="text-[16px]">블록 자세히</h2>
          {block ? (
            <>
              <p className="flex items-center gap-2 text-[13px] font-semibold">
                <span
                  className="h-3 w-1 rounded-full"
                  style={{ background: block.color }}
                  aria-hidden="true"
                />
                {block.subjectName} · {block.title}
              </p>
              <p className="num text-[12.5px] text-fg-soft">
                {toDay(block.date).format('M/D (dd)')} {block.start}–{block.end} · {range(block)} ·{' '}
                {block.minutes}분
              </p>
              {block.reason && (
                <p className="flex items-start gap-1.5 text-[12px] text-fg-2">
                  <span className="ai-chip">AI</span>
                  {block.reason}
                </p>
              )}
            </>
          ) : (
            <p className="text-[12.5px] text-fg-3">
              공부 블록을 누르면 범위와 배치 이유를 보여줘요.
            </p>
          )}
        </Card>
        <Card className="flex flex-col gap-2">
          <h2 className="text-[16px]">이번 주 공부</h2>
          {data.summary
            .filter((x) => x.count)
            .map((x) => (
              <p
                key={x.subjectId}
                className="flex items-center justify-between gap-2 text-[12.5px]"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-3 w-1 rounded-full"
                    style={{ background: x.color }}
                    aria-hidden="true"
                  />
                  {x.name}
                </span>
                <span className="num text-fg-2">
                  {hm(x.minutes)} · {x.count}개
                </span>
              </p>
            ))}
        </Card>
        <Card className="flex flex-col gap-2">
          <h2 className="text-[16px]">범례</h2>
          {LEGEND.map(([cls, label]) => (
            <span key={cls} className="flex items-center gap-2 text-[12.5px]">
              <span className={`legend-swatch ${cls}`} aria-hidden="true" />
              {label}
            </span>
          ))}
          <span className="flex items-center gap-2 text-[12.5px]">
            <span className="legend-swatch ev-study-swatch" aria-hidden="true" />
            공부 블록 (왼쪽 띠 = 과목 색)
          </span>
          <p className="text-[11.5px] text-fg-2">
            일정을 누르면 지울 수 있어요. 공부 블록은 지우지 않아요.
          </p>
        </Card>
      </aside>
      {deleting && (
        <DeleteScopeDialog
          event={deleting}
          busy={del.isPending}
          onPick={onDelete}
          onClose={() => setDeleting(null)}
        />
      )}
      {empty && <EmptyTimeDialog data={empty} onClose={() => setEmpty(null)} />}
      {voice && (
        <S6_4Reschedule
          preview={voice}
          onClose={() => setVoice(null)}
          onPickOnCalendar={() => toast('캘린더에서 비어 있는 칸을 확인해 주세요')}
        />
      )}
    </div>
  );
}

export default function CalendarTab() {
  const { data: demo } = useDemoState();
  const [offset, setOffset] = useState(0); // 이번 주에서 몇 주 떨어졌는지
  if (!demo) return <LoadingState />;
  const from = weekStartOf(demo.today).add(offset * 7, 'day');
  const to = from.add(6, 'day');
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label text-brand-deep">캘린더</p>
          <h1 className="mt-1 flex items-center gap-2 text-[28px]">
            {from.format('M월 D일')} –{' '}
            {to.month() === from.month() ? to.format('D일') : to.format('M월 D일')}
            <MockBadge />
          </h1>
          <p className="mt-1 text-[12px] text-fg-2">공부 블록 시각은 목업 규칙으로 놓았어요</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* [월]은 지시문 13 전까지 숨김 */}
          <div
            className="inline-flex rounded-full border border-line p-1"
            role="tablist"
            aria-label="보기"
          >
            <span
              role="tab"
              aria-selected="true"
              className="rounded-full bg-white/[0.08] px-3.5 py-1 text-[12.5px] font-semibold"
            >
              주
            </span>
          </div>
          <Button size="sm" onClick={() => setOffset((o) => o - 1)}>
            이전 주
          </Button>
          <Button size="sm" disabled={offset === 0} onClick={() => setOffset(0)}>
            이번 주
          </Button>
          <Button size="sm" onClick={() => setOffset((o) => o + 1)}>
            다음 주
          </Button>
        </div>
      </div>
      <Week key={from.format('YYYY-MM-DD')} from={from.format('YYYY-MM-DD')} />
    </>
  );
}
