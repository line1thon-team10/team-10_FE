// mock: 말로 한 일정 문장 해석 (S2 말로 일정 추가 · S6-4 공용). 실제 해석은 AI(김현민) 몫이에요.
// db·dayjs 없이 문장만 받아요. 뽑는 순서: ① 기간 ② 시각 범위 ③ 시각 ④ 때 ⑤ 요일·반복
// 이름은 찾은 표현과 바로 뒤 조사(부터·까지·동안·에·마다)만 지우고, 끝맺음 말과 끝의 '일정·약속'은 문장 끝에서만 떼요.
// 결과: { title, days: [1=월 … 7=일], repeat, start: 'HH:MM' | null, end: 'HH:MM' | null }

const DAY = '월화수목금토일';
const DEFAULT_TITLE = '새 일정';
const DEFAULT_MIN = 120; // 끝 시간이 없을 때 기본 길이 (지금 규칙)
// 시각 없이 때만 있으면 쓰는 기본 범위 (지시문 10 규칙 그대로)
const WORD_RANGE = {
  아침: [9, 11],
  오전: [9, 11],
  점심: [12, 13],
  오후: [14, 16],
  저녁: [19, 21],
  밤: [21, 23],
};
const PM = ['오후', '저녁', '밤'];
const ENDINGS =
  /\s*(있어요|있어|있음|생겼어요|생겼어|잡혔어|할\s*거야|추가해\s*줘|넣어\s*줘|이야|해|야)\s*$/;
const TAIL_WORDS = /\s*(일정|약속)\s*$/;
const P = '(?:부터|까지|동안|에|마다)?'; // 찾은 표현 바로 뒤 조사
const MIN_PART = '(?:\\s*(반|(\\d{1,2})\\s*분))?'; // 8시 반 · 8시 30분

const hm = (n) =>
  `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const minOf = (half, mm) => (half === '반' ? 30 : mm ? Number(mm) : 0);

export function parseSchedule(text) {
  let rest = ` ${String(text ?? '')} `;
  const cut = (re) => {
    const m = rest.match(re);
    if (m) rest = rest.slice(0, m.index) + ' ' + rest.slice(m.index + m[0].length);
    return m;
  };

  // ① 기간: 2시간 · 1시간 반 · 1시간 30분 · 90분 (+동안). '8시 30분'의 30분은 기간이 아니에요
  let duration = null;
  const dh = cut(new RegExp(`(\\d{1,2})\\s*시간(?:\\s*(반|(\\d{1,2})\\s*분))?\\s*${P}`));
  if (dh) duration = Number(dh[1]) * 60 + minOf(dh[2], dh[3]);
  else {
    const dm = cut(new RegExp(`(?<!\\d\\s*시\\s*)(\\d{1,3})\\s*분\\s*${P}`));
    if (dm) duration = Number(dm[1]);
  }

  // ② 시각 범위: 8시부터 10시까지 · 8시~10시 · 8~10시 · 8시-10시 ('시간'의 '시'는 시각이 아님)
  let start = null;
  let end = null;
  const range =
    cut(
      new RegExp(
        `(\\d{1,2})\\s*시(?!간)${MIN_PART}\\s*(?:부터|에서)?\\s*[~\\-–]?\\s*(\\d{1,2})\\s*시(?!간)${MIN_PART}\\s*${P}`,
      ),
    ) ?? cut(new RegExp(`(\\d{1,2})\\s*[~\\-–]\\s*(\\d{1,2})\\s*시(?!간)${MIN_PART}\\s*${P}`));
  if (range && range.length > 6) {
    start = { h: Number(range[1]), m: minOf(range[2], range[3]) };
    end = { h: Number(range[4]), m: minOf(range[5], range[6]) };
  } else if (range) {
    start = { h: Number(range[1]), m: 0 };
    end = { h: Number(range[2]), m: minOf(range[3], range[4]) };
  }

  // ③ 시각: 8시 · 8시 반 · 8시 30분
  if (!start) {
    const c = cut(new RegExp(`(\\d{1,2})\\s*시(?!간)${MIN_PART}\\s*${P}`));
    if (c) start = { h: Number(c[1]), m: minOf(c[2], c[3]) };
  }

  // ④ 때: 아침·오전·새벽은 그대로, 점심은 12시, 오후·저녁·밤은 12 미만이면 +12 (단어 안 글자는 안 건드려요)
  const w = cut(/(?<=\s|\d)(새벽|아침|오전|점심|오후|저녁|밤)(?:에)?(?=\s|\d)/);
  const word = w?.[1] ?? null;
  const shift = (t) => {
    if (!t) return t;
    if (PM.includes(word) && t.h < 12) return { ...t, h: t.h + 12 };
    if (word === '점심' && t.h < 12) return { ...t, h: 12 };
    return t;
  };
  start = shift(start);
  end = shift(end);
  if (start && end && end.h * 60 + end.m <= start.h * 60 + start.m && end.h < 12)
    end = { ...end, h: end.h + 12 }; // 7시부터 9시까지 → 같은 오후로

  // ⑤ 요일·반복: 수요일 · 수욜 · 월수금 · 매주 · 매일 · 평일 · 주말 · ~마다
  let days = [];
  let repeat = false;
  if (cut(/(?<=\s)매일(?:마다)?(?=\s)/)) {
    days = [1, 2, 3, 4, 5, 6, 7];
    repeat = true;
  } else if (cut(/(?<=\s)평일(?:마다|에)?(?=\s)/)) {
    days = [1, 2, 3, 4, 5];
    repeat = true;
  } else if (cut(/(?<=\s)주말(?:마다|에)?(?=\s)/)) {
    days = [6, 7];
    repeat = true;
  }
  if (cut(/(?<=\s)매주(?=\s)/)) repeat = true;
  const one = cut(new RegExp(`([${DAY}])(?:요일|욜)(마다)?(?:에)?(?=\\s)`));
  if (one) {
    days = [DAY.indexOf(one[1]) + 1];
    if (one[2]) repeat = true;
  } else {
    const many = cut(new RegExp(`(?<=\\s)([${DAY}]{2,7})(마다)?(?:에)?(?=\\s)`));
    if (many) {
      days = [...many[1]].map((c) => DAY.indexOf(c) + 1);
      repeat = true;
    }
  }

  // 끝 시간: 범위 → 시작 + 기간 → 기본 길이. 시각이 없으면 때 기본 범위
  let s = start ? start.h * 60 + start.m : null;
  let e = end ? end.h * 60 + end.m : null;
  if (s == null && word && WORD_RANGE[word]) [s, e] = WORD_RANGE[word].map((h) => h * 60);
  if (s != null && e == null) e = s + (duration ?? DEFAULT_MIN);
  if (e != null) e = Math.min(e, 24 * 60);

  // 이름: 끝맺음 말 → 끝의 '일정·약속' (문장 끝에서만, 남는 게 없을 때까지 한 번씩)
  let title = rest.replace(/\s+/g, ' ').trim();
  title = title.replace(ENDINGS, '').trim();
  title = title.replace(TAIL_WORDS, '').trim();
  title = title.replace(ENDINGS, '').trim();

  return {
    title: title || DEFAULT_TITLE,
    days,
    repeat: repeat && days.length > 0,
    start: s == null ? null : hm(s),
    end: e == null ? null : hm(e),
  };
}
