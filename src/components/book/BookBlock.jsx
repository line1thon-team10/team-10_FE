import { BLOCK_STATE } from '@/config/labels.js';
import { cx } from '@/lib/cx.js';

// 블록 1개 = 태스크 1개 (BK-01). state: planned | doing | done | stable | shaky | risk
// 누를 수 있으면 button, 아니면 div. 책 모양(BK-06)은 S9 구성 확정 후 이 컴포넌트 안에서만 바꿔요.
export default function BookBlock({ state, onClick, drop = false, className, label }) {
  const text = label ?? BLOCK_STATE[state]?.label;
  if (onClick) {
    return (
      <button
        type="button"
        className={cx('blk', drop && 'blk-drop', className)}
        data-state={state}
        aria-label={text}
        title={text}
        onClick={onClick}
      />
    );
  }
  return (
    <div className={cx('blk', drop && 'blk-drop', className)} data-state={state} title={text} />
  );
}
