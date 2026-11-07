// items: [{ value, label }]
export default function Tabs({ items, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-1">
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          aria-selected={it.value === value}
          onClick={() => onChange(it.value)}
          className={`rounded-sm border px-3 py-1.5 text-[13px] ${it.value === value ? 'border-ink bg-ink text-ink-fg' : 'border-line bg-surface'}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
