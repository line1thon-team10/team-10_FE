// 환경변수는 여기서만 읽어요. 화면 코드에서 import.meta.env를 직접 쓰지 않아요.
export const ENV = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  // .env가 없어도 시연할 수 있게 기본값은 목업(true)이에요.
  useMock: import.meta.env.VITE_USE_MOCK !== 'false',
};
