import { HttpResponse, delay } from 'msw';

// mock 응답 공통 모양 — TODO(확인필요): [백엔드 확정 필요] { success, data, error }는 제안 형식이에요.
export async function ok(data, ms = 200) {
  await delay(ms);
  return HttpResponse.json({ success: true, data });
}

export async function fail(code, message, status = 400) {
  await delay(200);
  return HttpResponse.json({ success: false, error: { code, message } }, { status });
}

// logic.js의 MockError를 실패 응답으로 바꿔요
export async function run(fn, ms) {
  try {
    return await ok(await fn(), ms);
  } catch (e) {
    if (e?.code) return fail(e.code, e.message, e.status);
    throw e;
  }
}
