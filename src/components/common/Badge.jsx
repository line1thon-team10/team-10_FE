import { cx } from '@/lib/cx.js';

// tone: default | strong | mock
export default function Badge({ tone = 'default', className, children, ...props }) {
  return (
    <span
      className={cx(
        'badge',
        tone === 'strong' && 'badge-strong',
        tone === 'mock' && 'badge-mock',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export const MockBadge = () => (
  <Badge tone="mock" title="가짜 데이터예요">
    MOCK
  </Badge>
);
