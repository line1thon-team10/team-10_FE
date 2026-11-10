import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./study.css";
import StudyFocus from "./components/StudyFocus";
import StudyDone from "./components/StudyDone";
import { todayTasks } from "@/mocks/todayStudy";
import { studySessionMaterial } from "@/mocks/studySession";

export type StudyTarget = {
  subject: string;
  unit: string;
  pageRange: string;
  pages: number;
  expectedMinutes: number;
};

export default function StudyPage() {
  const [result, setResult] = useState<{ minutes: number; autoStopped: boolean } | null>(null);
  const [params] = useSearchParams();
  const taskId = params.get("task");
  const task = todayTasks.find((item) => item.id === taskId);

  const target: StudyTarget = task
    ? {
        subject: task.subject,
        unit: task.unit,
        pageRange: task.pageRange,
        pages: task.pages,
        expectedMinutes: task.expectedMinutes,
      }
    : studySessionMaterial;

  useEffect(() => {
    document.title = "피뢰침 | 집중 모드";
    const desc = document.querySelector('meta[name="description"]');
    const text = "공부하는 동안 시간 숫자를 숨기고 태스크 하나에만 집중하는 피뢰침의 집중 모드 화면입니다.";
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
  }, [result]);

  return result === null ? (
    <StudyFocus
      target={target}
      onFinish={(minutes, autoStopped) => setResult({ minutes, autoStopped: Boolean(autoStopped) })}
    />
  ) : (
    <StudyDone
      minutes={result.minutes}
      autoStopped={result.autoStopped}
      subject={target.subject}
      taskId={taskId ?? undefined}
    />
  );
}