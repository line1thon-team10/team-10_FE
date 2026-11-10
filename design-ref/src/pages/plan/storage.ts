import type { PlanDraft } from "./types";

const CACHE_NAME = "piryochim-plan-v1";
const DRAFT_KEY = "/plan-draft.json";

/**
 * 승인 전 계획 초안을 브라우저에 임시로 보관합니다.
 * 구조를 가진 데이터라 localStorage 대신 Cache Storage를 사용합니다.
 */
export async function savePlanDraft(draft: PlanDraft): Promise<boolean> {
  if (typeof caches === "undefined") return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const body = JSON.stringify(draft);
    await cache.put(
      new Request(DRAFT_KEY),
      new Response(body, { headers: { "Content-Type": "application/json" } }),
    );
    return true;
  } catch {
    return false;
  }
}

export async function loadPlanDraft(): Promise<PlanDraft | null> {
  if (typeof caches === "undefined") return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(new Request(DRAFT_KEY));
    if (!response) return null;
    return (await response.json()) as PlanDraft;
  } catch {
    return null;
  }
}

export async function clearPlanDraft(): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(new Request(DRAFT_KEY));
  } catch {
    // 보관함이 없는 브라우저는 조용히 넘어갑니다.
  }
}