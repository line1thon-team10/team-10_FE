// S3 PDF 업로드 — 신민종
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import AiBox from '@/components/common/AiBox.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import { ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import AiWait from '@/components/common/AiWait.jsx';
import StepProgress from '@/components/common/StepProgress.jsx';
import SetupHead from '@/components/setup/SetupHead.jsx';
import { useAiWait } from '@/hooks/useAiWait.js';
import { useJob, useMaterials, useUpload } from '@/hooks/usePlan.js';
import { useMaterialStore } from '@/stores/materialStore.js';

const FILE_STATUS = { running: '분석 중', done: '분석 완료', failed: '실패' };
// 스캔본은 글자 인식으로 분석해요 (PDF-01·07)
const fileStatus = (f) =>
  f.ocr
    ? { running: '글자 읽는 중', done: '글자 인식으로 분석 완료', failed: '실패' }[f.status]
    : FILE_STATUS[f.status];

function cardStatus(files) {
  if (!files.length) return '대기';
  if (files.some((f) => f.status === 'running')) return '분석 중';
  const failed = files.filter((f) => f.status === 'failed').length;
  if (failed) return `${failed}개 실패`;
  return '분석 완료';
}

function DropZone({ subjectId, onFile }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const pick = (list) => [...(list ?? [])].forEach((f) => onFile(subjectId, f));
  return (
    <div
      className={`grid place-items-center rounded-xl border border-dashed px-3 py-5 text-center text-[13px] ${over ? 'border-brand-line bg-brand-tint text-brand-deep' : 'border-line-2 text-fg-2'}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        pick(e.dataTransfer.files);
      }}
    >
      <button
        type="button"
        className="underline underline-offset-4"
        onClick={() => inputRef.current?.click()}
      >
        파일을 끌어다 놓거나 눌러서 선택
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="sr-only"
        aria-label="PDF 파일 선택"
        onChange={(e) => pick(e.target.files)}
      />
    </div>
  );
}

function SubjectCard({ subject, selected, onSelect, onFile, navigate }) {
  const status = cardStatus(subject.files);
  const quizless = subject.files.filter((f) => f.quizless && f.status === 'done');
  return (
    <Card className={`flex flex-col gap-3 ${selected ? 'border-fg-2' : ''}`} onClick={onSelect}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px]">
          <span
            className="h-3 w-1 rounded-full"
            style={{ background: subject.color }}
            aria-hidden="true"
          />
          {subject.name}
        </h2>
        <span className="flex flex-wrap justify-end gap-1">
          {quizless.length > 0 && <span className="badge">{quizless.length}개 퀴즈 없음</span>}
          <span className={status === '분석 완료' ? 'badge badge-strong' : 'badge'}>{status}</span>
        </span>
      </div>
      {subject.files.map((f) =>
        f.status === 'failed' ? (
          <div
            key={f.id}
            className="flex flex-col gap-2 rounded-sm border border-st-risk p-3 text-[13px]"
          >
            <p>
              <b>{f.name}</b>는 글자를 읽을 수 없었어요. 목차를 직접 입력하면 계획과 기록은 그대로
              쓸 수 있어요. 직접 입력한 범위는 퀴즈에서 빠져요.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={(e) => (
                  e.stopPropagation(),
                  document.getElementById(`drop-${subject.id}`)?.querySelector('input')?.click()
                )}
              >
                다른 파일 올리기
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() =>
                  navigate(
                    `${ROUTES.s3_2}?subject=${subject.id}&file=${encodeURIComponent(f.name)}`,
                  )
                }
              >
                목차 직접 입력 (이 범위는 퀴즈 없음)
              </Button>
            </div>
          </div>
        ) : (
          <div key={f.id} className="flex flex-col gap-1 rounded-xl bg-bg-2 px-3 py-2.5">
            <p className="num text-[12.5px] text-fg-soft">
              {f.name}
              {f.pages ? ` · ${f.pages}페이지` : ''} · {fileStatus(f)}
            </p>
            {f.status === 'done' && (
              <span className={`text-[11.5px] ${f.quizless ? 'text-fg-2' : 'text-brand-deep'}`}>
                {f.quizless ? '퀴즈 없음' : '퀴즈 가능'}
              </span>
            )}
          </div>
        ),
      )}
      {quizless.length > 0 && (
        <p className="text-[11.5px] text-fg-2">
          글자 인식으로 읽은 파일은 정확도가 낮을 수 있어서 이 파일 범위는 퀴즈가 나오지 않아요.
          계획·기록·책 쌓기에는 그대로 들어가요.
        </p>
      )}
      <div id={`drop-${subject.id}`}>
        <DropZone subjectId={subject.id} onFile={onFile} />
      </div>
    </Card>
  );
}

function JobPanel({ jobId, subjectName, startedAt }) {
  const { data: job } = useJob(jobId);
  const wait = useAiWait(startedAt, job?.status === 'running');
  return (
    <AiBox label="AI">
      <h2 className="text-[15px]">{subjectName} 분석 진행</h2>
      {!job ? (
        <p className="text-sm text-fg-2">분석을 시작하고 있어요…</p>
      ) : (
        <>
          <StepProgress
            steps={job.steps}
            current={job.current}
            failed={job.failedStep}
            done={job.status === 'done'}
          />
          <p className="num text-xs text-fg-2">
            {job.status === 'failed' ? `실패 · ${job.reason}` : `${job.progress}%`} ·{' '}
            {job.reused
              ? '저장해 둔 분석 결과를 다시 썼어요'
              : '한 번 분석한 파일은 저장해 두고 다시 쓰지 않아요'}
          </p>
          {job.status === 'running' && (
            <AiWait
              phase={wait}
              label="AI가 PDF를 읽고 있어요"
              lines={false}
              retryNote="응답이 30초 넘게 없어요. 잠시 뒤 같은 파일을 다시 올려 주세요. 저장된 결과가 있으면 바로 불러와요."
            />
          )}
        </>
      )}
    </AiBox>
  );
}

export default function S3Upload() {
  const navigate = useNavigate();
  const { data, isPending, isError, refetch } = useMaterials();
  const upload = useUpload();
  const setFile = useMaterialStore((s) => s.setFile);
  const [selected, setSelected] = useState(null);
  const [active, setActive] = useState(null); // { jobId, subjectId, startedAt }

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const onFile = (subjectId, file) =>
    upload.mutate(
      { subjectId, file },
      {
        onSuccess: ({ jobId, materialId }) => {
          setFile(materialId, file); // S4 근거 미리보기용 (이 브라우저 메모리에만)
          setSelected(subjectId);
          setActive({ jobId, subjectId, startedAt: Date.now() });
        },
        onError: (e) => toast.error(e.message),
      },
    );

  const shown =
    data.subjects.find((s) => s.id === (selected ?? active?.subjectId)) ?? data.subjects[0];
  const shownJob = active?.subjectId === shown?.id ? active : null;
  const lastFile = shown?.files.at(-1);

  return (
    <>
      <SetupHead
        title="과목별 강의자료를 올려 주세요"
        desc="텍스트가 있는 PDF, PPT를 PDF로 바꾼 파일을 올려 주세요. 스캔본은 글자 인식으로 읽고, 그 범위는 퀴즈 없이 계획에만 넣어요."
      >
        <Button onClick={() => navigate(ROUTES.s2)}>이전</Button>
        <Button variant="primary" onClick={() => navigate(ROUTES.s4)}>
          다음: 단원 확인
        </Button>
      </SetupHead>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.subjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              selected={s.id === shown?.id}
              onSelect={() => setSelected(s.id)}
              onFile={onFile}
              navigate={navigate}
            />
          ))}
        </div>
        <aside className="flex flex-col gap-4">
          {shownJob ? (
            <JobPanel
              key={shownJob.jobId}
              jobId={shownJob.jobId}
              subjectName={shown.name}
              startedAt={shownJob.startedAt}
            />
          ) : lastFile?.jobId ? (
            <JobPanel
              key={lastFile.jobId}
              jobId={lastFile.jobId}
              subjectName={shown.name}
              startedAt={null}
            />
          ) : (
            <AiBox label="AI">
              <p className="text-sm text-fg-2">
                파일을 올리면 텍스트 읽기 → 목차 찾기 → 개념 추출 → 개념별 페이지 연결 순서로
                분석해요. 스캔본은 첫 단계가 글자 읽는 중(글자 인식)이에요.
              </p>
            </AiBox>
          )}
        </aside>
      </div>
    </>
  );
}
