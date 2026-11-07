import { toDemoState } from './adapters/demo.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const getDemoState = async () => toDemoState(await http.get(EP.demoState));
export const postNextDay = async () => toDemoState(await http.post(EP.demoNextDay));
export const postResetDemo = async () => toDemoState(await http.post(EP.demoReset));
