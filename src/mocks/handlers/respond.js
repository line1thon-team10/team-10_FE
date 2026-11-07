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
