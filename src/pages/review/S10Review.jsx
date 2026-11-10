// S10 복습·오답 — 신민종
// RV-01 오답 노트(일자별 · 단원별 · 틀린 횟수별, 다시 풀기) · 취약 개념 · RV-02 문제 뽑기 · RV-03 재학습 기록
// 틀린 횟수 · 이해도 반영 · 취약 개념 판정은 서버(목업은 logic.js). 모양은 디자인 review NoteList · RetryDialog · CustomQuizCard
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import AiWait from '@/components/common/AiWait.jsx';
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import Modal from '@/components/common/Modal.jsx';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import Tabs from '@/components/common/Tabs.jsx';
import { fmtMD } from '@/config/date.js';
import { CONFIDENCE, GRADE, NOTE_RESULT, QUIZ_TYPE } from '@/config/labels.js';
import { useAiWait } from '@/hooks/useAiWait.js';
import { useBooks } from '@/hooks/useBooks.js';
import {
  useCustomQuiz,
  useNotes,
  useRelearn,
  useRetry,
  useRetryQuestion,
} from '@/hooks/useReview.js';

const GROUPS = [
  { value: 'date', label: '일자별' },
  { value: 'unit', label: '단원별' },
  { value: 'count', label: '틀린 횟수별' },
];
const statusText = (n) =>
  n.type === 'essay' && n.result !== 'resolved' && n.score != null
    ? `서술형 ${n.score}점`
    : NOTE_RESULT[n.result];
const statusTone = (r) =>
  r === 'resolved'
    ? 'border-st-stable/50 text-st-stable'
    : r === 'unsureRight'
      ? 'border-brand-line text-brand-deep'
      : 'border-st-risk/60 text-st-risk';

// ── 다시 풀기 (디자인 RetryDialog) ─────────────────────────
function RetryDialog({ note, onClose }) {
  const { data: q, isPending, isError, refetch } = useRetryQuestion(note.id);
  const retry = useRetry();
  const [a, setA] = useState({});
  const answered = q?.type === 'choice' ? a.choice != null : Boolean(a.text?.trim());
  const r = retry.data;

  const submit = () =>
    retry.mutate({ noteId: note.id, ...a }, { onError: (e) => toast.error(e.message) });

  return (
    <Modal
      title="다시 풀기"
      onClose={onClose}
      footer={
        r ? (
          <Button variant="primary" onClick={onClose}>
            닫기
          </Button>
        ) : (
          <>
            <Button onClick={onClose}>취소</Button>
            <Button
              variant="primary"
              disabled={!answered || !a.confidence || retry.isPending}
              onClick={submit}
            >
              {retry.isPending ? '채점하는 중…' : '제출'}
            </Button>
          </>
        )
      }
    >
      <p className="-mt-2 text-[12.5px] text-fg-2">
        {note.subjectName} · {note.unitNo}단원 · 오답 {note.wrongCount}회 누적
      </p>
      {isPending && <LoadingState title="문항을 불러오는 중이에요" />}
      {isError && <ErrorState onRetry={refetch} />}
      {q && !r && (
        <>
          <p className="flex flex-wrap items-center gap-2 text-[12px] text-fg-2">
            {QUIZ_TYPE[q.type]}
            {q.mockFilled.length > 0 && <MockBadge />}
          </p>
          <h3 className="font-sans text-[16px] font-semibold">{q.prompt}</h3>
          {q.type === 'choice' && (
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">보기</legend>
              {q.options.map((o, i) => (
                <label
                  key={o}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] ${a.choice === i ? 'border-brand-line bg-brand-tint' : 'border-line-2'}`}
                >
                  <input
                    type="radio"
                    name="retry-choice"
                    className="accent-brand"
                    checked={a.choice === i}
                    onChange={() => setA((x) => ({ ...x, choice: i }))}
                  />
                  {o}
                </label>
              ))}
            </fieldset>
          )}
          {q.type !== 'choice' && (
            <textarea
              aria-label="답"
              rows={q.type === 'essay' ? 5 : 2}
              className="rounded-xl border border-line-2 bg-bg px-3.5 py-2.5"
              value={a.text ?? ''}
              onChange={(e) => setA((x) => ({ ...x, text: e.target.value }))}
            />
          )}
          <fieldset className="flex gap-2">
            <legend className="mb-1.5 text-[13px] font-semibold">얼마나 확신해요? (필수)</legend>
            {Object.entries(CONFIDENCE).map(([k, label]) => (
              <label
                key={k}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-[13px] font-semibold ${a.confidence === k ? 'border-ink bg-ink text-ink-fg' : 'border-line-2'}`}
              >
                <input
                  type="radio"
                  name="retry-conf"
                  className="sr-only"
                  checked={a.confidence === k}
                  onChange={() => setA((x) => ({ ...x, confidence: k }))}
                />
                {label}
              </label>
            ))}
          </fieldset>
        </>
      )}
      {r && (
        <div className="flex flex-col gap-2.5" aria-live="polite">
          <p className="flex items-center gap-2">
            <span
              className={`badge ${r.correct ? statusTone('resolved') : statusTone('sureWrong')}`}
            >
              {r.correct ? '정답' : '오답'}
            </span>
            <span className="badge">{CONFIDENCE[r.confidence]}</span>
            {r.score != null && <b className="num text-[13px]">{r.score}점</b>}
          </p>
          {r.explanation && <p className="text-[13px] text-fg-soft">{r.explanation}</p>}
          <ul className="num flex flex-col gap-1 rounded-xl border border-dashed border-line-2 px-3.5 py-2.5 text-[12.5px]">
            <li>
              틀린 횟수 {r.wrongCountBefore} → <b>{r.note.wrongCount}</b>
            </li>
            <li>
              상태 <b>{statusText(r.note)}</b>
              {r.note.result !== 'resolved' && ` · 확실 정답 ${r.note.streak}/2번이면 해결`}
            </li>
            {r.unitChange && (
              <li>
                {r.unitChange.unitNo}단원 이해도 {r.unitChange.before.score} →{' '}
                <b>{r.unitChange.after.score}</b> · {GRADE[r.unitChange.after.grade].label}
              </li>
            )}
          </ul>
        </div>
      )}
    </Modal>
  );
}

