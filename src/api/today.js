import { toInterpret, toRecordResult, toToday } from './adapters/today.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getToday = async () => toToday(await http.get(EP.today));

// result: done | partial | none, toPage: 부분 완료일 때 끝낸 페이지
export const postRecord = async ({ taskId, result, toPage }) =>
  toRecordResult(await http.post(EP.records, { taskId, result, toPage }));

export const postInterpret = async ({ taskId, text }) =>
  toInterpret(await http.post(EP.recordInterpret, { taskId, text }));
