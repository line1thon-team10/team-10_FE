// P1 책 박스 팝업 — 신민종
// 하루 마무리(다 기록했거나 23:30 지남 + 70% 이상, 하루 한 번) · 단원 완료 · 회복 때만 떠요 (BK-03 v2).
// 평소 기록과 70%를 넘는 순간은 P1-1 가벼운 알림. 모양은 디자인 BookBoxDialog
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/screens.js';
import BookBlock from '@/components/book/BookBlock.jsx';
import Shelf from '@/components/book/Shelf.jsx';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import { PLAN_OPTION, RECORD_RESULT } from '@/config/labels.js';
import { useToday } from '@/hooks/useToday.js';

const KICKER = { dayClose: '오늘 마무리', unitDone: '단원 완료', recover: '계획 회복' };

const titleOf = (event) =>
  event?.reason === 'dayClose'
    ? `오늘 ${event.rate}% 했어요!`
    : event?.reason === 'unitDone'
      ? '단원을 끝냈어요!'
      : '루트를 다시 짰어요'; // TODO(확인필요): [기획 확인] 회복 박스 문구

export default function P1BookBox({ event, taskId, onClose }) {
  const navigate = useNavigate();
  const { data: today } = useToday();
  // 회복 박스는 분배안으로 새로 들어온 태스크의 책이 떨어져요
  const focusId = taskId ?? (event?.planKey ? `t${event.planKey}` : null);
  const task = today?.tasks.find((t) => t.id === focusId);
  const nameOf = (id) => today?.subjects.find((s) => s.id === id)?.name;
  const todayBlocks = today?.recentDays.at(-1)?.blocks ?? [];
  const dayClose = event?.reason === 'dayClose';
  const quizCount = event?.opened?.reduce((n, o) => n + o.count, 0) ?? 0;

  return (
    <Modal
      title={titleOf(event)}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>닫기</Button>
          {dayClose && today?.quiz.open && (
            <Button
              variant="primary"
              onClick={() => {
                onClose();
                navigate(ROUTES.quiz);
              }}
            >
              퀴즈 풀기
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="label text-brand-deep">{KICKER[event?.reason] ?? '책이 쌓였어요'}</p>
        {event?.reason === 'recover' && (
          <p className="text-[12.5px] text-fg-2">
            분배안 {event.planKey} · {PLAN_OPTION[event.planKey]}를 적용했어요. 어제 몫을 오늘 할
            일에 다시 쌓았어요.
          </p>
        )}
        {/* 방금 기록한 태스크 줄 */}
        {task && event?.reason !== 'recover' && (
          <p className="num text-[12.5px] text-fg-soft">
            {nameOf(task.subjectId)} · {task.title} · {RECORD_RESULT[task.status] ?? ''} (p.
            {task.from}–{task.doneTo ?? task.to})
          </p>
        )}
        <Shelf className="mt-2 w-[186px]">
          <div
            className="flex min-h-32 flex-col-reverse gap-[3px] px-2 pb-1"
            role="img"
            aria-label="오늘 쌓은 책"
          >
            {todayBlocks.map((b, i) => (
              <BookBlock key={i} state={b.state} seed={i} drop={b.taskId === focusId} />
            ))}
          </div>
        </Shelf>
        {dayClose ? (
          <p className="num text-[13px]">
            오늘 태스크{' '}
            {event.recordedCount === event.totalCount
              ? `${event.totalCount}개 모두 기록`
              : `${event.recordedCount}/${event.totalCount}개 기록`}{' '}
            · {event.donePages}/{event.totalPages}p
            {event.opened.length > 0 &&
              ` → ${event.opened.map((o) => nameOf(o.subjectId)).join('·')} 퀴즈 ${quizCount}문항이 열렸어요`}
          </p>
        ) : (
          today && (
            <p className="num text-[13px]">
              오늘 {today.progress.donePages}/{today.progress.totalPages}p · {today.progress.rate}%
            </p>
          )
        )}
      </div>
    </Modal>
  );
}
