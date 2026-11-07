// P1 책 박스 팝업 — 신민종
// 70% 달성 · 단원 완료 · 회복 때만 떠요 (BK-03). 평소 기록은 P1-1 가벼운 알림.
// TODO(확인필요): 박스·책 모양은 S9 구성(Q3) 확정 후 같은 책 컴포넌트로 바꿔요. 지금은 블록 6개 상태 그대로예요.
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/screens.js';
import BookBlock from '@/components/book/BookBlock.jsx';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import { RECORD_RESULT } from '@/config/labels.js';
import { useToday } from '@/hooks/useToday.js';

const TITLE = {
  rate70: '오늘 목표 70% 달성!',
  unitDone: '단원을 끝냈어요!',
  recover: '다시 안정으로 돌아왔어요!',
};

export default function P1BookBox({ event, taskId, onClose }) {
  const navigate = useNavigate();
  const { data: today } = useToday();
  const task = today?.tasks.find((t) => t.id === taskId);
  const subject = today?.subjects.find((s) => s.id === task?.subjectId);
  const todayBlocks = today?.recentDays.at(-1)?.blocks ?? [];

  return (
    <Modal
      title={TITLE[event?.reason] ?? '책이 쌓였어요'}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>닫기</Button>
          {today?.quiz.open && (
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
      {task && (
        <p className="text-[13px] text-fg-2">
          {subject?.name} · {task.unitNo}단원 · {RECORD_RESULT[task.status] ?? ''}{' '}
          <span className="num">
            (p.{task.from}–{task.doneTo ?? task.to})
          </span>
        </p>
      )}
      <div className="grid place-items-center py-2">
        <div
          className="flex min-h-32 w-40 flex-col-reverse gap-1 rounded-b-lg border-2 border-t-0 border-fg-2 p-2"
          role="img"
          aria-label="오늘 쌓은 책"
        >
          {todayBlocks.map((b, i) => (
            <BookBlock key={i} state={b.state} drop={b.taskId === taskId} />
          ))}
        </div>
      </div>
      {today && (
        <p className="num text-center text-sm">
          오늘 {today.progress.donePages}/{today.progress.totalPages}p · {today.progress.rate}%
          {today.quiz.open && ` → 오늘의 퀴즈 ${today.quiz.totalCount}문항이 열렸어요`}
        </p>
      )}
    </Modal>
  );
}
