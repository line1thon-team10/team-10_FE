import type { NoteGroup, NoteTab, ReviewNote, WeakGroup } from "./types";

const pad = (value: number) => String(value).padStart(2, "0");

export const toDateKey = (iso: string) => {
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toMonthDay = (iso: string) => {
  const date = new Date(iso);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const isToday = (iso: string) => toDateKey(iso) === todayKey();

/** 2회 이상 틀린 개념을 과목별로 묶습니다. */
export const getWeakGroups = (notes: ReviewNote[]): WeakGroup[] => {
  const bySubject = new Map<string, WeakGroup>();

  notes.forEach((note) => {
    const found =
      bySubject.get(note.subject) ??
      { subject: note.subject, accent: note.accent, concepts: [] } as WeakGroup;
    const concept = found.concepts.find((item) => item.name === note.concept);
    if (concept) concept.count += note.wrongCount;
    else found.concepts.push({ name: note.concept, count: note.wrongCount });
    bySubject.set(note.subject, found);
  });

  return [...bySubject.values()]
    .map((group) => ({
      ...group,
      concepts: group.concepts.filter((item) => item.count >= 2).sort((a, b) => b.count - a.count),
    }))
    .filter((group) => group.concepts.length > 0);
};

export const getWeakSentence = (groups: WeakGroup[]): string =>
  groups
    .map((group) => `${group.subject} ${group.concepts.map((item) => item.name).join("·")}`)
    .join(", ");

export const getWeakTotal = (groups: WeakGroup[]): number =>
  groups.reduce((sum, group) => sum + group.concepts.length, 0);

const sortByRecent = (items: ReviewNote[]) =>
  [...items].sort((a, b) => (a.lastAt < b.lastAt ? 1 : a.lastAt > b.lastAt ? -1 : b.wrongCount - a.wrongCount));

export const getNoteGroups = (notes: ReviewNote[], tab: NoteTab): NoteGroup[] => {
  if (tab === "date") {
    const map = new Map<string, ReviewNote[]>();
    notes.forEach((note) => {
      const key = toDateKey(note.lastAt);
      map.set(key, [...(map.get(key) ?? []), note]);
    });
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, items]) => {
        const sample = items[0];
        return {
          key,
          label: isToday(sample.lastAt) ? `${toMonthDay(sample.lastAt)} · 오늘` : toMonthDay(sample.lastAt),
          sub: `이 날 다시 본 ${items.length}문항`,
          items: sortByRecent(items),
        };
      });
  }

  if (tab === "unit") {
    const map = new Map<string, ReviewNote[]>();
    notes.forEach((note) => {
      const key = `${note.subject} · ${note.unit}`;
      map.set(key, [...(map.get(key) ?? []), note]);
    });
    return [...map.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([key, items]) => ({
        key,
        label: key,
        sub: `오답 ${items.reduce((sum, item) => sum + item.wrongCount, 0)}회 누적 · ${items.length}문항`,
        items: sortByRecent(items),
      }));
  }

  const tiers = [
    { key: "tier-3", label: "3회 이상 틀린 문항", min: 3, max: 99 },
    { key: "tier-2", label: "2회 틀린 문항", min: 2, max: 2 },
    { key: "tier-1", label: "1회 틀린 문항", min: 1, max: 1 },
  ];

  return tiers
    .map((tier) => {
      const items = notes.filter((note) => note.wrongCount >= tier.min && note.wrongCount <= tier.max);
      return {
        key: tier.key,
        label: tier.label,
        sub: `${items.length}문항 · 먼저 다시 볼 순서`,
        items: sortByRecent(items),
      };
    })
    .filter((group) => group.items.length > 0);
};