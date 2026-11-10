import { toFixResult, toInterpret, toRecordResult, toToday } from './adapters/today.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getToday = async () => toToday(await http.get(EP.today));

// result: done | partial | none, toPage: 부분 완료일 때 끝낸 페이지
export const postRecord = async ({ taskId, result, toPage }) =>
  toRecordResult(await http.post(EP.records, { taskId, result, toPage }));

// 기록한 뒤 끝낸 페이지 고치기
export const patchRecord = async ({ taskId, toPage }) =>
  toFixResult(await http.patch(`${EP.tasks}/${taskId}/record`, { toPage }));

export const postInterpret = async ({ taskId, text }) =>
  toInterpret(await http.post(EP.recordInterpret, { taskId, text }));

// 분배안 적용 (RC-04) → 회복 박스 연출 정보
export const postReplan = async (key) => toRecordResult(await http.post(EP.replan, { key }));
