// S4 단원 확인 — 신민종
import { Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import AiBox from '@/components/common/AiBox.jsx';
import Button from '@/components/common/Button.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import Tabs from '@/components/common/Tabs.jsx';
import PdfThumb from '@/components/setup/PdfThumb.jsx';
import SetupHead from '@/components/setup/SetupHead.jsx';
import { UnitEditRow } from '@/components/setup/UnitRows.jsx';
import { moveItem, patchItem, removeItem, unitRangeValid } from '@/lib/unitList.js';
import { DIFFICULTY } from '@/config/labels.js';
import { useAllUnits, useMaterials, useSaveUnits, useUnitExam } from '@/hooks/usePlan.js';
import { useMaterialStore } from '@/stores/materialStore.js';

function Evidence({ subjectId, data, unit, materials }) {
  const files = useMaterialStore((s) => s.files);
  const doneFile = materials?.subjects
    .find((s) => s.id === subjectId)
    ?.files.filter((f) => f.status === 'done')
    .at(-1);
  const file = doneFile ? files[doneFile.id] : null;
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
  const total = data.file.pages;
  const main = data.units.filter((u) => !u.quizless && u.from && u.to);

  return (
    <AiBox label="AI">
      <h2 className="text-[15px]">PDF를 어떻게 나눴는지</h2>
      <p className="num text-xs text-fg-2">
        {data.file.name} · {total}페이지 · 단원 경계
      </p>
      <div
        className="flex h-6 overflow-hidden rounded-sm border border-line"
        role="img"
        aria-label="단원 경계"
      >
        {main.map((u) => (
          <span
            key={u.id}
            className={`grid place-items-center border-r border-line text-[10.5px] last:border-r-0 ${u.id === unit?.id ? 'bg-ink text-ink-fg' : 'bg-surface-2 text-fg-2'}`}
            style={{ width: `${((u.to - u.from + 1) / total) * 100}%` }}
          >
            {u.no}
          </span>
        ))}
      </div>
      {unit && !unit.quizless && (
        <>
          <div className="flex justify-center gap-3">
            <PdfThumb file={file} page={2} label="p.2 목차" width={120} />
            <PdfThumb
              file={file}
              page={unit.from}
              label={`p.${unit.from} 단원 시작 페이지`}
              width={120}
            />
          </div>
          <h3 className="text-[14px]">{unit.no}단원을 이렇게 나눴어요</h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-[13px]">
            {unit.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          {/* TODO(확인필요): [백엔드 확정 필요] AI가 근거로 쓴 위치의 좌표가 오면 미리보기에 테두리 박스를 그려요 */}
        </>
      )}
      {unit?.quizless && (
        <p className="text-[13px] text-fg-2">
          목차를 직접 입력한 범위라 PDF 근거가 없어요. 이 범위는 퀴즈에서 빠져요.
        </p>
      )}
      {url ? (
        <a className="btn btn-sm self-start" href={url} target="_blank" rel="noreferrer">
          원본 PDF 열기
        </a>
      ) : (
        <p className="text-xs text-fg-3">이 화면에서 올린 PDF가 있으면 실제 페이지가 보여요.</p>
      )}
    </AiBox>
  );
}

// 시험 범위 체크 (PDF-08): 빼면 서버가 계획·S5 분량·퀴즈·진도율에서 빼요
function ExamCheck({ checked, disabled, label, onChange }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`grid h-5 w-5 place-items-center rounded-md border transition-colors ${checked ? 'border-brand bg-brand text-brand-fg' : 'border-line-2 text-transparent hover:border-fg-soft'}`}
    >
      <Check size={12} strokeWidth={3} aria-hidden="true" />
    </button>
  );
}

