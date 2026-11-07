// S3-2 목차 직접 입력 — 신민종
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import AiBox from '@/components/common/AiBox.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import { UnitEditRow } from '@/components/setup/UnitRows.jsx';
import { moveItem, patchItem, removeItem, unitRangeValid } from '@/lib/unitList.js';
import { useSaveUnits, useToc, useUnits } from '@/hooks/usePlan.js';

export default function S3_2Toc() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const subjectId = params.get('subject') ?? 'net';
  const fileName = params.get('file') ?? '컴퓨터네트워크_보충자료_스캔본.pdf';
  const { data: current } = useUnits(subjectId);
  const toc = useToc();
  const save = useSaveUnits();
  const [text, setText] = useState('');
  const [rows, setRows] = useState([]);

  const organize = () =>
    toc.mutate(
      { subjectId, text },
      {
        onSuccess: (units) =>
          setRows(
            units.map((u) => ({
              ...u,
              title: u.title.startsWith('보충') ? u.title : `보충 ${u.no}. ${u.title}`,
            })),
          ),
        onError: (e) => toast.error(e.message),
      },
    );

  const valid = rows.length > 0 && rows.every(unitRangeValid);
  const onSave = () => {
    const main = (current?.units ?? []).filter((u) => !u.quizless);
    const extra = rows.map((r, i) => ({
      id: `${subjectId}-toc${i + 1}`,
      title: r.title,
      from: r.from,
      to: r.to,
      concepts: [],
      difficulty: null,
      quizless: true,
    }));
    save.mutate(
      { subjectId, units: [...main, ...extra].map((u, i) => ({ ...u, no: i + 1 })) },
      {
        onSuccess: () => {
          toast('목차를 저장했어요. 이 범위는 퀴즈 없이 계획에만 들어가요');
          navigate(ROUTES.s4);
        },
        onError: (e) => toast.error(e.message),
      },
    );
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">보충자료 목차를 직접 입력해 주세요</h1>
        <p className="text-fg-2">{fileName}의 글자를 읽지 못해서 직접 입력으로 바꿨어요.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-4">
          <AiBox label="AI">
            <label htmlFor="toc-text" className="text-sm font-semibold">
              목차 붙여넣기 → AI가 단원으로 정리
            </label>
            <textarea
              id="toc-text"
              rows={5}
              className="w-full rounded-sm border border-line px-3 py-2"
              placeholder={
                '강의계획서나 교재 목차를 그대로 붙여넣어도 돼요\n예) 1. 서브넷 계산 연습 p.1-5'
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button
              className="self-start"
              disabled={!text.trim() || toc.isPending}
              onClick={organize}
            >
              {toc.isPending ? '정리하는 중…' : '단원으로 정리하기'}
            </Button>
          </AiBox>
          <Card className="flex flex-col gap-2">
            <h2 className="font-semibold">정리된 단원 (직접 고칠 수 있어요)</h2>
            {rows.length === 0 && (
              <p className="text-sm text-fg-3">목차를 정리하면 여기에 단원이 나와요.</p>
            )}
            {rows.map((r, i) => (
              <UnitEditRow
                key={i}
                unit={r}
                index={i}
                count={rows.length}
                onChange={(patch) => setRows((x) => patchItem(x, i, patch))}
                onMove={(d) => setRows((x) => moveItem(x, i, d))}
                onDelete={() => setRows((x) => removeItem(x, i))}
              />
            ))}
            <Button
              size="sm"
              className="self-start"
              onClick={() =>
                setRows((x) => [
                  ...x,
                  { no: x.length + 1, title: `보충 ${x.length + 1}. `, from: null, to: null },
                ])
              }
            >
              + 단원 한 줄씩 추가
            </Button>
            <p className="text-xs text-fg-2">밀림 기준은 페이지로 계산하니 페이지를 적어 주세요.</p>
          </Card>
        </div>
        <aside>
          <Card className="flex flex-col gap-2">
            <h2 className="font-semibold">퀴즈 없는 모드</h2>
            <p className="text-[13px] text-fg-2">
              이 파일 범위는 계획·기록·책 쌓기만 돼요. 오늘의 퀴즈와 문제 뽑기에서는 빠져요.
              강의자료 PDF 범위는 퀴즈 그대로예요.
            </p>
          </Card>
        </aside>
      </div>
      <div className="flex justify-between gap-2">
        <Button onClick={() => navigate(ROUTES.s3)}>이전</Button>
        <Button variant="primary" disabled={!valid || save.isPending} onClick={onSave}>
          저장하고 다음
        </Button>
      </div>
    </>
  );
}
