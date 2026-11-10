import { http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { askTutor, tutorBackup } from '../logic.js';
import { aiRun, run } from './respond.js';

// AI 튜터 (TU-01·02). mock은 키워드로 미리 써 둔 답 (AI 답 생성 시간 흉내)
export const tutorHandlers = [
  http.post(EP.tutor, async ({ request }) => {
    const { question, history } = await request.json();
    return aiRun('tutor', () => askTutor({ question, history }), 1500);
  }),
  // 저장된 결과 (NF-10, 임시 경로): 실패했을 때만 써요
  http.get(`${EP.tutor}/backup`, ({ request }) =>
    run(() => tutorBackup(new URL(request.url).searchParams.get('kind') ?? 'basic'), 200),
  ),
];
