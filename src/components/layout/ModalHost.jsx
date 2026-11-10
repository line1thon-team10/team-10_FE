import PlanAddDialog from '@/components/plan/PlanAddDialog.jsx';
import P1BookBox from '@/pages/home/modals/P1BookBox.jsx';
import P2Plans from '@/pages/home/modals/P2Plans.jsx';
import P4Pace from '@/pages/home/modals/P4Pace.jsx';
import S6_4Reschedule from '@/pages/home/modals/S6_4Reschedule.jsx';
import S7Record from '@/pages/home/modals/S7Record.jsx';
import { useUiStore } from '@/stores/uiStore.js';

const MODALS = {
  S7: S7Record,
  P1: P1BookBox,
  P2: P2Plans,
  P4: P4Pace,
  S13: PlanAddDialog,
  'S6-4': S6_4Reschedule,
};

export default function ModalHost() {
  const { modal, modalProps, closeModal } = useUiStore();
  const Comp = MODALS[modal];
  return Comp ? <Comp {...modalProps} onClose={closeModal} /> : null;
}
