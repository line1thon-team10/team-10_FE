import { useEffect, useRef, useState, type FormEvent } from "react";
import { planSubjects } from "@/mocks/planSetup";
import type { PlanSubject } from "@/pages/plan/types";

type ChatLine = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type Props = {
  onImport: (list: PlanSubject[]) => void;
  onUpdate: (id: string, patch: Partial<PlanSubject>) => void;
};

const OPENING: ChatLine = {
  id: "ai-open",
  role: "assistant",
  text: "시험 일정이랑 평소 일정을 편하게 말해 줘.",
};

const PROFILE_QUESTION =
  "자료구조 A+ 기준을 조금만 더 알려 줘. 상대평가야, 절대평가야? A+는 몇 점 이상이거나 상위 몇 %야? 기말 반영 비율이랑 교수님이 강조한 범위도 있으면 알려 줘.";

const GOAL_QUESTION = "운영체제랑 컴퓨터네트워크는 목표가 어떻게 돼?";

const PROFILE_CHIPS = ["중간고사 40%", "기말고사 40%", "교수님 강조: 3단원 트리", "커트라인 90점"];
const GOAL_CHIPS = [
  "운영체제 B+ 이상 · 80점 · 기말 50%",
  "컴퓨터네트워크 통과 · 60점 · 기말 60%",
];

export default function GoalChat({ onImport, onUpdate }: Props) {
  const [messages, setMessages] = useState<ChatLine[]>([OPENING]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [thinking, setThinking] = useState(false);
  const timers = useRef<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, thinking]);

  const pushAssistant = (text: string) => {
    setMessages((prev) => [...prev, { id: `ai-${Date.now()}-${prev.length}`, role: "assistant", text }]);
  };

  const reply = (text: string) => {
    setThinking(true);
    const timer = window.setTimeout(() => {
      pushAssistant(text);
      setThinking(false);
    }, 1500);
    timers.current.push(timer);
  };

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    if (!value || thinking) return;
    setMessages((prev) => [...prev, { id: `me-${Date.now()}-${prev.length}`, role: "user", text: value }]);
    setInput("");

    if (stage === 0) {
      onImport(
        planSubjects.map((subject) => ({
          ...subject,
          status: subject.id === "sub-data" ? "asking" : "pending",
        })),
      );
      setStage(1);
      reply(PROFILE_QUESTION);
      return;
    }

    if (stage === 1) {
      onUpdate("sub-data", {
        examDate: "11/12",
        goal: "A+",
        totalGoal: "상대평가 상위 15% · 커트라인 90점",
        extraInfo: "중간 40% · 기말 40% · 교수님 강조 3단원 트리",
        status: "ready",
      });
      setStage(2);
      reply(GOAL_QUESTION);
      return;
    }

    if (stage === 2) {
      onUpdate("sub-os", {
        goal: "B+ 이상",
        totalGoal: "80점 이상",
        extraInfo: "기말 50%",
        status: "ready",
      });
      onUpdate("sub-network", {
        goal: "통과",
        totalGoal: "60점 이상",
        extraInfo: "기말 60%",
        status: "ready",
      });
      setStage(3);
      reply("좋아요. 세 과목 목표가 모두 정리됐어. 오른쪽 정리된 내용에서 확인하고 다음 단계로 가면 돼.");
      return;
    }

    reply("말해 준 내용은 오른쪽 정리된 내용에 반영했어. 고칠 곳은 과목 줄을 눌러서 바로 고칠 수 있어.");
  };

  const toggleChip = (text: string) => {
    setInput((prev) => {
      if (prev.includes(text)) {
        return prev
          .replace(text, "")
          .replace(/\s*·\s*·\s*/g, " · ")
          .replace(/^[\s·]+|[\s·]+$/g, "");
      }
      return prev ? `${prev} · ${text}` : text;
    });
  };

  const chips = stage === 1 ? PROFILE_CHIPS : stage === 2 ? GOAL_CHIPS : [];

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-5 py-5">
      <div
        ref={scrollRef}
        className="flex max-h-[320px] min-h-[188px] flex-col gap-2.5 overflow-y-auto pr-1"
      >
        {messages.map((line) => (
          <div
            key={line.id}
            className={`flex items-end gap-2 ${line.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {line.role === "assistant" ? <span className="ps-ai-mark mb-0.5">AI</span> : null}
            <p className={`ps-bubble ${line.role === "user" ? "ps-bubble--user" : "ps-bubble--ai"}`}>
              {line.text}
            </p>
          </div>
        ))}
        {thinking ? (
          <div className="flex items-center gap-2">
            <span className="ps-ai-mark">AI</span>
            <span className="ps-bubble ps-bubble--ai inline-flex items-center gap-1.5">
              <i className="ri-loader-4-line animate-spin text-[13px] leading-none text-[var(--ps-brand-deep)]" />
              답을 정리하고 있어요
            </span>
          </div>
        ) : null}
      </div>

      {chips.length ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => toggleChip(chip)}
              aria-pressed={input.includes(chip)}
              className={`ps-chip ${input.includes(chip) ? "border-[var(--ps-brand-line)] bg-[var(--ps-brand-tint)] text-[var(--ps-brand-deep)]" : ""}`}
            >
              <i className="ri-add-line text-[12px] leading-none" />
              {chip}
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={send} className="mt-0.5">
        <label htmlFor="plan-chat-input" className="text-[11.5px] font-medium text-[var(--ps-muted)]">
          편하게 말해 주세요
        </label>
        <textarea
          id="plan-chat-input"
          name="plan_chat"
          rows={2}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="예: 월수금 저녁 6시부터 10시까지 카페 알바, 기말은 자료구조 11월 12일, 자료구조는 A+ 받고 싶어."
          className="ps-field mt-2 box-border min-h-[64px] resize-y leading-relaxed text-sm"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="min-w-0 text-[10.5px] leading-relaxed text-[var(--ps-muted)]">
            여러 개를 골라 한 번에 보내도 돼요.
          </p>
          <button
            type="submit"
            disabled={thinking}
            className="ps-btn-solid shrink-0 justify-center px-4 text-[12px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="ri-send-plane-line text-[12px] leading-none" />
            보내기
          </button>
        </div>
      </form>
    </div>
  );
}