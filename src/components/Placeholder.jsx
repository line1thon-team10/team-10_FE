import { screenById } from '@/app/screens.js';
import Badge, { MockBadge } from '@/components/common/Badge.jsx';

// 자리 화면: 아직 만들지 않은 화면 대신 화면 ID와 만들 기능 목록을 보여줘요.
export default function Placeholder({ id, compact = false }) {
  const s = screenById(id);
  if (!s) return null;
  return (
    <section
      className={`card flex flex-col gap-3 border-dashed ${compact ? '' : 'min-h-[320px]'}`}
      aria-label={`${s.id} 자리 화면`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="num text-sm font-semibold text-fg-2">{s.id}</span>
        <h1 className={compact ? 'text-base font-bold' : 'text-xl font-bold'}>{s.name}</h1>
        <Badge tone={s.prio === 'Must' ? 'strong' : 'default'}>{s.prio}</Badge>
        <span className="ml-auto flex items-center gap-2">
          <span className="label">자리 화면</span>
          <MockBadge />
        </span>
      </div>
      <p className="text-sm text-fg-2">
        만들 날짜 <b className="num text-fg">{s.due}</b>
        {s.path && (
          <>
            {' '}
            · 주소 <code className="num text-fg">{s.path}</code>
          </>
        )}{' '}
        · 관련 기능 <span className="num">{s.features.join(', ')}</span>
      </p>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-[13.5px]">
        {s.todo.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
}
