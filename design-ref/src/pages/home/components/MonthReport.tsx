import { monthGrades, monthReportStats, monthSubjectRatio } from "@/mocks/monthlyReport";

type Props = {
  monthLabel: string;
  monthRange: string;
  onBack: () => void;
};

const LEVEL_CLASS: Record<string, string> = {
  안정: "border-[rgba(89,160,111,0.45)] bg-[rgba(89,160,111,0.14)] text-[#8ecfa4]",
  흔들림: "border-[rgba(211,138,74,0.45)] bg-[rgba(211,138,74,0.14)] text-[#e6b184]",
  "붕괴 위기": "border-[rgba(208,90,68,0.45)] bg-[rgba(208,90,68,0.14)] text-[#eda79a]",
};

export default function MonthReport({ monthLabel, monthRange, onBack }: Props) {
  return (
    <section className="hp-rise">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-[var(--hp-brand-deep)]">
            월간 리포트 · {monthRange}
          </p>
          <h2 className="mt-2.5 text-[26px] leading-tight text-[var(--hp-ink)] md:text-[32px]">
            {monthLabel} 리포트
          </h2>
          <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-[var(--hp-muted)]">
            11/3 계획 시작 ~ 11/9 오늘 기준 · 숫자만 보여주고 문장으로 평가하지 않아요
          </p>
        </div>
        <button type="button" onClick={onBack} className="hp-report-back shrink-0">
          <i className="ri-arrow-left-line text-[13px] leading-none" />
          책장으로
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {monthReportStats.map((stat) => (
          <div
            key={stat.id}
            className="flex min-w-0 flex-col justify-between rounded-xl border border-[var(--hp-line)] bg-[var(--hp-card)] px-4 py-4"
          >
            <p className="text-[11px] font-medium text-[var(--hp-muted)]">{stat.label}</p>
            <p className="hp-display mt-2 text-[22px] leading-none text-[var(--hp-ink)]">{stat.value}</p>
            <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--hp-muted)]">{stat.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)]">
        <section className="rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-5">
          <h3 className="text-[13.5px] font-semibold text-[var(--hp-ink)]">과목 비율 (새로 끝낸 범위)</h3>

          <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--hp-line)]">
            {monthSubjectRatio.map((item) => (
              <span
                key={item.id}
                className={`hp-swatch h-full ${item.tone}`}
                style={{ width: `${item.percent}%` }}
                aria-hidden="true"
              />
            ))}
          </div>

          <ul className="mt-4 flex flex-col gap-2.5">
            {monthSubjectRatio.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-[12px]">
                <span className={`hp-swatch h-2.5 w-2.5 flex-none ${item.tone}`} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-[var(--hp-ink-soft)]">{item.subject}</span>
                <span className="shrink-0 tabular-nums text-[var(--hp-muted)]">
                  {item.pages}p · {item.percent}%
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 border-t border-[var(--hp-line)] pt-3 text-[10.5px] leading-relaxed text-[var(--hp-muted)]">
            진도율과 같은 기준이라 보충·복습 페이지는 빼요
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-5">
          <h3 className="text-[13.5px] font-semibold text-[var(--hp-ink)]">단원 등급 (지금 · 퀴즈 본 단원만)</h3>

          <div className="mt-3 overflow-x-auto">
            <table className="hp-grade-table w-full min-w-[420px] border-collapse">
              <thead>
                <tr>
                  <th scope="col">과목</th>
                  <th scope="col">단원</th>
                  <th scope="col">등급 · 점수</th>
                  <th scope="col">변화</th>
                </tr>
              </thead>
              <tbody>
                {monthGrades.map((grade) => (
                  <tr key={grade.id}>
                    <td className="text-[var(--hp-ink-soft)]">{grade.subject}</td>
                    <td className="tabular-nums text-[var(--hp-ink-soft)]">{grade.unit}</td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[10.5px] font-semibold ${
                          LEVEL_CLASS[grade.level] ?? LEVEL_CLASS["안정"]
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                        {grade.level}
                      </span>
                      <span className="ml-2 tabular-nums text-[var(--hp-ink)]">{grade.score}</span>
                    </td>
                    <td className="tabular-nums text-[var(--hp-muted)]">{grade.change || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}