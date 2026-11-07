// 불러오는 중 · 오류 · 빈 화면 공통 상태
export function LoadingState({ title = '불러오는 중이에요' }) {
  return (
    <div className="card flex items-center gap-3" role="status">
      <span
        className="h-4 w-4 animate-[spin_0.9s_linear_infinite] rounded-full border-2 border-fg border-t-transparent motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span className="text-fg-2">{title}</span>
    </div>
  );
}

export function ErrorState({ title = '불러오지 못했어요', description, onRetry }) {
  return (
    <div className="card flex flex-col gap-2" role="alert">
      <strong>{title}</strong>
      {description && <p className="text-sm text-fg-2">{description}</p>}
      {onRetry && (
        <button type="button" className="btn btn-sm self-start" onClick={onRetry}>
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
