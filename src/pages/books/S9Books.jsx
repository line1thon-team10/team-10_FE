// S9 책 쌓기 — 신민종
// 11/10 결정(Q3 A): 과목 탭 + 나무 선반 하나 위에 단원별 세로 책 더미 (디자인 SubjectTabs · UnitShelf · ReadinessCard).
// 상태는 정의서 4-5 (색·패턴·움직임 + 책 위 글자). 과목 색은 탭·단원 이름표에만 쓰고 책에는 쓰지 않아요.
import { useState } from 'react';
import { Link } from 'react-router';
import BookBlock from '@/components/book/BookBlock.jsx';
import WoodShelf from '@/components/book/Shelf.jsx';
import { MockBadge } from '@/components/common/Badge.jsx';
import Card from '@/components/common/Card.jsx';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { ROUTES } from '@/app/screens.js';
import { BLOCK_STATE, GRADE, READINESS_PART } from '@/config/labels.js';
import { useBooks } from '@/hooks/useBooks.js';

const LEGEND = [
  ['planned', '예정 · 회색 점선'],
  ['doing', '진행 중 · 회색 점'],
  ['done', '완료 (퀴즈 전) · 회색'],
  ['stable', '안정 · 초록불'],
  ['shaky', '흔들림 · 노란불 · 좌우 흔들림'],
  ['risk', '붕괴 위기 · 빨간불 · 기울어짐'],
];
const GRADED = ['stable', 'shaky', 'risk'];

// 단원 이름표 아래 상태 줄: "안정 · 96점", "흔들림 · 73점 · 진행 중", "예정"
function unitStatus(u) {
  const doing = u.blocks.some((b) => b.state === 'doing');
  const parts = u.grade
    ? [GRADE[u.grade].label, u.score != null && `${u.score}점`, doing && '진행 중']
    : [doing ? '진행 중' : u.blocks.some((b) => b.state === 'done') ? '완료 (퀴즈 전)' : '예정'];
  return parts.filter(Boolean).join(' · ');
}

// 책장 위 한 줄 요약
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

// 책을 누르면 보여주는 글 (BK-05): "흔들림 · 노란불 · 이해도 70점 · (단원 메모)"
function detailText(u, b) {
  if (GRADED.includes(b.state)) {
    const g = GRADE[b.state];
    return [g.label, g.signal, u.score != null && `이해도 ${u.score}점`, u.note]
      .filter(Boolean)
      .join(' · ');
  }
  if (b.state === 'doing')
    return `진행 중 · ${b.task ? `p.${b.task.from}–${b.task.doneTo}까지 했어요` : '부분 완료'}`;
  if (b.state === 'done') return '완료 (퀴즈 전) · 오늘의 퀴즈를 풀면 색이 정해져요';
  return `예정 · ${b.task ? `p.${b.task.from}–${b.task.to} 아직 공부 전이에요` : '아직 공부 전이에요'}`;
}

