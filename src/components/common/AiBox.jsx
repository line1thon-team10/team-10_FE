import { Sparkles } from 'lucide-react';
import { cx } from '@/lib/cx.js';

// AI가 만든 내용은 점선 박스 + AI 칩으로 감싸요 (와이어프레임 공통 표기).
export default function AiBox({ label = 'AI', className, children }) {
  return (
    <div className={cx('ai-box', className)}>
      <span className="ai-chip">
        <Sparkles size={11} aria-hidden="true" />
        {label}
      </span>
      {children}
    </div>
  );
}
