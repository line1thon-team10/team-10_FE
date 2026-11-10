// 오늘 계획 진행률. mark: 퀴즈가 열리는 기준선(%)
export default function ProgressBar({ value, mark, label }) {
  return (
    <div
      className="relative h-2 rounded-full bg-white/[0.07]"
      role="img"
      aria-label={label ?? `${value}%`}
    >
      <i
        className="absolute inset-y-0 left-0 rounded-full bg-brand"
        style={{ width: `${value}%` }}
      />
      {mark != null && (
        <span
          className="absolute -inset-y-1 w-0.5 rounded bg-fg-soft"
          style={{ left: `${mark}%` }}
        />
      )}
    </div>
  );
}
