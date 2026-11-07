// 단원 목록 편집 도우미 (S3-2 · S4)
export const moveItem = (list, i, d) => {
  const next = [...list];
  const [x] = next.splice(i, 1);
  next.splice(i + d, 0, x);
  return next.map((u, k) => ({ ...u, no: k + 1 }));
};
export const patchItem = (list, i, patch) => list.map((u, k) => (k === i ? { ...u, ...patch } : u));
export const removeItem = (list, i) =>
  list.filter((_, k) => k !== i).map((u, k) => ({ ...u, no: k + 1 }));
export const unitRangeValid = (u) => u.title.trim() && u.from > 0 && u.to >= u.from;
