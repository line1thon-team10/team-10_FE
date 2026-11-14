// S7 공부 기록 (팝업) — 신민종
// 이해도 자기평가는 넣지 않아요 (정의서 v2 · 11/10 해결).
// 집중 모드에서 왔거나 '기록 전 · N분'이 있으면 '집중 모드 N분 측정' 칩을 달고 sessionId를 같이 보내요 (HM-08)
// 기록한 태스크(부분 완료)를 다시 열면 '페이지 고치기' 모드예요 (PATCH /api/tasks/:id/record)
import { Timer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import BookToast from '@/components/home/BookToast.jsx';
import { RECORD_RESULT } from '@/config/labels.js';
import { useFixRecord, useInterpret, useRecord, useToday } from '@/hooks/useToday.js';
import { useUiStore } from '@/stores/uiStore.js';

const RESULTS = ['done', 'partial', 'none'];
const FIX_NOTE =
  "기록한 뒤에도 홈의 이 태스크에서 '페이지 고치기'로 끝낸 페이지를 바꿀 수 있어요. 바꾸면 내일로 넘어가는 분량과 오늘 진행률이 다시 계산돼요.";

export default function S7Record({ taskId, sessionId = null, sessionMinutes = null, onClose }) {
  const { data: today } = useToday();
  const record = useRecord();
  const fix = useFixRecord();
  const interpret = useInterpret();
  const openModal = useUiStore((s) => s.openModal);
  const setDroppedTaskId = useUiStore((s) => s.setDroppedTaskId);

  // taskId 없이 열리면(/dev) 아직 안 끝난 첫 태스크를 보여줘요
  const task = taskId
    ? today?.tasks.find((t) => t.id === taskId)
    : today?.tasks.find((t) => t.status !== 'done');
  const subject = today?.subjects.find((s) => s.id === task?.subjectId);
  const fixing = task?.status === 'partial' || task?.status === 'done';
  const [result, setResult] = useState(null);
  const [toPage, setToPage] = useState(() => (fixing ? String(task.doneTo ?? '') : ''));
  const [voice, setVoice] = useState('');

  if (!task) return null;

  const to = Number(toPage);
  const mode = fixing ? 'fix' : result;
  const pageValid =
    Number.isInteger(to) && to >= task.from && (fixing ? to <= task.to : to < task.to);
  const canSave = fixing
    ? pageValid && to !== task.doneTo
    : result === 'done' || result === 'none' || (result === 'partial' && pageValid);

  // 미리보기 계산이에요. 저장하면 서버가 계산한 값으로 화면이 바뀌어요.
  const { donePages, totalPages } = today.progress;
  const newDone =
    mode === 'done'
      ? task.pages
      : (mode === 'partial' || mode === 'fix') && pageValid
        ? to - task.from + 1
        : null;
  const previewRate =
    newDone == null
      ? null
      : Math.round(((donePages - task.donePages + newDone) / totalPages) * 100);
  const leftFrom = mode === 'done' ? null : pageValid ? to + 1 : null;

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

  const onSave = () => {
    if (fixing)
      return fix.mutate(
        { taskId: task.id, toPage: to },
        {
          onSuccess: (r) => {
            onClose();
            toast(`p.${r.doneTo}까지로 고쳤어요 · 오늘 ${r.rate}%`);
          },
          onError: (e) => toast.error(`고치지 못했어요. ${e.message}`),
        },
      );
    record.mutate(
      { taskId: task.id, result, toPage: result === 'partial' ? to : undefined, sessionId },
      {
        onSuccess: ({ event }) => {
          onClose();
          if (result !== 'none') setDroppedTaskId(task.id);
          if (event?.type === 'box') openModal('P1', { event, taskId: task.id });
          else if (event?.type === 'toast')
            toast.custom(() => <BookToast message={event.message} detail={event.detail} />, {
              duration: 2000,
            });
        },
        onError: (e) => toast.error(`기록하지 못했어요. ${e.message}`),
      },
    );
  };

  const pending = record.isPending || fix.isPending;

  return (
    <Modal
      title={fixing ? '페이지 고치기' : '공부 기록'}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>취소</Button>
          <Button variant="primary" disabled={!canSave || pending} onClick={onSave}>
            {pending ? '저장하는 중…' : fixing ? '고치기' : '기록하기'}
          </Button>
        </>
      }
    >
      <p className="-mt-2 text-[12.5px] text-fg-2">
        <span className="font-semibold text-fg-soft">{subject.name}</span> · {task.title} ·{' '}
        <span className="num">
          p.{task.from}–{task.to}
        </span>
        {fixing && (
          <span className="num">
            {' '}
            · 지금 {RECORD_RESULT[task.status]} (p.{task.doneTo}까지)
          </span>
        )}
      </p>

      {!fixing && sessionId && (
        <p>
          <span className="badge border-brand-line bg-brand-tint text-brand-deep">
            <Timer size={11} aria-hidden="true" />
            집중 모드 {sessionMinutes ? `${sessionMinutes}분` : '1분 미만'} 측정
          </span>
        </p>
      )}

      {!fixing && (
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-[13px] font-semibold">어디까지 했어요?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {RESULTS.map((r) => (
              <label
                key={r}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] font-semibold transition-colors ${result === r ? 'border-brand-line bg-brand-tint' : 'border-line-2 hover:border-fg-2'}`}
              >
                <input
                  type="radio"
                  name="record-result"
                  value={r}
                  checked={result === r}
                  onChange={() => setResult(r)}
                  className="accent-brand"
                />
                {RECORD_RESULT[r]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {(fixing || result === 'partial') && (
        <div className="rounded-xl border border-line bg-white/[0.02] px-3.5 py-3">
          <label htmlFor="record-to" className="text-[11.5px] font-medium text-fg-2">
            {fixing ? '끝낸 페이지를 다시 적어 주세요' : '어디까지 봤어요?'}
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="num text-fg-soft">p.{task.from} ~</span>
            <input
              id="record-to"
              type="number"
              inputMode="numeric"
              min={task.from}
              max={fixing ? task.to : task.to - 1}
              value={toPage}
              onChange={(e) => setToPage(e.target.value)}
              placeholder="끝낸 페이지"
              className="num w-24 rounded-lg border border-line-2 bg-bg px-3 py-1.5 text-center"
            />
            <span className="text-fg-soft">까지</span>
            {pageValid && (
              <span className="num ml-auto text-[11px] text-fg-2">
                {to - task.from + 1}p / 전체 {task.pages}p
              </span>
            )}
          </div>
          {toPage !== '' && !pageValid && (
            <p className="mt-1.5 text-xs text-st-risk">
              p.{task.from}부터 p.{fixing ? task.to : task.to - 1} 사이로 적어 주세요.
              {!fixing && " 끝까지 했으면 '완료'를 골라요."}
            </p>
          )}
        </div>
      )}

      {!fixing && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="record-voice"
            className="flex items-center gap-1.5 text-[11.5px] font-medium text-fg-2"
          >
            <span className="ai-chip">AI</span>
            또는 말로 입력
          </label>
          <div className="flex gap-2">
            <input
              id="record-voice"
              className="min-w-0 flex-1 rounded-full border border-line-2 bg-bg px-3.5 py-2"
              placeholder="예: 로지스틱 회귀까지 했고 k-최근접 이웃은 못 했어"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              autoComplete="off"
            />
            <Button size="sm" disabled={!voice.trim() || interpret.isPending} onClick={onInterpret}>
              {interpret.isPending ? '정리하는 중…' : '페이지로 바꾸기'}
            </Button>
          </div>
          {interpret.data && (
            <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-brand-deep">
              <span>
                → p.{interpret.data.from}–{interpret.data.to} ({interpret.data.label})로 이해했어요.
                맞나요?
              </span>
              <Button size="sm" onClick={acceptInterpret}>
                맞아요
              </Button>
            </div>
          )}
        </div>
      )}

      {mode && (
        <p
          className="rounded-xl border border-dashed border-line-2 px-3.5 py-2.5 text-[12.5px] text-fg-soft"
          aria-live="polite"
        >
          {mode === 'none'
            ? '못 한 분량은 자정에 다시 계산해서 다음 접속 때 알려 드려요.'
            : previewRate != null &&
              `${leftFrom && leftFrom <= task.to ? `남은 p.${leftFrom}–${task.to}는 내일 첫 태스크로 옮겨요. ` : '남는 페이지가 없어요. '}이 기록으로 오늘 계획이 ${previewRate}%가 돼요.`}
        </p>
      )}
      <p className="text-[11.5px] text-fg-2">{FIX_NOTE}</p>
    </Modal>
  );
}
