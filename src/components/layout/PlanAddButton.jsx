import { Plus } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore.js';

// 메인 화면 오른쪽 아래 떠 있는 [계획 추가] (디자인 PlanAddButton) → S13 계획 추가 팝업
export default function PlanAddButton() {
  const openModal = useUiStore((s) => s.openModal);
  return (
    <button type="button" className="plan-add-btn" onClick={() => openModal('S13')}>
      <span className="plan-add-btn-icon" aria-hidden="true">
        <Plus size={17} />
      </span>
      계획 추가
    </button>
  );
}
