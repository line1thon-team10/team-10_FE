// items: [{ value, label }]
export default function Tabs({ items, value, onChange, label }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex flex-wrap gap-1 self-start rounded-full border border-line bg-bg-2 p-1"
    >
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          aria-selected={it.value === value}
          onClick={() => onChange(it.value)}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${it.value === value ? 'bg-white/[0.08] text-fg' : 'text-fg-2 hover:text-fg'}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
