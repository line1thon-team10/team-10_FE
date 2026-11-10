import { HttpResponse, delay } from 'msw';
import { db } from '../db.js';

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

// AI가 만드는 응답 (NF-05·10): /dev에서 고른 상태를 흉내 내요. saved면 저장된 결과라 바로 돌려줘요
// slow: 35초 뒤 응답 (8초 안내 · 30초 다시 시도 확인) · fail: 실패 응답
export const AI_SLOW_MS = 35000;
export async function aiRun(target, fn, ms, { saved = false } = {}) {
  const mode = saved ? null : db.get().aiSim?.[target];
  if (mode === 'fail') {
    await delay(1200);
    return fail('AI_FAILED', 'AI 응답을 받지 못했어요', 503);
  }
  return run(fn, mode === 'slow' ? AI_SLOW_MS : ms);
}
