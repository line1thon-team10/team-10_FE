type Props = {
  subjects: { id: string; name: string }[];
  activeId: string;
  onChange: (id: string) => void;
};

/** 과목 탭: 홈의 보기 전환과 같은 둥근 세그먼트 */
export default function SubjectTabs({ subjects, activeId, onChange }: Props) {
  return (
    <div
      className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[var(--hp-line-strong)] p-1"
      role="tablist"
      aria-label="과목 선택"
    >
      {subjects.map((subject) => {
        const active = subject.id === activeId;
        return (
          <button
            key={subject.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(subject.id)}
            className={`cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
              active
                ? "bg-[var(--hp-solid)] text-[var(--hp-solid-ink)]"
                : "text-[var(--hp-muted)] hover:text-[var(--hp-ink)]"
            }`}
          >
            {subject.name}
          </button>
        );
      })}
    </div>
  );
}