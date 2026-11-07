// S7 공부 기록 (팝업) — 신민종
// TODO(확인필요): [기획 확인] 이해도 자기평가(1~5점) 칸은 데이터 세트에만 있어서 넣지 않았어요 (정의서 HM-02·03, 와이어프레임 S7 기준)
import { useState } from 'react';
import { toast } from 'sonner';
import AiBox from '@/components/common/AiBox.jsx';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import { RECORD_RESULT } from '@/config/labels.js';
import { useInterpret, useRecord, useToday } from '@/hooks/useToday.js';
import { useUiStore } from '@/stores/uiStore.js';

const RESULTS = ['done', 'partial', 'none'];

export default function S7Record({ taskId, onClose }) {
  const { data: today } = useToday();
  const record = useRecord();
  const interpret = useInterpret();
  const openModal = useUiStore((s) => s.openModal);
  const setDroppedTaskId = useUiStore((s) => s.setDroppedTaskId);

  // taskId 없이 열리면(/dev) 아직 안 끝난 첫 태스크를 보여줘요
  const task = taskId
    ? today?.tasks.find((t) => t.id === taskId)
    : today?.tasks.find((t) => t.status !== 'done');
  const subject = today?.subjects.find((s) => s.id === task?.subjectId);
  const [result, setResult] = useState(null);
  const [toPage, setToPage] = useState('');
  const [voice, setVoice] = useState('');

  if (!task) return null;

  const to = Number(toPage);
  const partialValid =
    result === 'partial' && Number.isInteger(to) && to >= task.from && to < task.to;
  const canSave = result === 'done' || result === 'none' || partialValid;

  // 미리보기 계산이에요. 저장하면 서버가 계산한 값으로 화면이 바뀌어요.
  const { donePages, totalPages } = today.progress;
  const addPages =
    result === 'done'
      ? task.pages - task.donePages
      : partialValid
        ? to - task.from + 1 - task.donePages
        : 0;
  const previewRate = Math.round(((donePages + Math.max(0, addPages)) / totalPages) * 100);

  const onInterpret = () =>
    interpret.mutate({ taskId: task.id, text: voice }, { onError: (e) => toast.error(e.message) });

  const acceptInterpret = () => {
    const r = interpret.data;
    if (r.to >= task.to) setResult('done');
    else {
      setResult('partial');
      setToPage(String(r.to));
    }
  };

  const onSave = () =>
    record.mutate(
      { taskId: task.id, result, toPage: result === 'partial' ? to : undefined },
      {
        onSuccess: ({ event }) => {
          onClose();
          if (result === 'none') return;
          setDroppedTaskId(task.id);
          if (event?.type === 'box') openModal('P1', { event, taskId: task.id });
          else if (event?.type === 'toast') toast(event.message);
        },
        onError: (e) => toast.error(`기록하지 못했어요. ${e.message}`),
      },
    );

  return (
    <Modal
      title="공부 기록"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>취소</Button>
          <Button variant="primary" disabled={!canSave || record.isPending} onClick={onSave}>
            {record.isPending ? '기록하는 중…' : '기록하기'}
          </Button>
        </>
      }
    >
      <p className="text-[13px] text-fg-2">
        <span className="font-semibold" style={{ color: subject.color }}>
          {subject.name}
        </span>{' '}
        · {task.title} ·{' '}
        <span className="num">
          p.{task.from}–{task.to}
        </span>
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">어디까지 했어요?</legend>
        <div className="flex flex-wrap gap-2">
          {RESULTS.map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 ${result === r ? 'border-ink bg-ink text-ink-fg' : 'border-line'}`}
            >
              <input
                type="radio"
                name="record-result"
                value={r}
                checked={result === r}
                onChange={() => setResult(r)}
                className="accent-current"
              />
              {RECORD_RESULT[r]}
            </label>
          ))}
        </div>
      </fieldset>

      {result === 'partial' && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="record-to" className="text-sm font-semibold">
            페이지
          </label>
          <span className="num">p.{task.from} ~</span>
          <input
            id="record-to"
            type="number"
            inputMode="numeric"
            min={task.from}
            max={task.to - 1}
            value={toPage}
            onChange={(e) => setToPage(e.target.value)}
            placeholder="끝낸 페이지"
            className="num w-28 rounded-sm border border-line px-3 py-2"
          />
          <span className="text-sm">까지</span>
          {toPage !== '' && !partialValid && (
            <span className="text-xs text-st-risk">
              p.{task.from}부터 p.{task.to - 1} 사이로 적어 주세요. 끝까지 했으면 '완료'를 골라요.
            </span>
          )}
        </div>
      )}

      <AiBox label="AI">
        <label htmlFor="record-voice" className="text-sm font-semibold">
          또는 말로 입력
        </label>
        <div className="flex gap-2">
          <input
            id="record-voice"
            className="min-w-0 flex-1 rounded-sm border border-line px-3 py-2"
            placeholder="예: BST 삭제까지 했고 AVL은 못 했어"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            autoComplete="off"
          />
          <Button size="sm" disabled={!voice.trim() || interpret.isPending} onClick={onInterpret}>
            {interpret.isPending ? '정리하는 중…' : '페이지로 바꾸기'}
          </Button>
        </div>
        {interpret.data && (
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span>
              → p.{interpret.data.from}–{interpret.data.to} ({interpret.data.label})로 이해했어요.
              맞나요?
            </span>
            <Button size="sm" onClick={acceptInterpret}>
              맞아요
            </Button>
          </div>
        )}
      </AiBox>

      {result && (
        <p className="text-[13px] text-fg-2" aria-live="polite">
          {result === 'partial' &&
            partialValid &&
            `남은 p.${to + 1}–${task.to}는 내일 첫 태스크로 옮겨요. `}
          {result === 'none'
            ? '못 한 분량은 자정에 다시 계산해서 다음 접속 때 알려 드려요.'
            : (result === 'done' || partialValid) &&
              `이 기록으로 오늘 계획이 ${previewRate}%가 돼요.`}
        </p>
      )}
    </Modal>
  );
}
