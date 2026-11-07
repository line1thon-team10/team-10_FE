// className 합치기: cx('btn', isOn && 'btn-primary')
export const cx = (...parts) => parts.filter(Boolean).join(' ');
