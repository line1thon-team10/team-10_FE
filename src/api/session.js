import { toSession } from './adapters/session.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

export const createSession = async () => toSession(await http.post(EP.session));
