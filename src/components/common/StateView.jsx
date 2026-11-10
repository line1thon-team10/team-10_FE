import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react';

// 불러오는 중 · 오류 · 빈 화면 공통 상태
export function LoadingState({ title = '불러오는 중이에요' }) {
  return (
    <div className="card flex items-center gap-3" role="status">
      <Loader2
        size={16}
        className="animate-spin text-brand-deep motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span className="text-fg-2">{title}</span>
    </div>
  );
}

export function ErrorState({ title = '불러오지 못했어요', description, onRetry }) {
  return (
    <div className="card flex flex-col gap-2" role="alert">
      <strong className="flex items-center gap-1.5">
        <AlertTriangle size={15} className="text-st-risk" aria-hidden="true" />
        {title}
      </strong>
      {description && <p className="text-sm text-fg-2">{description}</p>}
      {onRetry && (
        <button type="button" className="btn btn-sm self-start" onClick={onRetry}>
          <RotateCcw size={12} aria-hidden="true" />
          다시 시도
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col gap-2">
      <strong>{title}</strong>
      {description && <p className="text-sm text-fg-2">{description}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
