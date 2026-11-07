import { create } from 'zustand';

// 화면에만 필요한 전역 상태 (서버 데이터는 TanStack Query가 맡아요).
// modal: 'S7' | 'P1' | 'P2' | 'S6-4' | null
export const useUiStore = create((set) => ({
  modal: null,
  modalProps: {},
  openModal: (modal, modalProps = {}) => set({ modal, modalProps }),
  closeModal: () => set({ modal: null, modalProps: {} }),
}));
