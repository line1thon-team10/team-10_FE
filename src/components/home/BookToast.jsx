// P1-1 가벼운 알림 (BK-03, 디자인 BookToast): 평소 기록과 70%를 넘는 순간. toast.custom으로 2초 띄워요
export default function BookToast({ message, detail }) {
  return (
    <div
      className="flex w-[300px] items-center gap-3 rounded-xl border border-line-2 bg-bg-2 px-3.5 py-3 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.9)]"
      role="status"
    >
      <div className="flex w-12 flex-none flex-col-reverse gap-[2px]" aria-hidden="true">
        <span className="blk blk-mini" data-state="done" />
        <span className="blk blk-mini" data-state="done" />
        <span className="blk blk-mini blk-drop" data-state="done" />
      </div>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold">{message}</p>
        {detail && <p className="mt-0.5 text-[11px] text-fg-2">{detail}</p>}
      </div>
    </div>
  );
}
