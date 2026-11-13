// 환경변수는 여기서만 읽어요. 화면 코드에서 import.meta.env를 직접 쓰지 않아요.
// VITE_USE_MOCK: true(전부 목업, 기본) | false(전부 서버) | hybrid(서버에 있는 경로만 서버, 나머지 목업)
const USE_MOCK = import.meta.env.VITE_USE_MOCK;

export const ENV = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  // .env가 없어도 시연할 수 있게 기본값은 목업이에요. false가 아니면 MSW를 켜요 (hybrid 포함).
  useMock: USE_MOCK !== 'false',
  mode: USE_MOCK === 'false' ? 'server' : USE_MOCK === 'hybrid' ? 'hybrid' : 'mock',
};
