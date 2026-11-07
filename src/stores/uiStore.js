import { create } from 'zustand';

// 화면에만 필요한 전역 상태 (서버 데이터는 TanStack Query가 맡아요).
export const useUiStore = create((set) => ({
  // 팝업: 'S7' | 'P1' | 'P2' | 'S6-4' | null
  modal: null,
  modalProps: {},
  openModal: (modal, modalProps = {}) => set({ modal, modalProps }),
  closeModal: () => set({ modal: null, modalProps: {} }),

  // 홈 70% 미만 안내 박스를 닫은 날짜 (닫아도 안내 한 줄은 남아요)
  quizBoxClosedOn: null,
  closeQuizBox: (date) => set({ quizBoxClosedOn: date }),

  // 방금 기록한 태스크: 홈 '최근 7일 쌓은 책'에서 블록이 떨어지는 연출에 써요 (P1-1)
  droppedTaskId: null,
  setDroppedTaskId: (droppedTaskId) => set({ droppedTaskId }),

  // S6-2 이월 안내를 확인한 날짜, P2 분배안을 자동으로 띄운 날짜
  noticeAckOn: null,
  ackNotice: (date) => set({ noticeAckOn: date }),
  replanShownOn: null,
  markReplanShown: (date) => set({ replanShownOn: date }),

  // 시드를 바꾸거나 날짜를 넘기면 화면 상태를 처음으로
  resetDemoUi: () =>
    set({
      modal: null,
      modalProps: {},
      quizBoxClosedOn: null,
      droppedTaskId: null,
      noticeAckOn: null,
      replanShownOn: null,
    }),
}));
