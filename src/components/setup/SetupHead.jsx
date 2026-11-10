// 온보딩 화면 머리: 제목 · 설명 + 오른쪽 이전/다음 버튼 (디자인 plan Step* 머리 모양)
export default function SetupHead({ title, desc, children }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-snug">{title}</h1>
        {desc && <p className="mt-2 max-w-[640px] text-[13px] text-fg-2">{desc}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
