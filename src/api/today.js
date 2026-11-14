import {
  toCompletionInput,
  toFixResult,
  toInterpret,
  toRecordResult,
  toReplan,
  toToday,
} from './adapters/today.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getToday = async () => toToday(await http.get(EP.today));

// result: done | partial | none, toPage: 부분 완료일 때 끝낸 페이지
// sessionId: 집중 모드에서 온 기록이면 측정 시간을 붙여요 (없으면 시간 없이 저장)
export const postRecord = async ({ taskId, result, ...completion }) =>
  toRecordResult(await http.post(EP.records, { taskId, result, ...toCompletionInput(completion) }));

// 기록한 뒤 끝낸 페이지 고치기
export const patchRecord = async ({ taskId, ...completion }) =>
  toFixResult(await http.patch(`${EP.tasks}/${taskId}/record`, toCompletionInput(completion)));

export const postInterpret = async ({ taskId, text }) =>
  toInterpret(await http.post(EP.recordInterpret, { taskId, text }));

// 속도 보정 [반영] · [그대로] → { applied, overDays, replan }
export const postPace = async ({ subjectId, apply }) => http.post(EP.pace, { subjectId, apply });

// 분배안 적용 (RC-04) → 회복 박스 연출 정보
export const postReplan = async (key) => toRecordResult(await http.post(EP.replan, { key }));

// P2 분배안 안 3개 만들기 (AI 설명). saved면 저장된 결과
export const getReplanOptions = async (saved = false) =>
  toReplan(await http.get(`${EP.replan}/options`, { params: saved ? { saved: 1 } : {} }));
