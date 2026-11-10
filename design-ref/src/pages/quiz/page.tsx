import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./quiz.css";
import QuizHeader from "./components/QuizHeader";
import QuizPick from "./components/QuizPick";
import QuizQuestion from "./components/QuizQuestion";
import QuizResult from "./components/QuizResult";
import BookColorDialog from "./components/BookColorDialog";
import { quizSubjects } from "@/mocks/quiz";
import { emptyAnswer, getQuizStats } from "./utils";
import type { QuizAnswer, QuizConfidence, QuizSubject } from "./types";

const subjects = quizSubjects as unknown as QuizSubject[];

type Stage = "pick" | "run" | "result";

/** 복습 노트의 '맞춤 문제 뽑기'에서 넘어올 때 쓰는 조건 */
type LaunchState = {
  subjectId?: string;
  unitLabel?: string;
  level?: string;
  count?: number;
  custom?: boolean;
};

export default function QuizPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const launch = (location.state ?? null) as LaunchState | null;
  const launchSubject = launch?.subjectId
    ? subjects.find((item) => item.id === launch.subjectId && !item.locked)
    : undefined;
  const launchCount = launchSubject
    ? Math.min(launch?.count ?? launchSubject.questions.length, launchSubject.questions.length)
    : 0;

  const [stage, setStage] = useState<Stage>(launchSubject ? "run" : "pick");
  const [subjectId, setSubjectId] = useState(launchSubject?.id ?? subjects[0].id);
  const [limit, setLimit] = useState<number | null>(launchSubject ? launchCount : null);
  const [customLabel, setCustomLabel] = useState<string | null>(
    launchSubject ? `${launch?.unitLabel ?? "취약 개념"} · ${launch?.level ?? "하"} 난이도 ${launchCount}문항` : null,
  );
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>(() => {
    if (!launchSubject) return {};
    const initial: Record<string, QuizAnswer> = {};
    launchSubject.questions.slice(0, launchCount).forEach((item) => {
      initial[item.id] = emptyAnswer();
    });
    return initial;
  });
  const [index, setIndex] = useState(0);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [showBook, setShowBook] = useState(false);
  const launchedOnce = useRef(false);

  const subject = subjects.find((item) => item.id === subjectId) ?? subjects[0];
  const questions = useMemo(
    () => (limit ? subject.questions.slice(0, limit) : subject.questions),
    [subject, limit],
  );
  const question = questions[index] ?? questions[0];

  useEffect(() => {
    if (!launch?.subjectId || launchedOnce.current) return;
    launchedOnce.current = true;
    navigate(location.pathname, { replace: true, state: null });
  }, [launch, location.pathname, navigate]);

  useEffect(() => {
    document.title = "피뢰침 | 오늘의 퀴즈";
    const desc = document.querySelector('meta[name="description"]');
    const text = "공부한 범위에서 나온 오늘의 퀴즈. 과목을 골라 풀고 채점 결과와 이해도 변화를 한 번에 확인하세요.";
    if (desc) desc.setAttribute("content", text);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = text;
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage, index]);

  useEffect(() => {
    if (!gradingId) return undefined;
    const id = gradingId;
    const timer = window.setTimeout(() => {
      const target = questions.find((item) => item.id === id);
      setAnswers((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] ?? emptyAnswer()),
          submitted: true,
          score: target?.sampleScore ?? 85,
        },
      }));
      setGradingId(null);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [gradingId, questions]);

  const stats = useMemo(() => getQuizStats(questions, answers), [questions, answers]);

  const startQuiz = (id: string) => {
    const next = subjects.find((item) => item.id === id);
    if (!next || next.locked) return;
    const initial: Record<string, QuizAnswer> = {};
    next.questions.forEach((item) => {
      initial[item.id] = emptyAnswer();
    });
    setSubjectId(id);
    setLimit(null);
    setCustomLabel(null);
    setAnswers(initial);
    setIndex(0);
    setGradingId(null);
    setStage("run");
  };

  const updateAnswer = (id: string, patch: Partial<QuizAnswer>) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyAnswer()), ...patch },
    }));
  };

  const goNext = () => {
    if (index >= questions.length - 1) {
      setStage("result");
      setShowBook(true);
      return;
    }
    setIndex(index + 1);
  };

  const handleConfidence = (confidence: QuizConfidence) => {
    updateAnswer(question.id, { confidence });
  };

  const headerRight = (
    <div className="flex items-center gap-2">
      {customLabel ? (
        <span className="qz-chip qz-chip--brand hidden md:inline-flex">
          <i className="ri-magic-line text-[11px] leading-none" />
          맞춤 {customLabel}
        </span>
      ) : (
        <span className="qz-chip hidden sm:inline-flex">첫 시험 자료구조 D-3</span>
      )}
      {stage === "run" ? (
        <button
          type="button"
          onClick={() => {
            setLimit(null);
            setCustomLabel(null);
            setStage("pick");
          }}
          className="qz-btn qz-btn--ghost"
        >
          나가기
        </button>
      ) : (
        <Link to="/home" className="qz-btn qz-btn--ghost">
          홈으로
        </Link>
      )}
    </div>
  );

  return (
    <div className="qz-scope flex min-h-screen w-full flex-col bg-[var(--qz-paper)]">
      <QuizHeader right={headerRight} />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-16 pt-8 md:px-8 md:pt-10">
        {stage === "pick" ? <QuizPick subjects={subjects} onStart={startQuiz} /> : null}

        {stage === "run" && question ? (
          <QuizQuestion
            key={question.id}
            subject={subject}
            question={question}
            index={index}
            total={questions.length}
            answer={answers[question.id] ?? emptyAnswer()}
            grading={gradingId === question.id}
            onPickChoice={(choiceIndex) => updateAnswer(question.id, { choiceIndex })}
            onConfidence={handleConfidence}
            onChangeText={(text) => updateAnswer(question.id, { text })}
            onSubmitWritten={() => {
              updateAnswer(question.id, { submitted: true });
              setGradingId(question.id);
            }}
            onPrev={() => setIndex(Math.max(index - 1, 0))}
            onNext={goNext}
          />
        ) : null}

        {stage === "result" ? (
          <QuizResult
            subject={subject}
            questions={questions}
            answers={answers}
            onMore={() => {
              setLimit(null);
              setCustomLabel(null);
              setStage("pick");
            }}
          />
        ) : null}
      </main>

      <footer className="border-t border-[var(--qz-line)] bg-[var(--qz-paper-warm)]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-[11.5px] text-[var(--qz-muted)] sm:flex-row md:px-8">
          <p>© 2026 피뢰침. 푼 만큼 남는 기록.</p>
          <p className="flex items-center gap-2">
            <i className="ri-refresh-line text-[12px] leading-none text-[var(--qz-brand-deep)]" />
            틀린 문제는 내일 퀴즈로 다시
          </p>
        </div>
      </footer>

      {stage === "result" && showBook ? (
        <BookColorDialog
          subject={subject.subject}
          total={stats.total}
          correct={stats.correct}
          onClose={() => setShowBook(false)}
          onShowBooks={() => navigate("/books")}
        />
      ) : null}
    </div>
  );
}