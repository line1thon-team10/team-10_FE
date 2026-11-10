import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import { fmtShort, toDay } from '@/config/date.js';
import { DAY_NAMES } from '@/config/schedule.js';
import { useDemoState } from '@/hooks/useDemo.js';
import { useApplyAddition, usePreviewAddition, useSubjects } from '@/hooks/useManage.js';

const STEPS = ['과목', '자료·범위', '목표 시간·분량', '반복 요일', '미리보기'];
const MIN_PER_PAGE = 2.5; // 데이터 세트 3장 "약 2.5분/페이지" (예상 총 시간 안내용, 배치는 서버)

function StepBar({ step, onGo }) {
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="계획 추가 단계">
      {STEPS.map((t, i) => (
        <li key={t}>
          <button
            type="button"
            disabled={i > step}
            onClick={() => onGo(i)}
            aria-current={i === step ? 'step' : undefined}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] ${i === step ? 'border-fg bg-fg font-semibold text-ink-fg' : i < step ? 'border-line-2 text-fg-soft' : 'border-line text-fg-3'}`}
          >
            {i < step ? <Check size={11} aria-hidden="true" /> : `${i + 1}.`} {t}
          </button>
        </li>
      ))}
    </ol>
  );
}

// S13 계획 추가 (PL-09 · 디자인 manage PlanAddDialog): 5단계 → 미리보기 → 추가
// 확인 전에는 계획 그대로, 추가하면 고른 요일의 빈 시간(기존 공부 뒤)에만 들어가요 (서버 배치)
export default function PlanAddDialog({ onClose }) {
  const { data, isPending, isError, refetch } = useSubjects();
  const { data: demo } = useDemoState();
  const preview = usePreviewAddition();
  const apply = useApplyAddition();
  const today = demo?.today;
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    subjectId: null,
    materialId: null,
    from: '',
    to: '',
    minutesPerDay: 40,
    days: [],
    startDate: today ? toDay(today).add(1, 'day').format('YYYY-MM-DD') : '',
    endDate: today ? toDay(today).add(3, 'day').format('YYYY-MM-DD') : '',
  });
  const set = (patch) => setF((x) => ({ ...x, ...patch }));

  if (isPending)
    return (
      <Modal title="계획 추가" onClose={onClose}>
        <LoadingState />
      </Modal>
    );
  if (isError)
    return (
      <Modal title="계획 추가" onClose={onClose}>
        <ErrorState onRetry={refetch} />
      </Modal>
    );

  const subjects = data.subjects.filter((x) => !x.removed && !x.archived);
  const subject = subjects.find((x) => x.id === f.subjectId);
  const material = subject?.materials.find((m) => m.id === f.materialId);
  const from = Number(f.from);
  const to = Number(f.to);
  const pages = to >= from && from > 0 ? to - from + 1 : 0;
  const rangeOk = material && pages > 0 && to <= material.pages;
  const ok = [
    Boolean(subject),
    rangeOk,
    f.minutesPerDay >= 15 && f.minutesPerDay <= 180,
    f.days.length > 0 && f.startDate && f.endDate && f.endDate >= f.startDate,
  ];

  const toPreview = () =>
    preview.mutate(
      { ...f, from, to, minutesPerDay: Number(f.minutesPerDay) },
      { onSuccess: () => setStep(4), onError: (e) => toast.error(e.message) },
    );
  const next = () => (step === 3 ? toPreview() : setStep((n) => n + 1));
  const submit = () =>
    apply.mutate(undefined, {
      onSuccess: (r) => {
        onClose();
        toast(`계획을 추가했어요 · ${r.added}개 태스크`);
      },
      onError: (e) => toast.error(e.message),
    });
  const toggleUnit = (u) => {
    // 목차에서 고르면 연속한 범위로 이어 붙여요
    const curFrom = Number(f.from) || u.from;
    const curTo = Number(f.to) || u.to;
    set({ from: String(Math.min(curFrom, u.from)), to: String(Math.max(curTo, u.to)) });
  };

  const p = preview.data;
  return (
    <Modal
      title="계획 추가"
      wide
      onClose={onClose}
      footer={
        <>
          <Button disabled={step === 0} onClick={() => setStep((n) => n - 1)}>
            이전
          </Button>
          {step < 4 ? (
            <Button variant="primary" disabled={!ok[step] || preview.isPending} onClick={next}>
              {step === 3 ? (preview.isPending ? '배치하는 중…' : '미리보기') : '다음'}
            </Button>
          ) : (
            <Button variant="primary" disabled={apply.isPending} onClick={submit}>
              {apply.isPending ? '추가하는 중…' : '추가하기'}
            </Button>
          )}
        </>
      }
    >
      <StepBar step={step} onGo={setStep} />

      {step === 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[13px] font-semibold">① 어떤 과목에 더할까요?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {subjects.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={f.subjectId === x.id}
                onClick={() =>
                  set({ subjectId: x.id, materialId: x.materials[0].id, from: '', to: '' })
                }
                className={`flex flex-col items-start gap-1 rounded-xl border px-3.5 py-3 text-left ${f.subjectId === x.id ? 'border-brand-line bg-brand-tint' : 'border-line-2 hover:border-fg-2'}`}
              >
                <span className="flex items-center gap-2 text-[13px] font-semibold">
                  <span
                    className="h-3 w-1 rounded-full"
                    style={{ background: x.color }}
                    aria-hidden="true"
                  />
                  {x.name}
                </span>
                <span className="num text-[11.5px] text-fg-2">
                  시험 {fmtShort(x.examDate)} · D-{x.dday}
                </span>
              </button>
            ))}
          </div>
          {/* TODO(확인필요): [기획 확인] 새 과목은 S1 · S3 · S4 '추가 모드'로 (11/10 결정 A: 이번엔 막아 둠) */}
          <Button size="sm" className="self-start" disabled title="새 과목 추가는 준비 중이에요">
            + 새 과목 (과목 추가)
          </Button>
        </fieldset>
      )}

      {step === 1 && subject && (
        <div className="flex flex-col gap-3">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-[13px] font-semibold">② 어떤 자료의 어디를 볼까요?</legend>
            {subject.materials.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] ${f.materialId === m.id ? 'border-brand-line bg-brand-tint' : 'border-line-2'}`}
              >
                <input
                  type="radio"
                  name="plan-material"
                  className="accent-brand"
                  checked={f.materialId === m.id}
                  onChange={() => set({ materialId: m.id, from: '', to: '' })}
                />
                {m.name} <span className="num text-fg-2">· {m.pages}쪽</span>
                {m.mock && <MockBadge />}
              </label>
            ))}
          </fieldset>
          {material?.toc.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[12px] text-fg-2">목차에서 고르기</p>
              <div className="flex flex-wrap gap-1.5">
                {material.toc.map((u) => (
                  <button
                    key={u.no}
                    type="button"
                    className="chip text-[12px]"
                    aria-pressed={from <= u.from && to >= u.to && pages > 0}
                    onClick={() => toggleUnit(u)}
                  >
                    {u.title}{' '}
                    <span className="num text-fg-2">
                      p.{u.from}–{u.to}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="num flex flex-wrap items-center gap-2 text-[13px]">
            <span>페이지 직접</span>
            p.
            <input
              aria-label="시작 페이지"
              type="number"
              min={1}
              className="w-20 rounded-lg border border-line-2 bg-bg px-2 py-1 text-center"
              value={f.from}
              onChange={(e) => set({ from: e.target.value })}
            />
            –
            <input
              aria-label="끝 페이지"
              type="number"
              min={1}
              className="w-20 rounded-lg border border-line-2 bg-bg px-2 py-1 text-center"
              value={f.to}
              onChange={(e) => set({ to: e.target.value })}
            />
            {pages > 0 && <span className="text-fg-2">({pages}쪽)</span>}
            {pages > 0 && !rangeOk && (
              <span className="text-xs text-st-risk">p.1–{material?.pages} 안에서 골라 주세요</span>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-2">
          <label htmlFor="plan-minutes" className="text-[13px] font-semibold">
            ③ 하루에 얼마나 볼까요?
          </label>
          <div className="num flex items-center gap-2 text-[13px]">
            하루
            <input
              id="plan-minutes"
              type="number"
              min={15}
              max={180}
              step={5}
              className="w-20 rounded-lg border border-line-2 bg-bg px-2 py-1 text-center"
              value={f.minutesPerDay}
              onChange={(e) => set({ minutesPerDay: e.target.value })}
            />
            분
          </div>
          <p className="num text-[12.5px] text-fg-soft">
            {pages}쪽 · 예상 총 {Math.round(pages * MIN_PER_PAGE)}분 (1쪽 약 2.5분) · 하루{' '}
            {f.minutesPerDay}분이면 약{' '}
            {Math.ceil((pages * MIN_PER_PAGE) / Math.max(1, f.minutesPerDay))}일
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-3">
          <fieldset>
            <legend className="mb-2 text-[13px] font-semibold">④ 어떤 요일에, 언제까지?</legend>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  className="chip"
                  aria-pressed={f.days.includes(d)}
                  onClick={() =>
                    set({
                      days: f.days.includes(d)
                        ? f.days.filter((x) => x !== d)
                        : [...f.days, d].sort(),
                    })
                  }
                >
                  {DAY_NAMES[d]}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="num flex flex-wrap items-center gap-2 text-[13px]">
            <input
              aria-label="시작 날짜"
              type="date"
              min={today}
              className="rounded-lg border border-line-2 bg-bg px-2 py-1"
              value={f.startDate}
              onChange={(e) => set({ startDate: e.target.value })}
            />
            ~
            <input
              aria-label="끝 날짜"
              type="date"
              min={f.startDate}
              className="rounded-lg border border-line-2 bg-bg px-2 py-1"
              value={f.endDate}
              onChange={(e) => set({ endDate: e.target.value })}
            />
          </div>
        </div>
      )}

      {step === 4 && p && (
        <div className="flex flex-col gap-3">
          <dl className="num grid gap-1.5 rounded-xl border border-line-2 p-3 text-[12.5px] sm:grid-cols-2">
            {[
              [0, '과목', p.summary.subjectName],
              [
                1,
                '자료·범위',
                `${p.summary.materialName} p.${p.summary.from}–${p.summary.to} (${p.summary.pages}쪽)`,
              ],
              [
                2,
                '목표',
                `하루 ${p.summary.minutesPerDay}분 · 예상 총 ${p.summary.totalMinutes}분`,
              ],
              [
                3,
                '요일·기간',
                `${p.summary.days.map((d) => DAY_NAMES[d]).join('·')} · ${fmtShort(p.summary.startDate)}~${fmtShort(p.summary.endDate)}`,
              ],
            ].map(([i, k, v]) => (
              <div key={k} className="flex items-start justify-between gap-2">
                <span>
                  <dt className="text-[11px] text-fg-2">{k}</dt>
                  <dd>{v}</dd>
                </span>
                <button
                  type="button"
                  className="text-[11px] text-fg-2 underline"
                  onClick={() => setStep(i)}
                >
                  {i + 1}단계 수정
                </button>
              </div>
            ))}
          </dl>
          <section className="ai-box" aria-label="이렇게 넣을게요">
            <span className="ai-chip">AI</span>
            <h3 className="flex items-center gap-2 font-sans text-[13px] font-semibold">
              이렇게 넣을게요 <MockBadge />
            </h3>
            <ul className="flex flex-col gap-1.5">
              {p.placements.map((x) => (
                <li
                  key={x.date}
                  className="num flex flex-wrap items-baseline gap-x-2 text-[12.5px]"
                >
                  <b className="font-semibold">
                    {fmtShort(x.date)} {x.start}–{x.end}
                  </b>
                  p.{x.from}–{x.to} · {x.minutes}분
                  <span className="text-[11.5px] text-fg-2">· {x.reason}</span>
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-fg-soft">{p.note}</p>
          </section>
        </div>
      )}
    </Modal>
  );
}
