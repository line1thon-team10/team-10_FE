// 익명 ID (NF-01). 서버가 발급한 값만 저장해요. 이름·전화번호 같은 개인정보는 저장하지 않아요.
const KEY = 'pirwichim.anonymousId';

export function readAnonymousId() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function saveAnonymousId(id) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    // 저장소를 못 쓰는 브라우저면 이번 접속에서만 유지돼요.
  }
}

export function clearAnonymousId() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 무시
  }
}
