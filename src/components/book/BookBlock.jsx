import { BLOCK_STATE } from '@/config/labels.js';
import { cx } from '@/lib/cx.js';

// 책 1권 = 태스크 1개 (BK-01). 가로로 눕힌 책 모양이에요 (11/7 결정, 재질은 디자인 hp-book).
// state: planned | doing | done | stable | shaky | risk — 색·패턴·움직임은 index.css의 .blk 규칙 (정의서 4-5)
// 책 위에 상태 글자를 직접 보여줘요 (G-1, 작은 책 blk-mini는 title만). 선반은 Shelf 컴포넌트가 따로 그려요
// tag: 책 위에 붙는 작은 글자 (예: 보충) · seed: 책 길이를 조금씩 다르게 해서 진짜 책 더미처럼 보이게 해요
const WIDTHS = [100, 93, 97, 90, 95, 88, 98, 92];
const OFFSETS = [0, 4, 1, 6, 2, 8, 0, 5];

export default function BookBlock({
  state,
  onClick,
  drop = false,
  className,
  label,
  tag,
  seed,
  selected,
}) {
  const text = label ?? BLOCK_STATE[state]?.label;
  const style =
    seed == null
      ? undefined
      : { width: `${WIDTHS[seed % 8]}%`, marginLeft: `${OFFSETS[seed % 8]}%` };
  const cls = cx('blk', drop && 'blk-drop', className);
  const inner = (
    <span className="blk-labels" aria-hidden="true">
      {tag && <span className="blk-tag">{tag}</span>}
      <span className="blk-text">{BLOCK_STATE[state]?.label}</span>
    </span>
  );
  if (onClick) {
    return (
      <button
        type="button"
        className={cls}
        data-state={state}
        aria-label={text}
        aria-pressed={selected}
        title={text}
        style={style}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }
  return (
    <div className={cls} data-state={state} title={text} style={style}>
      {inner}
    </div>
  );
}