function SubjectTabs({ subjects, value, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="과목 선택"
      className="inline-flex max-w-full items-center gap-1 self-start overflow-x-auto rounded-full border border-line-2 p-1"
    >
      {subjects.map((s) => (
        <button
          key={s.subjectId}
          type="button"
          role="tab"
          aria-selected={s.subjectId === value}
          onClick={() => onChange(s.subjectId)}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold whitespace-nowrap transition-colors ${s.subjectId === value ? 'bg-ink text-ink-fg' : 'text-fg-2 hover:text-fg'}`}
        >
          <span
            className="h-2.5 w-1 rounded-full"
            style={{ background: s.color }}
            aria-hidden="true"
          />
          {s.name}
        </button>
      ))}
    </div>
  );
}

// 나무 선반 하나 위에 단원마다 세로 더미. 넓이가 모자라면 이 영역 안에서만 가로 스크롤
function UnitShelf({ subject, picked, onPick }) {
  const cols = { gridTemplateColumns: `repeat(${subject.units.length}, minmax(104px, 1fr))` };
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="min-w-fit">
        <WoodShelf>
          <div className="grid items-end gap-3 px-2" style={cols}>
            {subject.units.map((u) => (
              <div
                key={u.no}
                className="flex min-h-[200px] flex-col-reverse gap-[3px] pb-1"
                role="group"
                aria-label={`${u.no}단원 책 더미`}
              >
                {u.blocks.map((b, i) => (
                  <BookBlock
                    key={i}
                    state={b.state}
                    seed={u.no * 3 + i}
                    tag={b.supplement ? '보충' : undefined}
                    label={`${u.no}단원 ${i + 1}번째 책 · ${BLOCK_STATE[b.state].label}${b.supplement ? ' · 보충' : ''}`}
                    selected={picked?.unitNo === u.no && picked?.index === i}
                    onClick={() => onPick({ unitNo: u.no, index: i })}
                  />
                ))}
              </div>
            ))}
          </div>
        </WoodShelf>
        <div className="grid gap-3 px-2 pt-3" style={cols}>
          {subject.units.map((u) => (
            <div key={u.no} className="flex min-w-0 flex-col items-center text-center">
              <span className="flex items-center gap-1.5">
                <span
                  className="h-3 w-1 rounded-full"
                  style={{ background: subject.color }}
                  aria-hidden="true"
                />
                <b className="text-[12px] font-semibold">{u.no}단원</b>
              </span>
              <span className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-fg-soft">
                {u.title}
              </span>
              <span className="num mt-1 text-[11px] text-fg-2">{unitStatus(u)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 시험 준비도 (KP-01·02, 디자인 ReadinessCard): 고른 과목은 크게, 다른 과목은 아래 줄
function ReadinessCard({ data, subjectId, onSelect }) {
  const nameOf = (id) => data.subjects.find((s) => s.subjectId === id);
  const r = data.readiness.find((x) => x.subjectId === subjectId);
  const others = data.readiness.filter((x) => x.subjectId !== subjectId);
  if (!r) return null;
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="label text-brand-deep">시험 준비도</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-fg-2">
            <span
              className="h-3 w-1 rounded-full"
              style={{ background: nameOf(subjectId)?.color }}
              aria-hidden="true"
            />
            {nameOf(subjectId)?.name}
          </p>
        </div>
        <span className="badge">{r.targetLabel} 목표</span>
      </div>
      <p className="display num text-[44px] leading-none">
        {r.readiness}
        <span className="ml-0.5 text-[18px] text-fg-2">%</span>
      </p>
      {r.mastery != null && (
        <p className="num text-[12px] text-fg-2">
          = {READINESS_PART.progressRate}{' '}
          <b className="font-semibold text-fg-soft">{r.progressRate}%</b>
          {r.studiedPages != null && `(${r.studiedPages}/${r.totalPages}p)`} ×{' '}
          {READINESS_PART.mastery} <b className="font-semibold text-fg-soft">{r.mastery}%</b>
        </p>
      )}
      <div className="relative">
        <div className="h-2 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-brand" style={{ width: `${r.readiness}%` }} />
        </div>
        <span
          className="absolute -top-[3px] -bottom-[3px] w-0.5 rounded bg-fg-soft"
          style={{ left: `calc(${r.target}% - 1px)` }}
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-[11.5px] text-fg-2">
        <span>
          목표선 {r.target}% ({r.targetLabel})
        </span>
        <span>
          목표까지{' '}
          <b className="num font-semibold text-brand-deep">
            {Math.max(0, r.target - r.readiness)}%
          </b>{' '}
          부족
        </span>
      </div>
      <ul className="flex flex-col gap-2.5 border-t border-line pt-3">
        {others.map((o) => (
          <li key={o.subjectId}>
            <button
              type="button"
              className="w-full text-left"
              onClick={() => onSelect(o.subjectId)}
              aria-label={`${nameOf(o.subjectId)?.name} 책 쌓기 보기`}
            >
              <span className="flex items-center justify-between gap-2 text-[12px]">
                <span className="flex items-center gap-1.5 text-fg-soft">
                  <span
                    className="h-3 w-1 rounded-full"
                    style={{ background: nameOf(o.subjectId)?.color }}
                    aria-hidden="true"
                  />
                  {nameOf(o.subjectId)?.name}
                </span>
                <span className="num text-fg-2">
                  <b className="font-semibold text-fg">{o.readiness}%</b> · 목표 {o.target}%
                </span>
              </span>
              <span className="mt-1 block h-1 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-line-2"
                  style={{ width: `${o.readiness}%` }}
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function S9Books() {
  const { data, isPending, isError, refetch } = useBooks();
  const [tab, setTab] = useState(null);
  const [picked, setPicked] = useState(null);
  if (isPending) return <LoadingState title="책장을 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;
  // 계획이 없으면 서버가 과목 0개를 줘요 (empty 시드)
  if (!data.subjects.length)
    return (
      <EmptyState
        title="아직 계획이 없어요"
        description="계획을 만들고 공부를 기록하면 단원별로 책이 쌓여요."
        action={
          <Link className="btn btn-primary" to={ROUTES.s1}>
            계획 만들기
          </Link>
        }
      />
    );

  const subject = data.subjects.find((s) => s.subjectId === tab) ?? data.subjects[0];
  const pu = picked && subject.units.find((u) => u.no === picked.unitNo);
  const pb = pu?.blocks[picked.index];
  const select = (id) => {
    setTab(id);
    setPicked(null);
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="label text-brand-deep">책 쌓기</p>
          <h1 className="text-[28px]">단원별 책 쌓기</h1>
          <p className="text-[13px] text-fg-2">
            책 1권 = 태스크 1개 · 흔들리는 책은 퀴즈로 다시 칠할 수 있어요
          </p>
        </div>
        <span
          className="flex items-center gap-1.5 text-xs text-fg-3"
          title="단원별 권 수와 일부 점수는 데이터 세트에 없어 목업 값이에요"
        >
          권 수·일부 점수 <MockBadge />
        </span>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="flex min-w-0 flex-col gap-4">
          <SubjectTabs subjects={data.subjects} value={subject.subjectId} onChange={select} />
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[18px]">
              {subject.name}{' '}
              <span className="num font-sans text-[13px] font-semibold text-fg-2">
                · {subject.collected} / {subject.total}권
              </span>
            </h2>
            <span className="text-[12px] text-fg-2">{shelfSummary(subject)}</span>
          </div>
          <UnitShelf subject={subject} picked={picked} onPick={setPicked} />
          <div
            className="rounded-xl border border-dashed border-line-2 px-3.5 py-3"
            aria-live="polite"
          >
            {pb ? (
              <>
                <p className="text-[12px] text-fg-2">
                  {subject.name} · {pu.no}단원 {pu.title}
                  {pb.supplement && ' · 보충 학습'}
                </p>
                <p className="mt-1 text-[13.5px] font-semibold">{detailText(pu, pb)}</p>
              </>
            ) : (
              <p className="text-[12.5px] text-fg-3">
                책을 누르면 상태와 이해도 점수를 글로 보여줘요.
              </p>
            )}
          </div>
        </Card>
        <aside className="flex flex-col gap-4">
          <ReadinessCard data={data} subjectId={subject.subjectId} onSelect={select} />
          <Card className="flex flex-col gap-2">
            <h2 className="text-[16px]">범례</h2>
            {LEGEND.map(([st, label]) => (
              <div key={st} className="grid grid-cols-[92px_1fr] items-center gap-3 text-[12.5px]">
                <BookBlock state={st} />
                <span>{label}</span>
              </div>
            ))}
            <div className="grid grid-cols-[92px_1fr] items-center gap-3 text-[12.5px]">
              <BookBlock state="risk" tag="보충" />
              <span>보충 학습 · 위에 새로 쌓은 책 (상태가 아니라 글자)</span>
            </div>
            <p className="pt-1 text-[11.5px] text-fg-2">
              한 번 쌓인 책은 빠지지 않아요 · 과목 색은 탭과 단원 이름표에만
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
