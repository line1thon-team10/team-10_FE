import { fromTutorAsk, toTutorAnswer } from './adapters/tutor.js';
import { http } from './client.js';
import { EP } from './endpoints.js';

// backup: 응답이 늦거나 실패했을 때 저장된 결과를 받아요 (basic | easy)
export const askTutor = async ({ backup, ...ask }) =>
  toTutorAnswer(
    backup
      ? await http.get(`${EP.tutor}/backup`, { params: { kind: backup } })
      : await http.post(EP.tutor, fromTutorAsk(ask)),
  );
