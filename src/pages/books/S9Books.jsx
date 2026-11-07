// S9 책 쌓기 — 신민종
// 11/7 결정(Q3 A): 과목별 책장 3개를 한 화면에, 단원마다 가로로 눕힌 책 더미. 상태는 정의서 4-5 (색·패턴·움직임).
// 과목 색은 단원 이름표에만 쓰고 책에는 쓰지 않아요.
import { useState } from 'react';
import BookBlock from '@/components/book/BookBlock.jsx';
import { MockBadge } from '@/components/common/Badge.jsx';
import Card from '@/components/common/Card.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { BLOCK_STATE, GRADE } from '@/config/labels.js';
import { useBooks } from '@/hooks/useBooks.js';

const LEGEND = [
  ['planned', '예정'],
  ['doing', '진행 중'],
  ['done', '완료 (퀴즈 전)'],
  ['stable', '안정 · 초록불'],
  ['shaky', '흔들림 · 노란불 · 좌우 흔들림'],
  ['risk', '붕괴 위기 · 빨간불 · 기울어짐'],
];

function unitStatus(u) {
  if (u.grade) return `${GRADE[u.grade].label}${u.score != null ? ` · ${u.score}점` : ''}`;
  if (u.blocks.some((b) => b.state === 'doing')) return '진행 중';
  if (u.blocks.some((b) => b.state === 'done')) return '완료 (퀴즈 전)';
  return '예정';
}

// 책장 오른쪽 한 줄 요약 (참고 이미지 6의 문장 틀)
function shelfSummary(s) {
  const count = (st) =>
    s.units
      .map((u) => ({ u, n: u.blocks.filter((b) => b.state === st).length }))
      .filter((x) => x.n);
  const [risk] = count('risk');
  if (risk) return `${risk.u.no}단원 ${risk.n}권이 무너지는 중 · 퀴즈로 다시 칠할 수 있어요`;
  const [shaky] = count('shaky');
  if (shaky) return `${shaky.u.no}단원 ${shaky.n}권이 흔들려요`;
  const done = count('done').reduce((n, x) => n + x.n, 0);
  if (done) return `오늘 퀴즈 풀면 ${done}권 색이 정해져요`;
  return '';
}

function detailText(u, b) {
  if (['stable', 'shaky', 'risk'].includes(b.state)) {
    const g = GRADE[b.state];
    return `${g.label} · ${g.signal}${u.score != null ? ` · 이해도 ${u.score}점` : ''}`;
  }
  if (b.state === 'doing')
    return `진행 중 · ${b.task ? `p.${b.task.from}–${b.task.doneTo}까지 했어요` : '부분 완료'}`;
  if (b.state === 'done') return '완료 (퀴즈 전) · 오늘의 퀴즈를 풀면 색이 정해져요';
  return `예정 · ${b.task ? `p.${b.task.from}–${b.task.to} 아직 공부 전이에요` : '아직 공부 전이에요'}`;
}

