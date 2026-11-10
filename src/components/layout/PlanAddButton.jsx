import { Plus } from 'lucide-react';

// 메인 화면 오른쪽 아래 떠 있는 [계획 추가] (디자인 PlanAddButton, S13 열기)
// 지시문 12(S13 계획 추가 모달) 전까지는 막아 둬요.
export default function PlanAddButton() {
  return (
    <button
      type="button"
      className="plan-add-btn"
      disabled
      title="계획 추가는 준비 중이에요"
      aria-label="계획 추가 (준비 중)"
    >
      <span className="plan-add-btn-icon" aria-hidden="true">
        <Plus size={17} />
      </span>
      계획 추가
    </button>
  );
}
