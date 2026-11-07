// 오늘 계획 진행률. mark: 퀴즈가 열리는 기준선(%)
export default function ProgressBar({ value, mark, label }) {
  return (
    <div
      className="relative h-2 rounded-full bg-surface-2"
      role="img"
      aria-label={label ?? `${value}%`}
    >
      <i className="absolute inset-y-0 left-0 rounded-full bg-fg" style={{ width: `${value}%` }} />
      {mark != null && (
        <span className="absolute -inset-y-1 w-0.5 bg-fg-2" style={{ left: `${mark}%` }} />
      )}
    </div>
  );
}
