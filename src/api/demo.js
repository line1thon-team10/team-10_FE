import { toDemoState } from './adapters/demo.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getDemoState = async () => toDemoState(await http.get(EP.demoState));
export const postNextDay = async () => toDemoState(await http.post(EP.demoNextDay));
export const postResetDemo = async () => toDemoState(await http.post(EP.demoReset));
export const postSeed = async (seed) => toDemoState(await http.post(EP.demoSeed, { seed }));

// AI 상태 재현 (/dev): { plan, quiz, grading, tutor, replan } = null | slow | fail
export const getAiSim = async () => http.get(EP.demoAi);
export const postAiSim = async ({ target, mode }) => http.post(EP.demoAi, { target, mode });
