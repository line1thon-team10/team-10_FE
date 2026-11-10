import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

// '오늘'은 브라우저 시계가 아니라 서버가 준 데모 날짜를 써요 (NF-08).
export const toDay = (value) => dayjs(value);
export const fmtFull = (value) => dayjs(value).format('M월 D일 dddd'); // 11월 9일 월요일
export const fmtShort = (value) => dayjs(value).format('M/D (dd)'); // 11/9 (월)
export const fmtMD = (value) => dayjs(value).format('M/D');
export const ddayBetween = (today, target) =>
  dayjs(target).startOf('day').diff(dayjs(today).startOf('day'), 'day');
// 블록 시간 짧게: "오후 1:00–2:00" (오전/오후가 같으면 한 번만)
export const fmtTimeRange = (start, end) => {
  const part = (d) => {
    const h = d.getHours();
    return {
      ap: h < 12 ? '오전' : '오후',
      t: `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`,
    };
  };
  const a = part(start);
  const b = part(end);
  return a.ap === b.ap ? `${a.ap} ${a.t}–${b.t}` : `${a.ap} ${a.t}–${b.ap} ${b.t}`;
};

// 75 → '1시간 15분', 40 → '40분'
export const minutesLabel = (m) =>
  m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : `${m}분`;
