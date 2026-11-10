import { useLocation, useNavigate } from "react-router-dom";
import "./planAddButton.css";

const HIDDEN_PATHS = ["/", "/plan"];

export default function PlanAddButton() {
  const navigate = useNavigate();
  const location = useLocation();

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  const startNewPlan = () => {
    navigate("/plan?new=1");
  };

  return (
    <button
      type="button"
      onClick={startNewPlan}
      aria-label="새 학습 계획 추가"
      className="plan-add-btn"
    >
      <span className="plan-add-btn__icon">
        <i className="ri-add-line text-[17px] leading-none" />
      </span>
      <span className="plan-add-btn__label">계획 추가</span>
    </button>
  );
}