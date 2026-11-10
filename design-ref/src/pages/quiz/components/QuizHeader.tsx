import type { ReactNode } from "react";
import AppNav from "@/components/feature/AppNav";

type Props = {
  right?: ReactNode;
};

export default function QuizHeader({ right }: Props) {
  return <AppNav right={right} />;
}