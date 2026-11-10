// P3 퀴즈 후 책 쌓기 — 신민종
// 제출 직후 먼저 뜨고, 닫으면 S8-2 (BK-08 · 결정 로그 4장). 값은 제출 응답 bookChanges (S9와 같은 계산)
// 바뀐 책은 위에서부터 차례로 등급 색으로 물들어요. 부분 완료(점)·예정(점선)은 그대로
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/screens.js';
import BookBlock from '@/components/book/BookBlock.jsx';
import Shelf from '@/components/book/Shelf.jsx';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import { GRADE } from '@/config/labels.js';

const STEP_MS = 260;
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function Stack({ blocks, label }) {
  return (
    <div className="flex w-[96px] flex-col items-center gap-1.5">
      <Shelf className="w-full">
        <div className="flex min-h-24 flex-col-reverse gap-[3px] px-1 pb-1">
          {blocks.map((st, i) => (
            <BookBlock key={i} state={st} seed={i} className="h-[16px]" />
          ))}
        </div>
      </Shelf>
      <span className="text-[11px] text-fg-2">{label}</span>
    </div>
  );
}

// 바뀐 책만 위(배열 끝)에서부터 하나씩 after 상태로
function useColoring(change) {
  const changed = change.after.blocks
    .map((st, i) => (st !== change.before.blocks[i] ? i : null))
    .filter((i) => i != null)
    .reverse();
  const [step, setStep] = useState(() => (reduced() ? changed.length : 0));
  useEffect(() => {
    if (step >= changed.length) return undefined;
    const id = setTimeout(() => setStep((n) => n + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [step, changed.length]);
  const shown = new Set(changed.slice(0, step));
  return change.before.blocks.map((st, i) => (shown.has(i) ? change.after.blocks[i] : st));
}

const gradeText = (c) =>
  c.before.grade === c.after.grade
    ? `${GRADE[c.after.grade]?.label} 유지`
    : `${GRADE[c.before.grade]?.label ?? '퀴즈 전'} → ${GRADE[c.after.grade]?.label}`;

function UnitRow({ change }) {
  const now = useColoring(change);
  const down = change.after.score < change.before.score;
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
      <div className="min-w-0">
        <p className="text-[13.5px]">
          {change.unitNo}단원 {change.title}
        </p>
        <p className="num mt-1 text-[12.5px] text-fg-soft">
          {change.before.score ?? '–'} <span className="text-fg-2">→</span>{' '}
          <b className={`font-semibold ${down ? 'text-st-risk' : 'text-st-stable'}`}>
            {change.after.score}
          </b>
        </p>
        <p className="mt-0.5 text-[11.5px] text-fg-2">
          {gradeText(change)}
          {change.recovering && ' · 회복 중'}
        </p>
      </div>
      <div className="flex shrink-0 items-end gap-3">
        <Stack blocks={change.before.blocks} label="퀴즈 전" />
        <ArrowRight size={16} className="mb-8 text-fg-2" aria-hidden="true" />
        <Stack blocks={now} label="퀴즈 후" />
      </div>
    </div>
  );
}

export default function P3BookColor({ result, onClose }) {
  const navigate = useNavigate();
  return (
    <Modal
      title="퀴즈 결과로 책 색이 바뀌었어요"
      wide
      onClose={onClose}
      footer={
        <>
          <Button onClick={() => navigate(ROUTES.books)}>책 쌓기 보기</Button>
          <Button variant="primary" onClick={onClose}>
            결과 자세히 보기
          </Button>
        </>
      }
    >
      <p className="-mt-2 text-[12.5px] text-fg-2">
        {result.name} · {result.summary.total}문항 중 {result.summary.correct}개 정답
      </p>
      <div className="flex flex-col gap-5">
        {result.bookChanges.map((c) => (
          <UnitRow key={c.unitNo} change={c} />
        ))}
      </div>
      <p className="text-[11.5px] text-fg-2">
        퀴즈를 풀어야 오늘 쌓은 회색 책에 단원 등급 색이 들어가요. 부분 완료(점)·예정(점선) 책은
        그대로예요.
      </p>
    </Modal>
  );
}
