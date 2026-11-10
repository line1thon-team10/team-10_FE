const CONFIRMED_KEY = "pyo:plan-confirmed";
const ANON_KEY = "pyo:anon-id";

const makeAnonId = () =>
  `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** 익명 ID는 처음 한 번만 만들어 저장합니다. */
export function ensureAnonId(): string {
  try {
    const saved = window.localStorage.getItem(ANON_KEY);
    if (saved) return saved;
    const created = makeAnonId();
    window.localStorage.setItem(ANON_KEY, created);
    return created;
  } catch {
    return "";
  }
}

/** 5단계 [이대로 계획 확정]에서 계획 확정 여부와 익명 ID를 함께 저장합니다. */
export function confirmPlanAccess(): boolean {
  try {
    ensureAnonId();
    window.localStorage.setItem(CONFIRMED_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

/** 저장을 읽지 못하면 확정되지 않은 것으로 보고 /plan 으로 보냅니다. */
export function hasConfirmedPlan(): boolean {
  try {
    return window.localStorage.getItem(CONFIRMED_KEY) === "1";
  } catch {
    return false;
  }
}

/** 데모 '빈 계정': 확정 여부와 익명 ID를 함께 지웁니다. */
export function clearPlanAccess(): void {
  try {
    window.localStorage.removeItem(CONFIRMED_KEY);
    window.localStorage.removeItem(ANON_KEY);
  } catch {
    // 저장소를 쓸 수 없는 브라우저는 조용히 넘어갑니다.
  }
}