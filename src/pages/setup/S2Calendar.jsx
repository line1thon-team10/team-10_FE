// S2 캘린더 확인 — 신민종
import koLocale from '@fullcalendar/core/locales/ko';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import AiBox from '@/components/common/AiBox.jsx';
import Button from '@/components/common/Button.jsx';
import CalEvent from '@/components/common/CalEvent.jsx';
import Card from '@/components/common/Card.jsx';
import SetupHead from '@/components/setup/SetupHead.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import EventModal from '@/components/setup/EventModal.jsx';
import { fmtShort } from '@/config/date.js';
import { hoursLabel } from '@/config/schedule.js';
import {
  useCalendar,
  useCreateEvent,
  useDeleteEvent,
  useUpdateEvent,
  useVoiceEvent,
} from '@/hooks/useOnboarding.js';

// 우리 일정 → FullCalendar 이벤트. 요일 1=월…7=일 → FullCalendar 0=일…6=토
const toFc = (e) => ({
  id: e.id,
  title: e.title,
  classNames: [`ev-${e.kind}`, e.added ? 'ev-added' : ''],
  ...(e.days
    ? { daysOfWeek: e.days.map((d) => d % 7), startTime: e.start, endTime: e.end }
    : { start: `${e.date}T${e.start}`, end: `${e.date}T${e.end}` }),
});

const LEGEND = [
  ['ev-class', '수업'],
  ['ev-job', '알바'],
  ['ev-meet', '약속'],
  ['ev-added', '방금 말로 추가한 일정'],
];

function VoiceAdd() {
  const [text, setText] = useState('');
  const voice = useVoiceEvent();
  const submit = (e) => {
    e.preventDefault();
    voice.mutate(text, {
      onSuccess: () => {
        toast('일정을 추가했어요. 캘린더에서 확인해 주세요');
        setText('');
      },
      onError: (err) => toast.error(err.message),
    });
  };
  return (
    <AiBox label="AI">
      <label htmlFor="s2-voice" className="text-sm font-semibold">
        말로 일정 추가
      </label>
      <form className="flex gap-2" onSubmit={submit}>
        <input
          id="s2-voice"
          className="min-w-0 flex-1 rounded-full border border-line-2 bg-bg px-3.5 py-2"
          placeholder="예: 수요일 저녁 7시부터 9시까지 팀플 회의"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
        />
        <Button type="submit" disabled={!text.trim() || voice.isPending}>
          {voice.isPending ? '정리 중…' : '추가'}
        </Button>
      </form>
    </AiBox>
  );
}

export default function S2Calendar() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useCalendar();
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const remove = useDeleteEvent();
  const [editing, setEditing] = useState(null); // 수정·추가 중인 일정

  if (isPending) return <LoadingState title="캘린더를 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const close = () => setEditing(null);
  const done = { onSuccess: close, onError: (e) => toast.error(e.message) };
  const onSave = (form) =>
    editing.id ? update.mutate({ id: editing.id, ...form }, done) : create.mutate(form, done);

  return (
    <>
      <SetupHead
        title="이렇게 정리했어요. 틀린 곳을 고쳐 주세요"
        desc="공부 계획은 비어 있는 시간에만 들어가요. 블록을 누르면 수정·삭제, 빈 칸을 누르면 추가할 수 있어요."
      >
        <Button onClick={() => navigate(ROUTES.s1)}>이전</Button>
        <Button variant="primary" onClick={() => navigate(ROUTES.s3)}>
          다음: 자료 올리기
        </Button>
      </SetupHead>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <AiBox label="AI 말한 내용을 정리한 캘린더" className="cal-wrap">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            initialDate={data.weekStart}
            now={data.today} // '오늘'은 데모 날짜 (브라우저 시계 X)
            locale={koLocale}
            firstDay={1}
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="24:00:00"
            height="auto"
            nowIndicator={false}
            headerToolbar={{ left: 'prev,today,next', center: 'title', right: '' }}
            buttonIcons={false}
            buttonText={{ prev: '이전 주', next: '다음 주', today: '이번 주' }}
            events={data.events.map(toFc)}
            selectable
            selectMirror
            eventContent={(arg) => <CalEvent event={arg.event} />}
            eventMinHeight={18}
            slotEventOverlap={false} // 실제로 시간이 겹치는 일정만 나란히
            eventClick={(info) => setEditing(data.events.find((e) => e.id === info.event.id))}
            select={(info) =>
              setEditing({
                kind: 'other',
                title: '',
                date: dayjs(info.start).format('YYYY-MM-DD'),
                start: dayjs(info.start).format('HH:mm'),
                end: dayjs(info.end).format('HH:mm'),
              })
            }
          />
        </AiBox>
        <aside className="flex min-w-0 flex-col gap-4">
          <Card className="flex flex-col gap-2">
            <h2 className="text-[15px]">시험 일정</h2>
            {data.exams.map((x) => (
              <p key={x.subjectId} className="num text-[13.5px]">
                {fmtShort(x.examDate)} {x.name}
              </p>
            ))}
          </Card>
          <Card className="flex flex-col gap-2">
            <h2 className="text-[15px]">이번 주 요약</h2>
            <p className="text-[13.5px]">
              고정 일정 <b className="num">{hoursLabel(data.summary.fixedMinutes)}</b>
            </p>
            <p className="text-[13.5px]">
              공부 가능한 빈 시간 <b className="num">{hoursLabel(data.summary.freeMinutes)}</b>
            </p>
          </Card>
          <Card className="flex flex-col gap-2">
            <h2 className="text-[15px]">범례</h2>
            {LEGEND.map(([cls, label]) => (
              <span key={cls} className="flex items-center gap-2 text-[13px]">
                <span className={`legend-swatch ${cls}`} aria-hidden="true" />
                {label}
              </span>
            ))}
          </Card>
          <VoiceAdd />
        </aside>
      </div>
      {editing && (
        <EventModal
          event={editing}
          saving={create.isPending || update.isPending || remove.isPending}
          onClose={close}
          onSave={onSave}
          onDelete={() => remove.mutate(editing.id, done)}
        />
      )}
    </>
  );
}
