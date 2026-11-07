import Button from '@/components/common/Button.jsx';

// 단원 표의 편집 줄 (S3-2 · S4 공통): 이름 · 시작/끝 페이지 · 순서 · 삭제
export function UnitEditRow({ unit, index, count, onChange, onMove, onDelete, onDone }) {
  const pages = unit.from && unit.to ? unit.to - unit.from + 1 : null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-sm bg-surface-2 p-2">
      <input
        aria-label={`${index + 1}번째 단원 이름`}
        className="min-w-[160px] flex-1 rounded-sm border border-line bg-surface px-2.5 py-1.5"
        value={unit.title}
        onChange={(e) => onChange({ title: e.target.value })}
      />
      <span className="num text-sm">p.</span>
      <input
        aria-label="시작 페이지"
        type="number"
        min={1}
        className="num w-20 rounded-sm border border-line bg-surface px-2 py-1.5"
        value={unit.from ?? ''}
        onChange={(e) => onChange({ from: e.target.value === '' ? null : Number(e.target.value) })}
      />
      <span>–</span>
      <input
        aria-label="끝 페이지"
        type="number"
        min={1}
        className="num w-20 rounded-sm border border-line bg-surface px-2 py-1.5"
        value={unit.to ?? ''}
        onChange={(e) => onChange({ to: e.target.value === '' ? null : Number(e.target.value) })}
      />
      {pages != null && pages > 0 && <span className="num text-xs text-fg-2">{pages}p</span>}
      <Button size="sm" aria-label="위로" disabled={index === 0} onClick={() => onMove(-1)}>
        ↑
      </Button>
      <Button
        size="sm"
        aria-label="아래로"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
      >
        ↓
      </Button>
      <Button size="sm" onClick={onDelete}>
        삭제
      </Button>
      {onDone && (
        <Button size="sm" variant="primary" onClick={onDone}>
          완료
        </Button>
      )}
    </div>
  );
}
