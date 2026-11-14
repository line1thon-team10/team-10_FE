// S7 공부 기록 (팝업) — 신민종
// 범위 입력과 종료 sessionId를 보존하고 집계는 저장 후 서버에서 다시 받아요.
import { Timer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import BookToast from '@/components/home/BookToast.jsx';
import { RECORD_RESULT } from '@/config/labels.js';
import { useFixRecord, useInterpret, useRecord, useToday } from '@/hooks/useToday.js';
import {
  initialRangeInput,
  pagedRanges,
  rangeInputLabel,
  recordSelection,
  taskRangeLabel,
} from '@/pages/study/recordInput.js';
import { useUiStore } from '@/stores/uiStore.js';

const RESULTS = ['done', 'partial', 'none'];

function RecordForm({ task, subject, sessionId, sessionMinutes, onClose }) {
  const record = useRecord();
  const fix = useFixRecord();
  const interpret = useInterpret();
  const openModal = useUiStore((s) => s.openModal);
  const setDroppedTaskId = useUiStore((s) => s.setDroppedTaskId);
  const ranges = pagedRanges(task);
  // 첫 응답이 준비된 뒤 한 번 초기화해요. 재조회나 저장 실패가 입력을 덮어쓰지 않아요.
  const [fixing] = useState(() => task.status !== 'todo' && task.pages > 0);
  const [result, setResult] = useState(null);
  const [values, setValues] = useState(() => initialRangeInput(task));
  const [voice, setVoice] = useState('');
  const selection = recordSelection(task, values, result, fixing);
  const pending = record.isPending || fix.isPending;
  const failure = record.error ?? fix.error;
  const measured = sessionId ? sessionMinutes : task.measuredMinutes;
  const close = () => {
    if (!pending) onClose();
  };

  const onSave = () => {
    if (!selection.valid || pending) return;
    const input = { taskId: task.id, ...selection.completion, sessionId };
    if (fixing) {
      fix.mutate(input, {
        onSuccess: (saved) => {
          onClose();
          toast(`기록을 고쳤어요 · 오늘 ${saved.rate}%`);
        },
        onError: (error) => toast.error(`고치지 못했어요. ${error.message}`),
      });
      return;
    }
    record.mutate(
      { ...input, result },
      {
        onSuccess: ({ event }) => {
          onClose();
          if (result !== 'none') setDroppedTaskId(task.id);
          if (event?.type === 'box') openModal('P1', { event, taskId: task.id });
          else if (event?.type === 'toast')
            toast.custom(() => <BookToast message={event.message} detail={event.detail} />, {
              duration: 2000,
            });
          else toast('공부 기록을 저장했어요');
        },
        onError: (error) => toast.error(`기록하지 못했어요. ${error.message}`),
      },
    );
  };

  const acceptInterpret = () => {
    const candidate = interpret.data;
    let selected = candidate.completedRanges;
    if (!selected && ranges.length === 1 && Number.isInteger(candidate.to))
      selected = [{ rangeId: ranges[0].id, toPage: candidate.to }];
    if (!selected || selected.some((item) => !ranges.some((range) => range.id === item.rangeId))) {
      toast.error('해석한 범위를 확인하지 못했어요. 범위별 페이지를 직접 적어 주세요.');
      return;
    }
    const next = Object.fromEntries(ranges.map((range) => [range.id, '']));
    for (const item of selected) next[item.rangeId] = String(item.toPage);
    const nextResult = ranges.every((range) => Number(next[range.id]) === range.to)
      ? 'done'
      : selected.length
        ? 'partial'
        : 'none';
    if (!recordSelection(task, next, nextResult).valid) {
      toast.error('해석한 페이지가 학습 범위와 맞지 않아요. 입력을 확인해 주세요.');
      return;
    }
    setValues(next);
    setResult(nextResult);
  };

  return (
    <Modal
      title={fixing ? '페이지 고치기' : '공부 기록'}
      onClose={close}
      footer={
        <>
          <Button disabled={pending} onClick={close}>
            취소
          </Button>
          <Button variant="primary" disabled={!selection.valid || pending} onClick={onSave}>
            {pending ? '저장하는 중…' : fixing ? '고치기' : '기록하기'}
          </Button>
        </>
      }
    >
      <p className="-mt-2 text-[12.5px] text-fg-2">
        <span className="font-semibold text-fg-soft">{subject?.name}</span> · {task.title} ·{' '}
        <span className="num">
          {taskRangeLabel(task)} · {task.pages}p
        </span>
        {fixing && (
          <span className="num">
            {' '}
            · 지금 {RECORD_RESULT[task.status]} ({task.donePages}p)
          </span>
        )}
      </p>
      {(sessionId || measured != null) && (
        <p>
          <span className="badge border-brand-line bg-brand-tint text-brand-deep">
            <Timer size={11} aria-hidden="true" />
            집중 모드 {measured ? `${measured}분` : '1분 미만'} 측정
          </span>
        </p>
      )}
      {!fixing && (
        <fieldset className="flex flex-col gap-2.5" disabled={pending}>
          <legend className="mb-2.5 text-[13px] font-semibold">어디까지 했어요?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {RESULTS.filter(
              (option) => option !== 'partial' || (task.pages > 0 && ranges.length > 0),
            ).map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] font-semibold transition-colors ${result === option ? 'border-brand-line bg-brand-tint' : 'border-line-2 hover:border-fg-2'}`}
              >
                <input
                  type="radio"
                  name="record-result"
                  value={option}
                  checked={result === option}
                  onChange={() => setResult(option)}
                  className="accent-brand"
                />
                {RECORD_RESULT[option]}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {(fixing || result === 'partial') && (
        <fieldset
          className="flex flex-col gap-3 rounded-xl border border-line bg-white/[0.02] px-3.5 py-3"
          disabled={pending}
        >
          <legend className="text-[11.5px] font-medium text-fg-2">범위별 끝낸 페이지</legend>
          <p className="text-[11.5px] text-fg-2">
            각 범위의 처음부터 어디까지 했는지 적어 주세요. 비운 범위는 미완료로 저장해요.
          </p>
          {ranges.map((range, index) => (
            <div
              key={range.id}
              className="flex flex-wrap items-center justify-between gap-2 text-[13px]"
            >
              <label htmlFor={`record-to-${range.id}`} className="num text-fg-soft">
                {rangeInputLabel(task, range, index)}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`record-to-${range.id}`}
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min={range.from}
                  max={range.to}
                  value={values[range.id] ?? ''}
                  onChange={(event) =>
                    setValues((previous) => ({ ...previous, [range.id]: event.target.value }))
                  }
                  placeholder="미완료"
                  className="num w-24 rounded-lg border border-line-2 bg-bg px-3 py-1.5 text-center"
                />
                <span className="text-fg-soft">까지</span>
              </div>
            </div>
          ))}
          {selection.error && (
            <p role="status" className="text-xs text-st-risk">
              {selection.error}
            </p>
          )}
        </fieldset>
      )}
      {!fixing && ranges.length > 0 && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="record-voice"
            className="flex items-center gap-1.5 text-[11.5px] font-medium text-fg-2"
          >
            <span className="ai-chip">AI</span>또는 말로 입력
          </label>
          <div className="flex gap-2">
            <input
              id="record-voice"
              className="min-w-0 flex-1 rounded-full border border-line-2 bg-bg px-3.5 py-2"
              placeholder="예: 로지스틱 회귀까지 했어"
              value={voice}
              disabled={pending}
              onChange={(event) => setVoice(event.target.value)}
              autoComplete="off"
            />
            <Button
              size="sm"
              disabled={!voice.trim() || interpret.isPending || pending}
              onClick={() =>
                interpret.mutate(
                  { taskId: task.id, text: voice },
                  { onError: (error) => toast.error(error.message) },
                )
              }
            >
              {interpret.isPending ? '정리하는 중…' : '페이지로 바꾸기'}
            </Button>
          </div>
          {interpret.data && (
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-brand-deep">
              <span>→ {interpret.data.label}로 이해했어요. 맞나요?</span>
              <Button size="sm" disabled={pending} onClick={acceptInterpret}>
                맞아요
              </Button>
            </div>
          )}
        </div>
      )}
      {failure && (
        <p role="alert" className="text-[12.5px] text-st-risk">
          {failure.message} 입력과 측정 시간은 유지했어요. 확인 후 다시 저장해 주세요.
        </p>
      )}
      <p className="text-[11.5px] text-fg-2">
        저장하면 서버가 계산한 완료 페이지와 오늘 진행률을 홈에 반영해요. 기록한 뒤에도 페이지를
        고칠 수 있어요.
      </p>
    </Modal>
  );
}

export default function S7Record({ taskId, sessionId, sessionMinutes, onClose }) {
  const { data: today, isPending, isError, error, refetch } = useToday();
  const task = taskId
    ? today?.tasks.find((item) => item.id === taskId)
    : today?.tasks.find((item) => item.status !== 'done');
  if (!task)
    return (
      <Modal title="공부 기록" onClose={onClose}>
        <p role="status">
          {isPending
            ? '오늘 할 일을 불러오는 중이에요.'
            : isError
              ? error.message
              : '이 태스크를 찾지 못했어요. 오늘 할 일을 다시 확인해 주세요.'}
        </p>
        {!isPending && <Button onClick={() => refetch()}>다시 불러오기</Button>}
      </Modal>
    );
  return (
    <RecordForm
      key={task.id}
      task={task}
      subject={today.subjects.find((item) => item.id === task.subjectId)}
      sessionId={sessionId ?? task.pendingSessionId}
      sessionMinutes={sessionMinutes ?? task.pendingMinutes}
      onClose={onClose}
    />
  );
}
