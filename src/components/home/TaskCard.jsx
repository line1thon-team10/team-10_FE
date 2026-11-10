import { Check, PencilLine, Play } from 'lucide-react';
import { Link } from 'react-router';
import { ROUTES } from '@/app/screens.js';
import Button from '@/components/common/Button.jsx';
import { RECORD_RESULT } from '@/config/labels.js';

// 오늘 할 일 한 줄 (HM-01, 디자인 TodayPanel): 과목 색 띠 · 범위 · 예상 시간 · AI 이유
// [시작] → 집중 모드(S12) · [기록하기] → S7 / 완료 배지 / 부분 완료면 [페이지 고치기]
export default function TaskCard({ task, subject, onRecord }) {
  const done = task.status === 'done';
  const partial = task.status === 'partial';
  return (
    <article
      className={`grid grid-cols-[4px_1fr_auto] items-center gap-3.5 overflow-hidden rounded-xl border border-line bg-white/[0.02] py-3 pr-3.5 transition-colors hover:border-line-2 ${done ? 'opacity-75' : ''}`}
    >
      <span className="self-stretch" style={{ background: subject.color }} aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[11.5px] font-semibold" style={{ color: subject.color }}>
            {subject.name}
          </span>
          <span className={`text-[13.5px] font-medium ${done ? 'text-fg-2 line-through' : ''}`}>
            {task.title}
          </span>
          {task.carried && <span className="badge">어제에서 이월</span>}
        </p>
        <p className="num flex flex-wrap gap-x-2 text-[11.5px] text-fg-2">
          <span>
            p.{task.from}–{task.to}
          </span>
          <span aria-hidden="true">·</span>
          <span>{task.pages}p</span>
          <span aria-hidden="true">·</span>
          <span>예상 {task.minutes}분</span>
          {partial && <span className="text-brand-deep">· p.{task.doneTo}까지 했어요</span>}
          {task.status === 'none' && <span className="text-fg">· 못 했어요</span>}
          {task.measuredMinutes != null && <span>· 집중 {task.measuredMinutes}분</span>}
        </p>
        {task.reason && !task.carried && (
          <p className="flex items-center gap-1.5 text-[11.5px] text-fg-soft">
            <span className="ai-chip">AI</span>
            {task.reason}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {done || partial ? (
          <span
            className={`badge ${done ? 'border-st-stable/50 text-st-stable' : 'border-brand-line text-brand-deep'}`}
          >
            {done && <Check size={12} aria-hidden="true" />}
            {RECORD_RESULT[task.status]}
          </span>
        ) : null}
        {partial && (
          <Button size="sm" onClick={() => onRecord(task.id)}>
            <PencilLine size={12} aria-hidden="true" />
            페이지 고치기
          </Button>
        )}
        {!done && !partial && task.pendingMinutes != null && (
          <span className="badge border-brand-line text-brand-deep">
            기록 전 · {task.pendingMinutes ? `${task.pendingMinutes}분` : '1분 미만'}
          </span>
        )}
        {!done && !partial && (
          <>
            <Button size="sm" onClick={() => onRecord(task.id)}>
              <PencilLine size={12} aria-hidden="true" />
              기록하기
            </Button>
            <Link className="btn btn-sm btn-primary" to={`${ROUTES.study}?task=${task.id}`}>
              <Play size={11} fill="currentColor" aria-hidden="true" />
              시작
            </Link>
          </>
        )}
      </div>
    </article>
  );
}