export default function S4Units() {
  const navigate = useNavigate();
  const { data: materials } = useMaterials();
  const subjects = materials?.subjects ?? [];
  const results = useAllUnits(subjects.map((s) => s.id));
  const save = useSaveUnits();
  const exam = useUnitExam();
  const [tab, setTab] = useState(null);
  const [drafts, setDrafts] = useState({}); // { subjectId: units[] } 고친 과목만
  const [editing, setEditing] = useState(null); // 고치는 중인 줄 번호
  const [picked, setPicked] = useState({}); // { subjectId: 고른 줄 번호 }

  if (!materials || results.some((r) => r.isPending))
    return <LoadingState title="AI가 나눈 단원을 불러오는 중이에요" />;
  if (results.some((r) => r.isError))
    return <ErrorState onRetry={() => results.forEach((r) => r.refetch())} />;

  const subjectId = tab ?? subjects[0].id;
  const idx = subjects.findIndex((s) => s.id === subjectId);
  const data = results[idx].data;
  const units = drafts[subjectId] ?? data.units;
  const setUnits = (fn) => setDrafts((d) => ({ ...d, [subjectId]: fn(units) }));
  const sel = units[picked[subjectId] ?? 0];
  const allValid = Object.values(drafts).every((list) => list.every(unitRangeValid));
  // 시험 범위는 서버 값 (단원 번호 기준). 체크를 보낼 자료는 그 과목에서 분석이 끝난 강의자료
  const inExam = (no) => data.units.find((u) => u.no === no)?.inExam ?? true;
  const files = materials.subjects.find((s) => s.id === subjectId)?.files ?? [];
  const material =
    files.filter((f) => f.status === 'done' && !f.quizless).at(-1) ??
    files.find((f) => f.status === 'done');
  const inUnits = data.units.filter((u) => u.inExam);
  const inPages = inUnits.reduce((n, u) => n + (u.from && u.to ? u.to - u.from + 1 : 0), 0);
  const toggleExam = (u) =>
    exam.mutate(
      { materialId: material.id, unitNo: u.no, inExam: !inExam(u.no) },
      { onError: (e) => toast.error(e.message) },
    );

  const onNext = async () => {
    try {
      for (const [id, list] of Object.entries(drafts))
        await save.mutateAsync({ subjectId: id, units: list });
      navigate(ROUTES.s5);
    } catch (e) {
      toast.error(`저장하지 못했어요. ${e.message}`);
    }
  };

  return (
    <>
      <SetupHead
        title="AI가 나눈 단원이 맞는지 봐 주세요"
        desc="처음에는 모든 단원이 시험 범위로 체크되어 있어요. 빼고 싶은 단원만 체크를 풀면 그 단원은 계획·퀴즈·진도율에서 빠져요."
      >
        <Button onClick={() => navigate(ROUTES.s3)}>이전</Button>
        <Button variant="primary" disabled={!allValid || save.isPending} onClick={onNext}>
          {save.isPending ? '저장하는 중…' : '다음: 분량 확인'}
        </Button>
      </SetupHead>
      <Tabs
        label="과목"
        items={subjects.map((s) => ({ value: s.id, label: s.name }))}
        value={subjectId}
        onChange={(v) => {
          setTab(v);
          setEditing(null);
        }}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AiBox label="AI" className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[15px]">AI가 분해한 단원·개념·페이지</h2>
            <span className="num text-[11.5px] text-fg-2">
              {data.units.length}단원 · 시험 범위 {inUnits.length}/{data.units.length} 단원 ·{' '}
              {inPages}p · 난이도는 AI 추정
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] [&_td]:border-b [&_td]:border-line [&_td]:px-2 [&_td]:py-2 [&_th]:px-2 [&_th]:pb-1 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-fg-2">
              <thead>
                <tr>
                  <th>단원</th>
                  <th>개념</th>
                  <th>페이지</th>
                  <th>시험 범위</th>
                  <th>난이도</th>
                  <th>동작</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u, i) =>
                  editing === i ? (
                    <tr key={u.id ?? i}>
                      <td colSpan={6}>
                        <UnitEditRow
                          unit={u}
                          index={i}
                          count={units.length}
                          onChange={(patch) => setUnits((x) => patchItem(x, i, patch))}
                          onMove={(d) => {
                            setUnits((x) => moveItem(x, i, d));
                            setEditing(i + d);
                          }}
                          onDelete={() => {
                            setUnits((x) => removeItem(x, i));
                            setEditing(null);
                          }}
                          onDone={() => setEditing(null)}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={u.id ?? i}
                      className={`${(picked[subjectId] ?? 0) === i ? 'bg-surface-2' : ''} ${inExam(u.no) ? '' : '[&>td:not(:nth-child(4))]:opacity-45'}`}
                    >
                      <td className="font-medium">
                        {u.no}. {u.title}
                        {u.quizless && <span className="badge ml-1.5">퀴즈 없음</span>}
                      </td>
                      <td className="text-fg-2">{u.concepts.join(', ') || '-'}</td>
                      <td className="num whitespace-nowrap">
                        {u.from && u.to ? `p.${u.from}–${u.to}` : '-'}
                      </td>
                      <td>
                        <ExamCheck
                          checked={inExam(u.no)}
                          disabled={!material || exam.isPending}
                          label={`${u.no}단원 ${u.title} 시험 범위`}
                          onChange={() => toggleExam(u)}
                        />
                      </td>
                      <td>{u.difficulty ? DIFFICULTY[u.difficulty] : '-'}</td>
                      <td className="whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPicked((p) => ({ ...p, [subjectId]: i }))}
                        >
                          PDF
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(i)}>
                          수정
                        </Button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          <Button
            size="sm"
            className="self-start"
            onClick={() => {
              setUnits((x) => [
                ...x,
                {
                  id: `${subjectId}-new${x.length + 1}`,
                  no: x.length + 1,
                  title: '새 단원',
                  concepts: [],
                  from: null,
                  to: null,
                  difficulty: null,
                  quizless: false,
                  evidence: [],
                },
              ]);
              setEditing(units.length);
            }}
          >
            + 단원 추가
          </Button>
        </AiBox>
        <Evidence subjectId={subjectId} data={data} unit={sel} materials={materials} />
      </div>
    </>
  );
}
