// DEV 개발용 페이지 — 화면 목록, 목업 초기화, 공통 부품 미리보기 — 신민종
import { Link } from 'react-router';
import { toast } from 'sonner';
import { SCREENS } from '@/app/screens.js';
import BookBlock from '@/components/book/BookBlock.jsx';
import AiBox from '@/components/common/AiBox.jsx';
import Badge, { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import Chip from '@/components/common/Chip.jsx';
import ProgressBar from '@/components/common/ProgressBar.jsx';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/StateView.jsx';
import StepProgress from '@/components/common/StepProgress.jsx';
import SubjectTag from '@/components/common/SubjectTag.jsx';
import { ENV } from '@/config/env.js';
import { BLOCK_STATE } from '@/config/labels.js';
import { fmtFull } from '@/config/date.js';
import { useDemoState, useNextDay, useResetDemo } from '@/hooks/useDemo.js';
import { useUiStore } from '@/stores/uiStore.js';

const GROUPS = [
  ['setup', '최초 1회'],
  ['daily', '매일 반복'],
];

function ScreenRow({ s }) {
  const openModal = useUiStore((st) => st.openModal);
  let action;
  if (s.kind === 'modal')
    action = (
      <Button size="sm" onClick={() => openModal(s.id)}>
        팝업 열기
      </Button>
    );
  else if (s.kind === 'toast')
    action = (
      <Button size="sm" onClick={() => toast('책 1권 쌓였어요 · 컴퓨터네트워크 2단원 · 오늘 58%')}>
        알림 띄우기
      </Button>
    );
  else
    action = (
      <Link className="btn btn-sm" to={s.path}>
        {s.kind === 'state' ? '홈에서 보기' : '열기'}
      </Link>
    );
  return (
    <tr>
      <td className="num font-semibold">{s.id}</td>
      <td>{s.name}</td>
      <td className="num text-fg-2">{s.path ?? `(${s.kind})`}</td>
      <td>
        <Badge tone={s.prio === 'Must' ? 'strong' : 'default'}>{s.prio}</Badge>
      </td>
      <td className="num">{s.due}</td>
      <td className="text-right">{action}</td>
    </tr>
  );
}

export default function DevPage() {
  const { data } = useDemoState();
  const nextDay = useNextDay();
  const reset = useResetDemo();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold">개발용 페이지</h1>
        <Badge tone={ENV.useMock ? 'mock' : 'strong'}>
          {ENV.useMock ? '목업 켜짐' : '실제 서버'}
        </Badge>
        <span className="text-sm text-fg-2">데모 날짜 {data ? fmtFull(data.today) : '…'}</span>
        <span className="flex-1" />
        <Button size="sm" onClick={() => nextDay.mutate()} disabled={nextDay.isPending}>
          다음 날로
        </Button>
        <Button
          size="sm"
          onClick={() =>
            reset.mutate(undefined, {
              onSuccess: () => toast('시드 데이터로 되돌렸어요 (11/9 오후 5시)'),
            })
          }
          disabled={reset.isPending}
        >
          시드 초기화
        </Button>
      </div>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">화면 목록 · {SCREENS.length}개</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] [&_td]:border-b [&_td]:border-line [&_td]:px-2.5 [&_td]:py-2 [&_td]:whitespace-nowrap [&_th]:px-2.5 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-fg-2">
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>주소</th>
                <th>우선순위</th>
                <th>만들 날짜</th>
                <th />
              </tr>
            </thead>
            {GROUPS.map(([g, label]) => (
              <tbody key={g}>
                <tr>
                  <td colSpan={6} className="label pt-4">
                    {label}
                  </td>
                </tr>
                {SCREENS.filter((s) => s.group === g).map((s) => (
                  <ScreenRow key={s.id} s={s} />
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">공통 부품 미리보기</h2>
          <span className="text-xs text-fg-3">부품 견본이에요. 실제 화면이 아니에요.</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary">기본 버튼</Button>
          <Button>보조 버튼</Button>
          <Button variant="ghost">글자 버튼</Button>
          <Button disabled>못 누름</Button>
          <Chip pressed>선택된 칩</Chip>
          <Chip>칩</Chip>
          <Badge>Should</Badge>
          <Badge tone="strong">Must</Badge>
          <MockBadge />
        </div>
        <div className="flex flex-wrap gap-4">
          <SubjectTag name="자료구조" color="#4F46E5" />
          <SubjectTag name="운영체제" color="#2563EB" />
          <SubjectTag name="컴퓨터네트워크" color="#7C3AED" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="label">책 블록 상태 6개 (정의서 4-5)</span>
            {Object.entries(BLOCK_STATE).map(([key, v]) => (
              <div key={key} className="grid grid-cols-[80px_1fr] items-center gap-3 text-[13px]">
                <BookBlock state={key} />
                <span>
                  {v.label}
                  {v.signal ? ` · ${v.signal}` : ''}
                </span>
              </div>
            ))}
          </div>
          <AiBox label="AI 분석">
            <StepProgress
              steps={['텍스트 읽기', '목차 찾기', '개념 추출', '개념별 페이지 연결']}
              current={2}
            />
          </AiBox>
          <div className="flex flex-col gap-3">
            <span className="label">진행률 (기준선 70%)</span>
            <ProgressBar value={58} mark={70} label="오늘 계획 58%" />
            <StepProgress steps={['텍스트 읽기', '목차 찾기']} current={1} failed={1} />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <LoadingState title="계획을 만들고 있어요" />
          <ErrorState
            title="채점을 하지 못했어요"
            description="잠시 뒤 다시 시도해 주세요."
            onRetry={() => {}}
          />
          <EmptyState title="아직 틀린 문제가 없어요" description="퀴즈를 풀면 여기에 모여요." />
        </div>
      </Card>
    </div>
  );
}
