// 서버 ID(익명 ID · 과목 · 태스크 · 퀴즈 · 집중 세션)는 모두 UUID예요. 목업이 만든 ID(t1, ds, mock-…)와 구분할 때 써요.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (v) => typeof v === 'string' && UUID.test(v);
