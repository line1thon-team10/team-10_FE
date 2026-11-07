// S7 공부 기록 (팝업) — 신민종
import Modal from '@/components/common/Modal.jsx';
import Placeholder from '@/components/Placeholder.jsx';

export default function S7Record({ onClose }) {
  return (
    <Modal title="공부 기록" onClose={onClose}>
      <Placeholder id="S7" compact />
    </Modal>
  );
}
