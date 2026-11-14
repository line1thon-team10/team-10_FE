import axios from 'axios';
import { ENV } from '@/config/env.js';
import { clearAnonymousId, readAnonymousId, saveAnonymousId } from '@/lib/anonymousId.js';
import { isUuid } from '@/lib/uuid.js';
import { toSession } from './adapters/session.js';
import { EP } from './endpoints.js';

// API 공통 함수. 기본 주소·공통 헤더·에러 형식을 여기서만 처리해요. 화면은 hooks/만 써요.
// TODO(확인필요): [백엔드 확정 필요] 익명 ID 헤더 이름, 공통 응답 형식 { success, data, error }
const ANON_HEADER = 'X-Anonymous-Id';
// 서버가 익명 ID를 모르면 이 코드로 401을 줘요 → 새로 받아 그 요청을 1번만 다시 보내요 (11/13 결정)
const RENEW_CODES = ['NO_SESSION', 'UNKNOWN_SESSION'];

export class ApiError extends Error {
  constructor(message, { code, status } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const http = axios.create({ baseURL: ENV.apiBaseUrl, timeout: 30_000 });

http.interceptors.request.use((config) => {
  let id = readAnonymousId();
  // 목업 때 저장된 mock- ID는 서버가 500으로 받아요 → 지우고 안 보내면 NO_SESSION 401 → 아래에서 재발급
  // TODO(확인필요): [백엔드 확정 필요] 모양이 틀린 ID도 401 UNKNOWN_SESSION으로 달라고 요청함 (11/14)
  if (id && ENV.mode !== 'mock' && !isUuid(id)) {
    clearAnonymousId();
    id = null;
  }
  if (id) config.headers[ANON_HEADER] = id;
  return config;
});

// 성공이면 data만 돌려주고, 실패면 ApiError로 통일해요.
http.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (body.success) return body.data;
      throw new ApiError(body.error?.message ?? '요청을 처리하지 못했어요', {
        code: body.error?.code,
        status: res.status,
      });
    }
    return body;
  },
  async (err) => {
    let body = err.response?.data;
    // 파일 요청(responseType: 'blob')은 실패 본문도 Blob으로 와요 → JSON이면 풀어서 code·message를 읽어요
    if (body instanceof Blob && body.type.includes('json')) body = JSON.parse(await body.text());
    const config = err.config;
    if (
      err.response?.status === 401 &&
      RENEW_CODES.includes(body?.error?.code) &&
      config &&
      !config.renewed &&
      config.url !== EP.session
    ) {
      config.renewed = true;
      // 여러 요청이 같은 옛 ID로 401을 받아도 새 ID는 한 번만 받아요
      if ((config.headers[ANON_HEADER] ?? null) === readAnonymousId()) {
        renewing ??= renewSession().finally(() => {
          renewing = null;
        });
      }
      if (renewing) await renewing;
      return http(config);
    }
    const fallback =
      err.code === 'ECONNABORTED' ? '응답이 너무 늦어요' : '서버에 연결하지 못했어요';
    throw new ApiError(body?.error?.message ?? fallback, {
      code: body?.error?.code ?? err.code,
      status: err.response?.status,
    });
  },
);

let renewing = null;
async function renewSession() {
  clearAnonymousId();
  saveAnonymousId(toSession(await http.post(EP.session)).anonymousId);
}
