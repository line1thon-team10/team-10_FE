// S14 과목·계획 관리 — 신민종
// 무엇을 바꾸든 바뀌는 날을 먼저 보여주고, 확인해야 적용돼요 (PL-11 · 4-12). 재배분 계산은 서버 (mock은 logic.js)
// 모양: 디자인 manage page · SubjectCard · SubjectEditDialog · ManagePreview · TodayPlanCard
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import Modal from '@/components/common/Modal.jsx';
import ProgressBar from '@/components/common/ProgressBar.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import EmptyTimeDialog from '@/components/plan/EmptyTimeDialog.jsx';
import { fmtShort } from '@/config/date.js';
import {
  useApplySubjectEdit,
  useApplySubjectRemove,
  useApplyTodayPlan,
  usePreviewSubjectEdit,
  usePreviewSubjectRemove,
  usePreviewTodayPlan,
  useSubjects,
} from '@/hooks/useManage.js';
import { useToday } from '@/hooks/useToday.js';

const GOAL_OPTIONS = ['A+', 'A0', 'B+', 'B0', 'C+', '통과']; // 디자인 SummaryPanel 목록

// 시험일 · 목표 바꾸기 (디자인 SubjectEditDialog)
function EditDialog({ subject, kind, busy, onPreview, onClose }) {
  const [examDate, setExamDate] = useState(subject.examDate);
  const [goal, setGoal] = useState(subject.goal);
  const [target, setTarget] = useState(subject.target ?? '');
  const ok =
    kind === 'exam' ? examDate && examDate !== subject.examDate : goal && Number(target) > 0;
  return (
    <Modal
      title={`${subject.name} ${kind === 'exam' ? '시험일 바꾸기' : '목표 바꾸기'}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>취소</Button>
          <Button
            variant="primary"
            disabled={!ok || busy}
            onClick={() =>
              onPreview(kind === 'exam' ? { examDate } : { goal, target: Number(target) })
            }
          >
            바뀌는 것 보기
          </Button>
        </>
      }
    >
      {kind === 'exam' ? (
        <label className="flex flex-col gap-1.5 text-[13px]">
          새 시험일
          <input
            type="date"
            className="num self-start rounded-lg border border-line-2 bg-bg px-2.5 py-1.5"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </label>
      ) : (
        <div className="flex flex-wrap gap-3 text-[13px]">
          <label className="flex flex-col gap-1.5">
            목표 학점
            <select
              className="rounded-lg border border-line-2 bg-bg px-2.5 py-1.5"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              {[...new Set([subject.goal, ...GOAL_OPTIONS])].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            목표 점수 (커트라인)
            <input
              type="number"
              min={1}
              max={100}
              className="num w-24 rounded-lg border border-line-2 bg-bg px-2.5 py-1.5"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </label>
        </div>
      )}
      <p className="text-[11.5px] text-fg-2">
        적용하기 전에 바뀌는 날을 오른쪽에서 먼저 보여드려요.
      </p>
    </Modal>
  );
}

// 바뀌는 것 미리보기 (디자인 ManagePreview): 지금 → 바뀐 값 + 바뀌는 날 → [취소] [적용]
function PreviewPanel({ preview, busy, onCancel, onApply }) {
  if (!preview)
    return (
      <Card className="flex flex-col gap-2">
        <h2 className="text-[16px]">바뀌는 것 미리보기</h2>
        <p className="text-[12.5px] text-fg-3">
          무엇을 바꾸면 여기에 지금 → 바뀐 값과 바뀌는 날이 나와요.
        </p>
      </Card>
    );
  return (
    <Card className="flex flex-col gap-3 border-brand-line" aria-live="polite">
      <h2 className="flex items-center gap-2 text-[16px]">
        바뀌는 것 미리보기 <MockBadge />
      </h2>
      {preview.title && <p className="text-[12.5px] text-fg-2">{preview.title}</p>}
      <ul className="flex flex-col gap-1.5">
        {preview.changes.map((c) => (
          <li
            key={c.label}
            className="num grid grid-cols-[88px_1fr] items-baseline gap-2 text-[12.5px]"
          >
            <span className="text-fg-2">{c.label}</span>
            <span>
              <span className="text-fg-2 line-through">{c.before}</span>
              <ArrowRight size={11} className="mx-1 inline text-fg-2" aria-hidden="true" />
              <b className="font-semibold">{c.after}</b>
            </span>
          </li>
        ))}
      </ul>
      {preview.days.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-xl border border-dashed border-line-2 px-3 py-2 text-[12px] text-fg-soft">
          {preview.days.map((d, i) => (
            <li key={i}>{d.text}</li>
          ))}
        </ul>
      )}
      <p className="text-[12px] text-fg-2">{preview.note}</p>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>취소</Button>
        <Button variant="primary" disabled={busy} onClick={onApply}>
          {busy ? '적용하는 중…' : '적용'}
        </Button>
      </div>
    </Card>
  );
}

function SubjectCard({ s, onEdit, onRemove, onRange }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[17px]">
          <span
            className="h-3.5 w-1 rounded-full"
            style={{ background: s.color }}
            aria-hidden="true"
          />
          {s.name}
        </h2>
        <span className="badge num">
          시험 {fmtShort(s.examDate)} · <b className="text-brand-deep">D-{s.dday}</b>
        </span>
      </div>
      <dl className="num grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12.5px]">
        <div>
          <dt className="text-[11px] text-fg-2">목표 (커트라인)</dt>
          <dd>
            {s.goal} ({s.target}점)
          </dd>
        </div>
        <div>
          <dt className="text-[11px] text-fg-2">범위</dt>
          <dd>{s.range ? `p.${s.range.from}–${s.range.to} · ${s.range.pages}쪽` : '-'}</dd>
        </div>
      </dl>
      {s.progress && (
        <div className="flex flex-col gap-1">
          <span className="num text-[11.5px] text-fg-2">
            진도 {s.progress.studied}/{s.progress.total}p · {s.progress.rate}%
          </span>
          <ProgressBar value={s.progress.rate} label={`진도 ${s.progress.rate}%`} />
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" onClick={onRange}>
          범위 고치기
        </Button>
        <Button size="sm" onClick={() => onEdit('exam')}>
          시험일 바꾸기
        </Button>
        <Button size="sm" onClick={() => onEdit('goal')}>
          목표 바꾸기
        </Button>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          과목 빼기
        </Button>
      </div>
    </Card>
  );
}

// 오늘 계획 카드 (PL-10, Could · 디자인 TodayPlanCard)
function TodayPlanCard({ onPreview, busy }) {
  const { data: today } = useToday();
  const todo = today?.tasks.filter((t) => t.status === 'todo') ?? [];
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-[16px]">오늘 계획</h2>
      <p className="num text-[12.5px] text-fg-2">
        오늘 남은 태스크 {todo.length}개 · {todo.reduce((n, t) => n + t.minutes, 0)}분
      </p>
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          disabled={busy || !todo.length}
          onClick={() => onPreview({ action: 'more30' })}
        >
          30분 더 하기
        </Button>
        <Button
          size="sm"
          disabled={busy || !todo.length}
          onClick={() => onPreview({ action: 'rest' })}
        >
          오늘 쉬기
        </Button>
        {/* TODO(확인필요): [기획 확인] 계획 다시 만들기 (11/10 결정 A: 막아 둠) */}
        <Button size="sm" disabled title="계획 다시 만들기는 기획 확인 중이에요">
          계획 다시 만들기
        </Button>
      </div>
      {todo.length > 0 && (
        <ul className="flex flex-col gap-1">
          {todo.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="min-w-0 truncate">{t.title}</span>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => onPreview({ action: 'postpone', taskId: t.id })}
              >
                미루기
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default function S14Manage() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useSubjects();
  const previewEdit = usePreviewSubjectEdit();
  const previewRemove = usePreviewSubjectRemove();
  const previewToday = usePreviewTodayPlan();
  const applyEdit = useApplySubjectEdit();
  const applyRemove = useApplySubjectRemove();
  const applyToday = useApplyTodayPlan();
  const [editing, setEditing] = useState(null); // { subject, kind }
  const [pending, setPending] = useState(null); // { kind, id, action, preview }
  const [empty, setEmpty] = useState(null); // 과목 빼기 → P5

  if (isPending) return <LoadingState title="과목을 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const fail = { onError: (e) => toast.error(e.message) };
  const active = data.subjects.filter((x) => !x.removed && !x.archived);
  const archived = data.subjects.filter((x) => x.removed || x.archived);
  const busy = applyEdit.isPending || applyRemove.isPending || applyToday.isPending;

  const showEdit = (patch) =>
    previewEdit.mutate(
      { id: editing.subject.id, ...patch },
      {
        onSuccess: (preview) => {
          setPending({ kind: 'edit', id: editing.subject.id, preview });
          setEditing(null);
        },
        ...fail,
      },
    );
  const showRemove = (s) =>
    previewRemove.mutate(s.id, {
      onSuccess: (preview) => setPending({ kind: 'remove', id: s.id, preview }),
      ...fail,
    });
  const showToday = (req) =>
    previewToday.mutate(req, {
      onSuccess: (preview) => setPending({ kind: 'today', action: req.action, preview }),
      ...fail,
    });
  const onApply = () => {
    const done = () => setPending(null);
    if (pending.kind === 'edit')
      applyEdit.mutate(pending.id, { onSuccess: () => (done(), toast('바꿨어요')), ...fail });
    if (pending.kind === 'remove')
      applyRemove.mutate(pending.id, {
        onSuccess: (p5) => {
          done();
          toast('과목을 계획에서 뺐어요');
          if (p5) setEmpty(p5);
        },
        ...fail,
      });
    if (pending.kind === 'today')
      applyToday.mutate(pending.action, {
        onSuccess: () => (done(), toast('오늘 계획을 바꿨어요')),
        ...fail,
      });
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label text-brand-deep">과목·계획 관리</p>
          <h1 className="mt-1 text-[28px]">과목·계획 관리</h1>
          <p className="mt-1 text-[13px] text-fg-2">
            무엇을 바꾸든 바뀌는 날을 먼저 보여주고, 확인해야 적용돼요. 기록·점수·쌓인 책은
            그대로예요.
          </p>
        </div>
        {/* TODO(확인필요): [기획 확인] 과목 추가 = S1 · S3 · S4 '추가 모드' (11/10 결정 A: 막아 둠) */}
        <Button disabled title="과목 추가는 준비 중이에요">
          + 과목 추가
        </Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-2">
            {active.map((s) => (
              <SubjectCard
                key={s.id}
                s={s}
                onEdit={(kind) => setEditing({ subject: s, kind })}
                onRemove={() => showRemove(s)}
                onRange={() => navigate(`${ROUTES.s4}?subject=${s.id}&from=manage`)}
              />
            ))}
          </div>
          <p className="text-[12px] text-fg-2">
            시험이 끝난 과목은 자동으로 보관돼요. 보관한 과목의 기록과 쌓인 책은 그대로 남아요.
            {archived.length > 0 && ` 보관: ${archived.map((x) => x.name).join(' · ')}`}
          </p>
        </div>
        <aside className="flex flex-col gap-4">
          <PreviewPanel
            preview={pending?.preview}
            busy={busy}
            onCancel={() => setPending(null)}
            onApply={onApply}
          />
          <TodayPlanCard onPreview={showToday} busy={previewToday.isPending} />
        </aside>
      </div>
      {editing && (
        <EditDialog
          subject={editing.subject}
          kind={editing.kind}
          busy={previewEdit.isPending}
          onPreview={showEdit}
          onClose={() => setEditing(null)}
        />
      )}
      {empty && <EmptyTimeDialog data={empty} onClose={() => setEmpty(null)} />}
    </>
  );
}
