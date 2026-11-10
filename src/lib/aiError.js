// AI 응답 실패: 서버 실패 응답이거나 30초 안에 답이 없어 끊긴 경우 (NF-05·10 → 실패 문구 · 다시 시도 · 저장된 결과)
export const isAiFail = (e) => ['AI_FAILED', 'ECONNABORTED'].includes(e?.code);
