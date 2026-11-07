import AiBox from '@/components/common/AiBox.jsx';
import Button from '@/components/common/Button.jsx';

// 오늘 할 일 한 줄 (HM-01): 과목 색 띠 · 과목·태스크 · 범위·시간 · 배치 이유 · 기록 버튼
export default function TaskCard({ task, subject, onRecord }) {
  const finished = task.status === 'done';
  return (
    <article className="card grid grid-cols-[4px_1fr_auto] items-center gap-3 py-3 pr-4 pl-0">
      <span
        className="self-stretch rounded-l-md"
        style={{ background: subject.color }}
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="font-semibold">
          <span style={{ color: subject.color }}>{subject.name}</span> · {task.title}
        </h3>
        <p className="num text-[12.5px] text-fg-2">
          p.{task.from}–{task.to} · {task.minutes}분
          {task.status === 'partial' && (
            <span className="ml-2 text-fg">· p.{task.doneTo}까지 했어요</span>
          )}
          {task.status === 'none' && <span className="ml-2 text-fg">· 못 했어요</span>}
        </p>
        {task.reason && (
          <p className="flex items-center gap-1.5 text-xs text-fg-2">
            <span className="ai-chip">AI</span>
            {task.reason}
          </p>
        )}
      </div>
      {finished ? (
        <span className="badge">완료</span>
      ) : (
        <Button variant="primary" size="sm" onClick={() => onRecord(task.id)}>
          기록
        </Button>
      )}
    </article>
  );
}

export function TaskCardSkeleton() {
  return <AiBox>할 일을 불러오는 중이에요</AiBox>;
}
