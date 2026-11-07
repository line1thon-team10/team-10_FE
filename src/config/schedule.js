import { SCHEDULE_KIND } from './labels.js';

// 요일 번호(1=월 … 7=일) ↔ 이름
export const DAY_NAMES = ['', '월', '화', '수', '목', '금', '토', '일'];
export const daysLabel = (days) => days.map((d) => DAY_NAMES[d]).join('·');
// "월·수·금 18:00–22:00 알바"
export const scheduleLine = (e) =>
  `${e.days ? daysLabel(e.days) : e.date} ${e.start}–${e.end} ${e.title ?? SCHEDULE_KIND[e.kind]}`;
export const hoursLabel = (min) => `${Math.round((min / 60) * 10) / 10}시간`;
