// S6-4 일정 추가 재조정 (팝업) — 신민종
import Modal from '@/components/common/Modal.jsx';
import Placeholder from '@/components/Placeholder.jsx';

export default function S6_4Reschedule({ onClose }) {
  return (
    <Modal title="일정 추가 재조정" onClose={onClose}>
      <Placeholder id="S6-4" compact />
    </Modal>
  );
}
