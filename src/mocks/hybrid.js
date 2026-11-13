import { bypass, http, HttpResponse, passthrough } from 'msw';
import { isUuid } from '@/lib/uuid.js';
import { db } from './db.js';
import { advanceDay } from './logic.js';

// 혼합 모드 (VITE_USE_MOCK=hybrid, 11/13 결정): 서버 0.1.0에 있는 경로만 서버로 보내고 나머지는 목업이 받아요.
// 서버에 있는 경로 목록은 이 파일에만 둬요. 경로가 서버에 생기면 여기에 한 줄 추가해요.
const SERVER_ROUTES = [
  'POST /api/session',
  'GET /api/demo/state',
  'POST /api/demo/seed',
  'POST /api/demo/reset',
  'POST /api/demo/next-day',
  'GET /api/today',
  'POST /api/records',
  'PATCH /api/tasks/:id/record',
  'GET /api/books',
  'GET /api/quiz/today', // :key보다 먼저 (today는 UUID가 아니라 목업으로 빠지면 안 돼요)
  'GET /api/quiz/:key',
  'POST /api/quiz/:key/submit',
  'GET /api/quiz/:key/result',
  'POST /api/quiz/:subjectId/more',
  'GET /api/plan/replan/options',
  'POST /api/plan/replan',
  'POST /api/study/sessions',
  'GET /api/study/sessions/active', // :id보다 먼저
  'GET /api/study/sessions/:id',
  'POST /api/study/sessions/:id/pause',
  'POST /api/study/sessions/:id/resume',
  'POST /api/study/sessions/:id/end',
].map((line) => {
  const [method, path] = line.split(' ');
  return { method, re: new RegExp(`^${path.replace(/:\w+/g, '([^/]+)')}$`) };
});

// 서버로 보낸 데모 조작이 성공하면 목업도 같은 시드 · 같은 날로 맞춰요 (목업 화면 날짜가 서버와 맞게)
const DEMO_SYNC = {
  '/api/demo/seed': (data) => db.seed(data.seed),
  '/api/demo/reset': (data) => db.seed(data.seed),
  '/api/demo/next-day': () => advanceDay(),
};

async function bodyIdsAreUuid(request) {
  if (request.method === 'GET') return true;
  const body = await request
    .clone()
    .json()
    .catch(() => null);
  return body?.taskId == null || isUuid(body.taskId);
}

export const hybridHandler = http.all('/api/*', async ({ request }) => {
  const path = new URL(request.url).pathname;
  // 서버 ID는 모두 UUID예요. 목업에서 만든 ID(t1, ds 등)로는 서버를 부르지 않아요.
  const params = SERVER_ROUTES.find((r) => r.method === request.method && r.re.test(path))
    ?.re.exec(path)
    .slice(1);
  if (!params || !params.every(isUuid) || !(await bodyIdsAreUuid(request))) return; // 목업 핸들러로

  const sync = DEMO_SYNC[path];
  if (!sync) return passthrough();
  const res = await fetch(bypass(request));
  if (!res.headers.get('content-type')?.includes('json')) return res; // 프록시 오류 페이지 등은 그대로
  const body = await res.json();
  if (res.ok && body.success) {
    try {
      sync(body.data);
    } catch {
      // 목업 시나리오 밖의 날(DEMO_END 등)이면 목업 날짜는 그대로 둬요. 화면은 서버 값을 따라요.
    }
  }
  return HttpResponse.json(body, { status: res.status });
});
