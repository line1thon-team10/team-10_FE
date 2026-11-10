import { toEmptyTime } from './adapters/schedule.js';
import { toAdditionPreview, toPlanPreview, toSubjectCard, toSubjects } from './adapters/manage.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getSubjects = async () => toSubjects(await http.get(EP.subjects));
export const previewSubjectEdit = async ({ id, ...patch }) =>
  toPlanPreview(await http.patch(`${EP.subjects}/${id}/preview`, patch));
export const applySubjectEdit = async (id) =>
  toSubjectCard(await http.patch(`${EP.subjects}/${id}`));
export const previewSubjectRemove = async (id) =>
  toPlanPreview(await http.delete(`${EP.subjects}/${id}/preview`));
// 과목 빼기 → 빈 시간 안 (P5)
export const applySubjectRemove = async (id) => {
  const raw = await http.delete(`${EP.subjects}/${id}`);
  return raw.emptyTime ? toEmptyTime(raw) : null;
};
export const previewAddition = async (body) =>
  toAdditionPreview(await http.post(`${EP.additions}/preview`, body));
export const applyAddition = async () => http.post(EP.additions);
export const previewTodayPlan = async ({ action, taskId }) =>
  toPlanPreview(await http.post(`${EP.todayPlan}/preview`, { action, taskId }));
export const applyTodayPlan = async (action) => http.post(EP.todayPlan, { action });
