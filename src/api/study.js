import { toSession } from './adapters/study.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const startSession = async (taskId) => toSession(await http.post(EP.sessions, { taskId }));
export const getActiveSession = async () => toSession(await http.get(`${EP.sessions}/active`));
export const getSession = async (id) => toSession(await http.get(`${EP.sessions}/${id}`));
export const pauseSession = async (id) => toSession(await http.post(`${EP.sessions}/${id}/pause`));
export const resumeSession = async (id) =>
  toSession(await http.post(`${EP.sessions}/${id}/resume`));
export const endSession = async (id) => toSession(await http.post(`${EP.sessions}/${id}/end`));
