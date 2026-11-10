import { Navigate } from "react-router-dom";
import { hasConfirmedPlan } from "@/pages/plan/access";

/** 계획을 확정한 적이 있으면 기록 화면, 없으면 계획 설정으로 보냅니다. */
export default function RootRedirect() {
  return <Navigate to={hasConfirmedPlan() ? "/home" : "/plan"} replace />;
}