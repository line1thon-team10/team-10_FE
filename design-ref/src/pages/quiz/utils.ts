import type { QuizAnswer, QuizQuestion, QuizStats } from "./types";

export const emptyAnswer = (): QuizAnswer => ({
  choiceIndex: null,
  text: "",
  confidence: null,
  submitted: false,
  score: null,
});

export const isCorrect = (question: QuizQuestion, answer?: QuizAnswer): boolean => {
  if (!answer) return false;
  if (question.kind === "written") return (answer.score ?? 0) >= 85;
  return answer.choiceIndex !== null && answer.choiceIndex === question.correctIndex;
};

export const getQuizStats = (
  questions: QuizQuestion[],
  answers: Record<string, QuizAnswer>,
): QuizStats => {
  let sureCorrect = 0;
  let unsureCorrect = 0;
  let wrong = 0;

  questions.forEach((question) => {
    const answer = answers[question.id];
    if (isCorrect(question, answer)) {
      if (answer?.confidence === "unsure") unsureCorrect += 1;
      else sureCorrect += 1;
    } else {
      wrong += 1;
    }
  });

  return {
    total: questions.length,
    correct: sureCorrect + unsureCorrect,
    sureCorrect,
    unsureCorrect,
    wrong,
  };
};

export const resultTone = (
  question: QuizQuestion,
  answer?: QuizAnswer,
): { label: string; tone: "good" | "warn" | "bad" } => {
  const correct = isCorrect(question, answer);
  if (correct) {
    return answer?.confidence === "unsure"
      ? { label: "정답 · 애매", tone: "warn" }
      : { label: "정답 · 확실", tone: "good" };
  }
  if (question.kind === "written" && !answer?.submitted) {
    return { label: "채점 전", tone: "bad" };
  }
  return { label: "오답 · 확실", tone: "bad" };
};