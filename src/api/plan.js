import {
  fromUnit,
  toJob,
  toMaterials,
  toPlanDraft,
  toResplit,
  toResplitAsk,
  toTocUnits,
  toUnitExam,
  toUnits,
  toUploadStarted,
} from './adapters/plan.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getMaterials = async () => toMaterials(await http.get(EP.materials));

export async function uploadMaterial({ subjectId, file }) {
  const form = new FormData();
  form.append('subjectId', subjectId);
  form.append('file', file);
  return toUploadStarted(await http.post(EP.materials, form));
}

export const getJob = async (jobId) => toJob(await http.get(`${EP.materialJob}/${jobId}`));
export const postToc = async ({ subjectId, text }) =>
  toTocUnits(await http.post(EP.toc, { subjectId, text }));

export const patchUnitExam = async ({ materialId, unitNo, inExam }) =>
  toUnitExam(await http.patch(`${EP.materials}/${materialId}/units`, { unitNo, inExam }));

export const getUnits = async (subjectId) =>
  toUnits(await http.get(EP.units, { params: { subjectId } }));
export const putUnits = async ({ subjectId, units }) =>
  toUnits(await http.put(EP.units, { subjectId, units: units.map(fromUnit) }));

// saved: AI가 응답하지 않을 때 저장된 결과 (미리 만든 2주 계획, NF-10)
export const getPlanDraft = async (saved = false) =>
  toPlanDraft(await http.get(EP.planDraft, { params: saved ? { saved: 1 } : {} }));
export const postApprove = async () => http.post(EP.planApprove);

// 원본 PDF 파일 (QZ-13 근거 · 집중 모드 자료 열기)
export const getMaterialFile = async (materialId) =>
  http.get(`${EP.materials}/${materialId}/file`, { responseType: 'blob' });

// 다시 나누기 (S5-1 · S5-2, PL-06)
export const postResplit = async ({ request, answer, saved }) =>
  toResplitAsk(await http.post(EP.resplit, { request, answer, saved }));
export const getResplit = async () => toResplit(await http.get(EP.resplit));
export const postResplitApply = async () => http.post(`${EP.resplit}/apply`);
export const deleteResplit = async () => http.delete(EP.resplit);
