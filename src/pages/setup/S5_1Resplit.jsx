// S5-1 다시 나누기 요청 — 신민종
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '@/app/screens.js';
import AiBox from '@/components/common/AiBox.jsx';
import { AiFail, AiProgress } from '@/components/common/AiProgress.jsx';
import Button from '@/components/common/Button.jsx';
import Card from '@/components/common/Card.jsx';
import Chip from '@/components/common/Chip.jsx';
import SetupHead from '@/components/setup/SetupHead.jsx';
import { useResplitRequest } from '@/hooks/usePlan.js';

const STEPS = ['태스크 다시 나누기', '날짜 배치', '기존 안과 비교'];

function Bubble({ who, children }) {
  return (
    <p
      className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] ${who === 'user' ? 'self-end bg-ink text-ink-fg' : 'self-start border border-line-2'}`}
    >
      {children}
    </p>
  );
}

export default function S5_1Resplit() {
  const navigate = useNavigate();
  const ask = useResplitRequest();
  const [text, setText] = useState('');
  const [asked, setAsked] = useState(null); // { request, question } 후속 질문은 최대 1번
  const input = useRef(null);

  const send = (vars) =>
    ask.mutate(vars, {
      onSuccess: (data) => {
        if (data.question) {
          setAsked({ request: vars.request, question: data.question });
          setText('');
        } else navigate(ROUTES.s5_2);
      },
    });
  const submit = (answer) =>
    send(asked ? { request: asked.request, answer } : { request: text.trim() });

  let body;
  if (ask.isPending)
    body = (
      <AiProgress
        steps={STEPS}
        label="AI가 태스크와 날짜를 다시 나누고 있어요"
        onSaved={() => send({ saved: true })}
      />
    );
  else if (ask.isError)
    body = (
      <AiFail
        message="다시 나누지 못했어요 · 지금 계획은 그대로예요"
        onRetry={() => send(ask.variables)}
        onSaved={() => send({ saved: true })}
      />
    );
  else
    body = (
      <>
        <p className="text-[12.5px] font-semibold">
          요청 한 줄 · 비워 두면 다른 버전으로 다시 나눠요
        </p>
        {asked && (
          <div className="flex flex-col gap-2">
            {asked.request && <Bubble who="user">{asked.request}</Bubble>}
            <Bubble who="ai">{asked.question.text}</Bubble>
            <div className="flex flex-wrap gap-1.5">
              {asked.question.choices.map((c) => (
                <Chip key={c} onClick={() => submit(c)}>
                  {c}
                </Chip>
              ))}
              <Chip onClick={() => input.current?.focus()}>직접 입력</Chip>
            </div>
          </div>
        )}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit(text.trim());
          }}
        >
          <input
            ref={input}
            className="min-w-0 flex-1 rounded-lg border border-line-2 bg-bg px-3 py-2 text-[13px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={asked ? '직접 입력해도 돼요' : '예: 토요일은 약속 있어서 쉬고 싶어'}
            aria-label="다시 나누기 요청"
          />
          <Button type="submit" variant="primary" disabled={asked && !text.trim()}>
            다시 나누기
          </Button>
        </form>
        <p className="text-[11px] text-fg-3">
          요청이 애매할 때만 AI가 한 번 더 물어봐요 (최대 1개)
        </p>
      </>
    );

  return (
    <>
      <SetupHead
        title="어떻게 다시 나눌까요?"
        desc="직접 정한 분량·목표·일정·단원은 그대로 두고, 태스크 분할과 날짜 배치만 새로 짜요."
      >
        <Button onClick={() => navigate(ROUTES.s5)}>이전</Button>
      </SetupHead>
      <Card className="mx-auto flex w-full max-w-[640px] flex-col gap-3">
        <AiBox label="AI 다시 나누기">{body}</AiBox>
        {!ask.isPending && (
          <ol className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fg-2">
            {STEPS.map((s, i) => (
              <li key={s}>
                {i + 1}. {s}
              </li>
            ))}
          </ol>
        )}
      </Card>
    </>
  );
}
