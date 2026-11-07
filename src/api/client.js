import axios from 'axios';
import { ENV } from '@/config/env.js';
import { readAnonymousId } from '@/lib/anonymousId.js';

// API 공통 함수. 기본 주소·공통 헤더·에러 형식을 여기서만 처리해요. 화면은 hooks/만 써요.
// TODO(확인필요): [백엔드 확정 필요] 익명 ID 헤더 이름, 공통 응답 형식 { success, data, error }
const ANON_HEADER = 'X-Anonymous-Id';

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
  const id = readAnonymousId();
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
  (err) => {
    const body = err.response?.data;
    const fallback =
      err.code === 'ECONNABORTED' ? '응답이 너무 늦어요' : '서버에 연결하지 못했어요';
    throw new ApiError(body?.error?.message ?? fallback, {
      code: body?.error?.code ?? err.code,
      status: err.response?.status,
    });
  },
);
