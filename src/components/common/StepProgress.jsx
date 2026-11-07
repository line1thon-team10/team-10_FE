// 오래 걸리는 작업의 진행 단계 (NF-05): PDF 분석, 계획 생성, 퀴즈 생성, 분배안 계산
// steps: 문자열 배열, current: 진행 중인 단계 번호, failed: 실패한 단계 번호, done: 전부 완료
export default function StepProgress({ steps, current = 0, failed = null, done = false }) {
  return (
    <ol className="flex flex-col gap-2">
      {steps.map((name, i) => {
        const state =
          done || i < current ? 'done' : i === failed ? 'fail' : i === current ? 'now' : 'wait';
        return (
          <li
            key={name}
            className="grid grid-cols-[22px_1fr_auto] items-center gap-2.5 text-[13.5px]"
            data-state={state}
          >
            <span
              aria-hidden="true"
              className={
                state === 'done'
                  ? 'grid h-[18px] w-[18px] place-items-center rounded-full bg-fg-2 text-[11px] text-surface'
                  : state === 'fail'
                    ? 'grid h-[18px] w-[18px] place-items-center rounded-full border-[1.5px] border-st-risk text-[11px] text-st-risk'
                    : state === 'now'
                      ? 'h-[18px] w-[18px] animate-[spin_0.9s_linear_infinite] rounded-full border-[1.5px] border-fg border-t-transparent motion-reduce:animate-none'
                      : 'h-[18px] w-[18px] rounded-full border-[1.5px] border-line'
              }
            >
              {state === 'done' ? '✓' : state === 'fail' ? '!' : ''}
            </span>
            <span
              className={
                state === 'wait'
                  ? 'text-fg-3'
                  : state === 'fail'
                    ? 'font-semibold text-st-risk'
                    : state === 'now'
                      ? 'font-semibold'
                      : 'text-fg-2'
              }
            >
              {name}
            </span>
            <span className="num text-xs text-fg-3">
              {state === 'done'
                ? '완료'
                : state === 'now'
                  ? '진행 중'
                  : state === 'fail'
                    ? '실패'
                    : ''}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
