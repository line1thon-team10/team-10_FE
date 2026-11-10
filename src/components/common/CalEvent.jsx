import { fmtTimeRange } from '@/config/date.js';

const LONG_MIN = 45; // 45분 이상이면 시간 줄도 보여요

// FullCalendar 블록 내용 (S2 · S11 공용): 모든 줄은 한 줄 고정 + 말줄임, 칸 밖으로 안 나가요.
// 45분 미만은 제목만(시간은 왼쪽 시간 축으로). 전체 제목·시간은 마우스를 올리면 보여요
export default function CalEvent({ event }) {
  const minutes = (event.end - event.start) / 60000;
  const time = fmtTimeRange(event.start, event.end);
  return (
    <div className="cal-ev" title={`${event.title} · ${time}`}>
      <b className="cal-ev-line">{event.title}</b>
      {minutes >= LONG_MIN && <span className="cal-ev-line cal-ev-time">{time}</span>}
    </div>
  );
}