function Shelf({ subject, picked, onPick }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold">
          <span style={{ color: subject.color }}>■</span> {subject.name}{' '}
          <span className="num text-sm font-semibold text-fg-2">
            · {subject.collected} / {subject.total}권
          </span>
        </h2>
        <span className="text-xs text-fg-2">{shelfSummary(subject)}</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {subject.units.map((u) => (
          <div key={u.no} className="flex w-[112px] flex-none flex-col gap-1.5">
            <div
              className="flex min-h-[132px] flex-col-reverse gap-[3px] border-b-4 border-line pb-1"
              role="group"
              aria-label={`${u.no}단원 책 더미`}
            >
              {u.blocks.map((b, i) => (
                <BookBlock
                  key={i}
                  state={b.state}
                  seed={u.no * 3 + i}
                  tag={b.supplement ? '보충' : undefined}
                  label={`${u.no}단원 ${i + 1}번째 책 · ${BLOCK_STATE[b.state].label}`}
                  selected={
                    picked?.subjectId === subject.subjectId &&
                    picked?.unitNo === u.no &&
                    picked?.index === i
                  }
                  onClick={() => onPick({ subjectId: subject.subjectId, unitNo: u.no, index: i })}
                />
              ))}
            </div>
            <div className="text-xs leading-snug">
              <span className="font-semibold" style={{ color: subject.color }}>
                {u.no}단원
              </span>{' '}
              <span className="text-fg">{u.title}</span>
              <div className="num text-fg-2">{unitStatus(u)}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function S9Books() {
  const { data, isPending, isError, refetch } = useBooks();
  const [picked, setPicked] = useState(null);
  if (isPending) return <LoadingState title="책장을 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const ps = picked && data.subjects.find((s) => s.subjectId === picked.subjectId);
  const pu = ps?.units.find((u) => u.no === picked.unitNo);
  const pb = pu?.blocks[picked.index];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">단원별 책 쌓기</h1>
          <p className="text-fg-2">
            책 1권 = 태스크 1개 · 흔들리는 책은 퀴즈로 다시 칠할 수 있어요 · 한 번 쌓인 책은 빠지지
            않아요
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 text-xs text-fg-3"
          title="단원별 권 수와 일부 점수는 데이터 세트에 없어 목업 값이에요"
        >
          권 수·일부 점수 <MockBadge />
        </span>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          {data.subjects.map((s) => (
            <Shelf key={s.subjectId} subject={s} picked={picked} onPick={setPicked} />
          ))}
        </div>
        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-2" aria-live="polite">
            <h2 className="font-semibold">책 상세</h2>
            {pb ? (
              <>
                <p className="text-[13px] text-fg-2">
                  {ps.name} · {pu.no}단원 {pu.title}
                  {pb.supplement && ' · 보충 학습'}
                </p>
                <p className="font-semibold">{detailText(pu, pb)}</p>
                {pu.note && ['stable', 'shaky', 'risk'].includes(pb.state) && (
                  <p className="text-[13px] text-fg-2">{pu.note}</p>
                )}
              </>
            ) : (
              <p className="text-[13px] text-fg-3">
                책을 누르면 상태와 이해도 점수를 글로 보여줘요.
              </p>
            )}
          </Card>
          <Card className="flex flex-col gap-3">
            <h2 className="font-semibold">시험 준비도</h2>
            {data.readiness.map((r) => {
              const s = data.subjects.find((x) => x.subjectId === r.subjectId);
              return (
                <div key={r.subjectId} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold" style={{ color: s?.color }}>
                      {s?.name}
                    </span>
                    <b className="num text-lg">{r.readiness}%</b>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-surface-2">
                    <i
                      className="absolute inset-y-0 left-0 rounded-full bg-fg"
                      style={{ width: `${r.readiness}%` }}
                    />
                    <span
                      className="absolute -inset-y-1 w-0.5 bg-fg-2"
                      style={{ left: `${r.target}%` }}
                      title={`목표 ${r.target}%`}
                    />
                  </div>
                  {r.expectedCompletion != null && (
                    <span className="num text-xs text-fg-2">
                      = 예상 완료율 {r.expectedCompletion}% × 숙달도 {r.mastery}%
                    </span>
                  )}
                  <span className="text-xs text-fg-2">
                    목표 {r.target}%({r.targetLabel})까지 {Math.max(0, r.target - r.readiness)}%
                    부족
                  </span>
                </div>
              );
            })}
          </Card>
          <Card className="flex flex-col gap-2">
            <h2 className="font-semibold">범례</h2>
            {LEGEND.map(([st, label]) => (
              <div key={st} className="grid grid-cols-[56px_1fr] items-center gap-3 text-[13px]">
                <BookBlock state={st} />
                <span>{label}</span>
              </div>
            ))}
            <p className="pt-1 text-xs text-fg-3">
              한 번 쌓인 책은 빠지지 않아요 · 과목 색은 단원 이름표에만
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