// ── RV-01 오답 노트 (디자인 NoteList) ───────────────────────
function NoteList({ subjects }) {
  const [group, setGroup] = useState('date');
  const [subject, setSubject] = useState('all');
  const [withUnsure, setWithUnsure] = useState(true);
  const [retrying, setRetrying] = useState(null);
  const { data, isPending, isError, refetch } = useNotes(group);

  if (isPending) return <LoadingState title="오답 노트를 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const keep = (n) =>
    (subject === 'all' || n.subjectId === subject) && (withUnsure || n.result !== 'unsureRight');
  const groups = data.groups
    .map((g) => ({ ...g, items: g.items.filter(keep) }))
    .filter((g) => g.items.length);
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <Card className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[19px]">누적 오답 노트</h2>
          <p className="mt-1 text-[12px] text-fg-2">
            {withUnsure ? '틀린 문제 + 애매하게 맞힌 문제' : '틀린 문제'}까지 {count}문항. 한 번 더
            볼 문항만 골라 다시 풀 수 있어요.
          </p>
        </div>
        <Tabs label="오답 노트 보기 방식" items={GROUPS} value={group} onChange={setGroup} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="과목"
          className="rounded-full border border-line-2 bg-bg px-3 py-1.5 text-[12.5px]"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="all">전체 과목</option>
          {subjects.map((s) => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="chip"
          aria-pressed={withUnsure}
          onClick={() => setWithUnsure((v) => !v)}
        >
          틀린 문제 + 애매하게 맞힌 문제
        </button>
      </div>
      {groups.length === 0 && (
        <p className="rounded-xl border border-dashed border-line-2 px-3.5 py-3 text-[12.5px] text-fg-2">
          해당하는 문항이 없어요. 다음 복습에서 만나요.
        </p>
      )}
      {groups.map((g) => (
        <section key={g.key} aria-label={g.label}>
          <h3 className="border-b border-line pb-2 font-sans text-[12.5px] font-semibold text-fg-soft">
            {g.label}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] [&_td]:border-b [&_td]:border-line [&_td]:px-2 [&_td]:py-2.5 [&_th]:px-2 [&_th]:pt-2 [&_th]:pb-1 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-semibold [&_th]:text-fg-2">
              <thead>
                <tr>
                  <th>문제</th>
                  <th>단원</th>
                  <th>틀린 횟수</th>
                  <th>마지막</th>
                  <th>상태</th>
                  <th>
                    <span className="sr-only">다시 풀기</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {g.items.map((n) => (
                  <tr key={n.id}>
                    <td className="min-w-[200px]">
                      <span className="font-medium">{n.question}</span>
                      <span className="num ml-1.5 text-fg-2">p.{n.page}</span>
                    </td>
                    <td className="whitespace-nowrap text-fg-soft">
                      {n.subjectName} {n.unitNo}단원
                    </td>
                    <td className="num">{n.wrongCount}회</td>
                    <td className="num whitespace-nowrap text-fg-2">{fmtMD(n.lastDate)}</td>
                    <td className="whitespace-nowrap">
                      <span className={`badge ${statusTone(n.result)}`}>{statusText(n)}</span>
                      {n.mockFilled.includes('confidence') && (
                        <span className="ml-1 align-middle">
                          <MockBadge />
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        disabled={!n.canRetry}
                        title={n.canRetry ? undefined : '이 문제는 다시 풀 문항이 아직 없어요'}
                        onClick={() => setRetrying(n)}
                      >
                        <RotateCcw size={12} aria-hidden="true" />
                        다시 풀기
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {retrying && <RetryDialog note={retrying} onClose={() => setRetrying(null)} />}
    </Card>
  );
}

// ── 취약 개념 (오답 2회 이상, 디자인 WeakConceptBar) ─────────
function WeakConcepts() {
  const { data } = useNotes('date');
  const weak = data?.weakConcepts ?? [];
  return (
    <Card className="flex flex-col gap-2.5">
      <h2 className="text-[16px]">
        취약 개념 <span className="font-sans text-[12px] text-fg-2">(오답 2회 이상)</span>
      </h2>
      {weak.length === 0 ? (
        <p className="text-[12.5px] text-fg-3">아직 오답이 2회 넘게 쌓인 개념이 없어요.</p>
      ) : (
        weak.map((w) => (
          <div key={`${w.subjectId}${w.concept}`} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
              <span>
                <span className="text-fg-2">{w.subjectName} · </span>
                {w.concept}
              </span>
              <b className="num font-semibold text-st-risk">오답 {w.count}회</b>
            </div>
            <span className="block h-1.5 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-st-risk"
                style={{ width: `${Math.min(100, w.count * 25)}%` }}
              />
            </span>
          </div>
        ))
      )}
      <p className="text-[11.5px] text-fg-2">취약 개념은 문제 뽑기 기본 범위로 써요.</p>
    </Card>
  );
}

// ── RV-02 문제 뽑기 (디자인 CustomQuizCard) ─────────────────
const RANGE_MODES = [
  ['auto', '부족한 범위 자동 선택'],
  ['all', '시험 범위 전체'],
  ['pages', '페이지로 지정'],
];
const LEVELS = ['하', '중', '상'];
const COUNTS = [5, 10, 15];

function CustomQuizCard({ books }) {
  const navigate = useNavigate();
  const make = useCustomQuiz();
  const { data: notes } = useNotes('date');
  const [subjectId, setSubjectId] = useState(books.subjects[0].subjectId);
  const [mode, setMode] = useState('auto');
  const [picked, setPicked] = useState(null); // 직접 고친 단원 (없으면 범위 방식대로)
  const [ranges, setRanges] = useState([{ from: '', to: '' }]);
  const [level, setLevel] = useState('하');
  const [count, setCount] = useState(5);
  const [weight, setWeight] = useState('even');
  const [startedAt, setStartedAt] = useState(null);
  const wait = useAiWait(startedAt, make.isPending);

  const subject = books.subjects.find((s) => s.subjectId === subjectId);
  const weakUnits = (notes?.groups ?? [])
    .flatMap((g) => g.items)
    .filter((n) => n.subjectId === subjectId && n.wrongCount >= 2)
    .map((n) => n.unitNo);
  // 부족한 범위 = 흔들림·붕괴 위기 단원 + 취약 개념 단원
  const autoUnits = subject.units
    .filter((u) => u.grade === 'shaky' || u.grade === 'risk' || weakUnits.includes(u.no))
    .map((u) => u.no);
  const pageUnits = subject.units
    .filter((u) =>
      ranges.some(
        (r) => Number(r.from) && Number(r.to) && Number(r.from) <= u.to && Number(r.to) >= u.from,
      ),
    )
    .map((u) => u.no);
  const base =
    mode === 'auto' ? autoUnits : mode === 'all' ? subject.units.map((u) => u.no) : pageUnits;
  const units = mode === 'pages' ? pageUnits : (picked ?? base);
  const allSecond =
    units.length > 0 && units.every((no) => subject.units.find((u) => u.no === no).round >= 2);
  const effLevel = allSecond ? level : '하';

  const pickSubject = (id) => {
    setSubjectId(id);
    setPicked(null);
  };
  const toggle = (no) =>
    setPicked((p) => {
      const cur = p ?? base;
      return cur.includes(no) ? cur.filter((x) => x !== no) : [...cur, no].sort();
    });
  const submit = () => {
    setStartedAt(Date.now());
    make.mutate(
      { subjectId, units, difficulty: effLevel, count, weight },
      {
        onSuccess: (r) => {
          if (r.note) toast(r.note);
          navigate(`${ROUTES.quiz}?subject=${r.quizId}`);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-[19px]">문제 뽑기</h2>
        <p className="mt-1 text-[12px] text-fg-2">
          과목·범위·난이도를 골라 새 문제를 풀어요. 고른 범위·난이도 밖에서는 나오지 않아요.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="과목">
        {books.subjects.map((s) => (
          <button
            key={s.subjectId}
            type="button"
            role="tab"
            aria-selected={s.subjectId === subjectId}
            onClick={() => pickSubject(s.subjectId)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold ${s.subjectId === subjectId ? 'border-transparent bg-ink text-ink-fg' : 'border-line-2 text-fg-soft'}`}
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

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[13px] font-semibold">범위</legend>
        <div className="flex flex-wrap gap-1.5">
          {RANGE_MODES.map(([k, label]) => (
            <button
              key={k}
              type="button"
              className="chip"
              aria-pressed={mode === k}
              onClick={() => {
                setMode(k);
                setPicked(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === 'pages' && (
          <div className="flex flex-col gap-2">
            {ranges.map((r, i) => (
              <div key={i} className="num flex items-center gap-2 text-[12.5px]">
                <span>p.</span>
                {['from', 'to'].map((k) => (
                  <input
                    key={k}
                    type="number"
                    min={1}
                    aria-label={`${i + 1}번째 구간 ${k === 'from' ? '시작' : '끝'} 페이지`}
                    className="w-20 rounded-lg border border-line-2 bg-bg px-2 py-1 text-center"
                    value={r[k]}
                    onChange={(e) =>
                      setRanges((x) =>
                        x.map((y, j) => (j === i ? { ...y, [k]: e.target.value } : y)),
                      )
                    }
                  />
                ))}
              </div>
            ))}
            <Button
              size="sm"
              className="self-start"
              onClick={() => setRanges((x) => [...x, { from: '', to: '' }])}
            >
              + 구간 추가
            </Button>
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-2 text-[13px] font-semibold">단원·개념</legend>
        {subject.units.map((u) => (
          <label
            key={u.no}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-[12.5px] ${units.includes(u.no) ? 'border-brand-line bg-brand-tint' : 'border-line'} ${mode === 'pages' ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <input
              type="checkbox"
              className="accent-brand"
              checked={units.includes(u.no)}
              disabled={mode === 'pages'}
              onChange={() => toggle(u.no)}
            />
            <span className="min-w-0 flex-1">
              {u.no}단원 {u.title}{' '}
              <span className="num text-fg-2">
                p.{u.from}–{u.to}
              </span>
            </span>
            {u.grade ? (
              <span className="badge num">
                {GRADE[u.grade].label} · {u.score}점
              </span>
            ) : (
              <span className="badge">예정</span>
            )}
            <span className={`badge ${u.round >= 2 ? 'border-st-stable/50 text-st-stable' : ''}`}>
              {u.round}회독
            </span>
          </label>
        ))}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-3">
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-[12.5px] font-semibold">난이도</legend>
          <div className="flex gap-1.5">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                className="chip"
                aria-pressed={effLevel === l}
                disabled={!allSecond && l !== '하'}
                onClick={() => setLevel(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-[12.5px] font-semibold">문항 수</legend>
          <div className="flex gap-1.5">
            {COUNTS.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                aria-pressed={count === c}
                onClick={() => setCount(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-[12.5px] font-semibold">범위별 비중</legend>
          <div className="flex gap-1.5">
            {[
              ['even', '고르게'],
              ['weak', '부족한 범위 위주'],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                className="chip"
                aria-pressed={weight === k}
                onClick={() => setWeight(k)}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      {!allSecond && units.length > 0 && (
        <p className="text-[11.5px] text-fg-2">
          난이도는 2회독한 범위만 고를 수 있어요. 1회독 범위가 섞여 있어서 하로 정해요.
        </p>
      )}

      <div className="num rounded-xl border border-dashed border-line-2 px-3.5 py-2.5 text-[12.5px] text-fg-soft">
        {units.length
          ? `${subject.name} · ${units.map((n) => `${n}단원`).join(' · ')} · 난이도 ${effLevel} · ${count}문항 · ${weight === 'even' ? '고르게' : '부족한 범위 위주'}`
          : '범위를 하나 이상 골라 주세요'}
      </div>
      {make.isPending ? (
        <AiWait phase={wait} label="AI가 고른 범위에서 문제를 만들고 있어요" lines={false} />
      ) : (
        <Button variant="primary" className="self-end" disabled={!units.length} onClick={submit}>
          문제 뽑기
        </Button>
      )}
    </Card>
  );
}

// ── RV-03 재학습 기록 ──────────────────────────────────────
function RelearnCard({ books }) {
  const relearn = useRelearn();
  const [subjectId, setSubjectId] = useState(books.subjects[0].subjectId);
  const subject = books.subjects.find((s) => s.subjectId === subjectId);
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[16px]">재학습 기록</h2>
        <select
          aria-label="재학습 과목"
          className="rounded-full border border-line-2 bg-bg px-3 py-1 text-[12px]"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          {books.subjects.map((s) => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <p className="text-[11.5px] text-fg-2">
        단원 범위를 처음부터 끝까지 다시 봤으면 기록해요. 회독이 올라가고, 회복 점수는 서버가
        계산해요.
      </p>
      {subject.units
        .filter((u) => u.grade)
        .map((u) => (
          <div key={u.no} className="flex items-center justify-between gap-2 text-[12.5px]">
            <span>
              {u.no}단원 {u.title} <span className="num text-fg-2">· {u.round}회독</span>
            </span>
            <Button
              size="sm"
              disabled={relearn.isPending}
              onClick={() =>
                relearn.mutate(
                  { subjectId, unitNo: u.no },
                  {
                    onSuccess: (r) => toast(`${u.no}단원 재학습 완료 · ${r.round}회독`),
                    onError: (e) => toast.error(e.message),
                  },
                )
              }
            >
              범위 전체 재학습 완료
            </Button>
          </div>
        ))}
    </Card>
  );
}

export default function S10Review() {
  const { data: books, isPending, isError, refetch } = useBooks();
  if (isPending) return <LoadingState title="복습 화면을 불러오는 중이에요" />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!books.subjects.length) return <EmptyState title="아직 과목이 없어요" />;
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="label text-brand-deep">복습·오답</p>
        <h1 className="text-[28px]">복습·오답</h1>
        <p className="text-[13px] text-fg-2">
          틀리거나 애매하게 맞힌 문제는 모두 남아요. 확실하게 두 번 맞히면 해결돼요.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <NoteList subjects={books.subjects} />
          <CustomQuizCard books={books} />
        </div>
        <aside className="flex flex-col gap-4">
          <WeakConcepts />
          <RelearnCard books={books} />
        </aside>
      </div>
    </>
  );
}
