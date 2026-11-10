import { cx } from '@/lib/cx.js';

// 나무 선반 (디자인 hp-plank): 책 더미를 아래에서 받치는 판자. thin은 홈 최근 7일처럼 작은 더미용
export default function Shelf({ thin = false, className, children, ...props }) {
  return (
    <div className={cx('flex flex-col', className)} {...props}>
      {children}
      <div className={cx('shelf-plank', thin && 'shelf-plank-thin')} aria-hidden="true" />
    </div>
  );
}
