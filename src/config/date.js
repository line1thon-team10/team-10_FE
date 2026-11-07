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
