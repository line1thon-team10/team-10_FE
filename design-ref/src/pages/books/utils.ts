import type { BlockState, BookBlock, BookUnit } from "./types";

export const STATE_ORDER: BlockState[] = ["stable", "wobble", "risk", "progress", "planned", "supplement"];

export const STATE_LABEL: Record<BlockState, string> = {
  stable: "안정",
  wobble: "흔들림",
  risk: "붕괴 위기",
  progress: "진행 중",
  planned: "예정",
  supplement: "보충",
};

export const STATE_TONE: Record<BlockState, string> = {
  stable: "hp-bk-green",
  wobble: "hp-bk-amber",
  risk: "hp-bk-red",
  progress: "hp-bk-amber",
  planned: "hp-bk-steel",
  supplement: "hp-bk-amber",
};

export const STATE_NOTE: Record<BlockState, string> = {
  stable: "완료 · 초록불",
  wobble: "완료 · 좌우로 살짝 흔들림",
  risk: "완료 · 기울어진 채 흔들림",
  progress: "이번 주에 쌓는 중",
  planned: "아직 쌓지 않은 블록",
  supplement: "막대 위에 새로 올라간 보충 학습",
};

/** 이해도 색은 단원 단위: 그 단원의 완료 블록이 모두 같은 색을 씁니다. */
export const unitTone = (score: number | null) => {
  if (score === null) return "hp-bk-steel";
  if (score >= 80) return "hp-bk-green";
  if (score >= 60) return "hp-bk-amber";
  return "hp-bk-red";
};

export const blockClass = (unit: BookUnit, block: BookBlock, picked: boolean) => {
  const base = ["bk-block", unitTone(unit.score)];
  if (block.state === "planned") base.push("bk-block--planned");
  else if (block.state === "progress") base.push("bk-block--progress");
  else if (block.state === "supplement") base.push("bk-block--supplement");
  else if (block.state === "wobble") base.push("bk-wobble");
  else if (block.state === "risk") base.push("bk-risk");
  if (picked) base.push("is-picked");
  return base.join(" ");
};

/** 블록을 눌렀을 때 보여줄 글: '흔들림 · 노란불 · 이해도 73점' */
export const describeBlock = (unit: BookUnit, block: BookBlock) => {
  const head =
    block.state === "planned"
      ? "예정 · 아직 쌓지 않은 블록"
      : block.state === "progress"
        ? `진행 중 · 이번 주에 쌓는 중 · 이해도 ${unit.score ?? 0}점`
        : block.state === "supplement"
          ? `보충 · 흔들림을 다시 채우는 블록 · 이해도 ${unit.score ?? 0}점`
          : `${unit.level} · ${unit.signal} · 이해도 ${unit.score ?? 0}점`;

  const foot =
    block.state === "planned"
      ? "계획한 태스크라 아직 막대에 쌓이지 않았어요."
      : block.state === "progress"
        ? "절반쯤 쌓였어요. 기록을 마치면 완료 블록으로 굳어요."
        : block.state === "supplement"
          ? "한 번 쌓인 블록은 빼지 않고, 보충은 새 블록으로 올려요."
          : "퀴즈 이해도에 따라 이 단원 블록의 색이 함께 바뀌어요.";

  return { head, foot };
};

export const unitSummary = (unit: BookUnit) => {
  if (unit.score === null) return `예정 · 블록 ${unit.blocks.length}개`;
  return `${unit.level} ${unit.score} · 블록 ${unit.blocks.length}개`;
};