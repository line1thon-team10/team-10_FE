import { cx } from '@/lib/cx.js';

export default function Button({
  variant = 'secondary',
  size,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cx(
        'btn',
        variant === 'primary' && 'btn-primary',
        variant === 'ghost' && 'btn-ghost',
        size === 'sm' && 'btn-sm',
        className,
      )}
      {...props}
    />
  );
}
