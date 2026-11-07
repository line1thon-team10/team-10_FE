// P1 책 박스 팝업 (팝업) — 신민종
import Modal from '@/components/common/Modal.jsx';
import Placeholder from '@/components/Placeholder.jsx';

export default function P1BookBox({ onClose }) {
  return (
    <Modal title="책 박스 팝업" onClose={onClose}>
      <Placeholder id="P1" compact />
    </Modal>
  );
}
