import { toEmptyTime, toVoicePreview, toWeekCalendar } from './adapters/schedule.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getWeekCalendar = async ({ from, to }) =>
  toWeekCalendar(await http.get(EP.weekCalendar, { params: { from, to } }));
// 일정을 지우면 빈 시간 안(P5)을 돌려줘요. 공부 블록은 지우지 않아요
export const deleteSchedule = async ({ id, scope }) =>
  toEmptyTime(await http.delete(`${EP.schedules}/${id}`, { params: { scope } }));
export const postEmptyTime = async (option) => http.post(EP.emptyTime, { option });
export const postVoiceEvent = async (text) =>
  toVoicePreview(await http.post(`${EP.schedules}/voice`, { text }));
export const postVoiceApply = async () => http.post(`${EP.schedules}/voice/apply`);
