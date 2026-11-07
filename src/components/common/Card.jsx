import { cx } from '@/lib/cx.js';

export default function Card({ as: Tag = 'section', className, ...props }) {
  return <Tag className={cx('card', className)} {...props} />;
}
