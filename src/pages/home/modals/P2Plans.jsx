// P2 분배안 (팝업) — 신민종
import Modal from '@/components/common/Modal.jsx';
import Placeholder from '@/components/Placeholder.jsx';

export default function P2Plans({ onClose }) {
  return (
    <Modal title="분배안" onClose={onClose}>
      <Placeholder id="P2" compact />
    </Modal>
  );
}
