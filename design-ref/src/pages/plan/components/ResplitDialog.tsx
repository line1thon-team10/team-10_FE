import { useState } from "react";
import AiWait from "@/components/feature/AiWait";

const QUICK_ANSWERS = ["평일에 나눠서", "일요일로", "직접 입력"];

type Message = {
  id: string;
  role: "ai" | "user";
  text: string;
};

type Props = {
  subjectLabel: string;
  onCancel: () => void;
  onSubmit: (request: string) => void;
};

export default function ResplitDialog({ subjectLabel, onCancel, onSubmit }: Props) {
  const [text, setText] = useState("");
  const [running, setRunning] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "m-first", role: "user", text: "토요일은 약속 있어서 짧게 하고 싶어" },
    { id: "m-second", role: "ai", text: "토요일 분량은 평일에 나눌까요, 일요일로 몰까요?" },
  ]);

  const send = () => {
    const value = text.trim();
    if (!value) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: value },
      {
        id: `a-${Date.now()}`,
        role: "ai",
        text: "알겠어요. 토요일 분량을 수업이 끝난 화·목 오후로 30분씩 나눠서 다시 짤게요.",
      },
    ]);
    setText("");
  };

  return (
    <div
      className="ps-overlay"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="ps-modal ps-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-label="어떻게 다시 나눌까요?"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-[19px] text-[var(--ps-ink)]">어떻게 다시 나눌까요?</h2>
        <p className="mt-2 text-[12px] leading-relaxed text-[var(--ps-muted)]">
          직접 정한 분량·목표·일정·단원은 그대로 두고, 태스크 분할과 날짜 배치만 새로 짜요.
        </p>

        <div className="ps-resplit-box mt-4">
          {running ? (
            <AiWait
              tone="plan"
              bare
              label="AI가 태스크와 날짜를 다시 나누고 있어요"
              onDone={() => onSubmit(text.trim())}
            >
              <p className="text-[12px] leading-relaxed text-[var(--ps-muted)]">
                저장된 다시 나누기 결과를 적용할 준비가 됐어요.
              </p>
            </AiWait>
          ) : (
            <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="ps-ai-mark">AI</span>
            <span className="text-[11.5px] font-semibold text-[var(--ps-ink)]">
              요청 한 줄 · 비워 두면 다른 버전으로 다시 나눠요
            </span>
          </div>

          <div className="mt-3 flex max-h-[190px] flex-col gap-2 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`ps-bubble ${
                    message.role === "user" ? "ps-bubble--user" : "ps-bubble--ai"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {QUICK_ANSWERS.map((answer) => (
              <button
                key={answer}
                type="button"
                onClick={() => setText(answer)}
                className={`cursor-pointer whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  answer === "평일에 나눠서"
                    ? "border-transparent bg-[var(--ps-solid)] text-[var(--ps-solid-ink)]"
                    : "border-[var(--ps-line-strong)] text-[var(--ps-ink-soft)] hover:border-[var(--ps-ink-soft)]"
                }`}
              >
                {answer}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-stretch gap-2">
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  send();
                }
              }}
              placeholder="예: 알바 없는 화·목에 조금 더 넣어 줘"
              aria-label={`${subjectLabel} 다시 나누기 요청`}
              className="ps-field box-border min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={send}
              disabled={!text.trim()}
              className="ps-btn-solid shrink-0 px-3.5 py-2 text-[12px] disabled:cursor-not-allowed disabled:opacity-40"
            >
              보내기
            </button>
          </div>

          <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--ps-muted)]">
            요청이 애매할 때만 AI가 한 번 더 물어봐요 (최대 1개)
          </p>
            </>
          )}
        </div>

        <ol className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-[var(--ps-muted)]">
          <li className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--ps-line-strong)] text-[9px] leading-none">
              1
            </span>
            태스크 다시 나누기
          </li>
          <li className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--ps-line-strong)] text-[9px] leading-none">
              2
            </span>
            날짜 배치
          </li>
          <li className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[var(--ps-line-strong)] text-[9px] leading-none">
              3
            </span>
            기존 안과 비교
          </li>
        </ol>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} className="ps-btn-ghost">
            닫기
          </button>
          <button
            type="button"
            onClick={() => setRunning(true)}
            disabled={running}
            className="ps-btn-solid disabled:cursor-not-allowed disabled:opacity-45"
          >
            {running ? "다시 나누는 중" : "다시 나누기"}
          </button>
        </div>
      </div>
    </div>
  );
}