import {
  fromUnit,
  toJob,
  toMaterials,
  toPlanDraft,
  toTocUnits,
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

export const getUnits = async (subjectId) =>
  toUnits(await http.get(EP.units, { params: { subjectId } }));
export const putUnits = async ({ subjectId, units }) =>
  toUnits(await http.put(EP.units, { subjectId, units: units.map(fromUnit) }));

export const getPlanDraft = async () => toPlanDraft(await http.get(EP.planDraft));
export const postApprove = async () => http.post(EP.planApprove);
