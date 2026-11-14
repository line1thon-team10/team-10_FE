// 범위 입력 검증만 담당해요. 페이지 합집합과 진행률은 서버가 계산해요.
export const pagedRanges = (task) =>
  task.ranges.filter(
    (range) =>
      Number.isInteger(range.from) &&
      Number.isInteger(range.to) &&
      range.from >= 1 &&
      range.to >= range.from,
  );

export const initialRangeInput = (task) =>
  Object.fromEntries(pagedRanges(task).map((range) => [range.id, String(range.doneTo ?? '')]));

export function recordSelection(task, values, result, fixing = false) {
  if (!fixing && (result === 'done' || result === 'none')) return { valid: true, completion: {} };
  const ranges = pagedRanges(task);
  if (!ranges.length || task.pages === 0 || (!fixing && result !== 'partial'))
    return { valid: false };
  const completedRanges = [];
  for (const range of ranges) {
    const value = values[range.id] ?? '';
    if (value.trim() === '') continue;
    const toPage = Number(value);
    if (!Number.isInteger(toPage) || toPage < range.from || toPage > range.to)
      return {
        valid: false,
        error: `p.${range.from}부터 p.${range.to} 사이의 정수를 적어 주세요.`,
      };
    completedRanges.push({ rangeId: range.id, toPage });
  }
  if (!fixing && completedRanges.length === 0)
    return { valid: false, error: '부분 완료한 범위에 끝낸 페이지를 적어 주세요.' };
  if (!fixing && ranges.every((range) => Number(values[range.id]) === range.to))
    return { valid: false, error: "모든 범위를 끝냈으면 '완료'를 골라 주세요." };
  return {
    valid: true,
    completion:
      ranges.length === 1 && completedRanges.length === 1
        ? { toPage: completedRanges[0].toPage }
        : { completedRanges },
  };
}

export const taskRangeLabel = (task) => {
  const ranges = pagedRanges(task);
  if (!ranges.length) return '페이지 없는 학습';
  if (ranges.length === 1) return `p.${ranges[0].from}–${ranges[0].to}`;
  return `${ranges.length}개 범위`;
};

export const rangeInputLabel = (task, range, index) => {
  const materials = [...new Set(task.ranges.map((item) => item.materialId))];
  return `${materials.length > 1 ? `자료 ${materials.indexOf(range.materialId) + 1} · ` : ''}범위 ${index + 1} (p.${range.from}–${range.to})`;
};
