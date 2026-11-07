// 서버 응답 → 화면에서 쓰는 모양. 명세가 나오면 이 함수 안의 필드 이름만 바꿔요.
// TODO(확인필요): [백엔드 확정 필요] 필드 이름 anonymousId
export const toSession = (raw) => ({ anonymousId: raw.anonymousId });
