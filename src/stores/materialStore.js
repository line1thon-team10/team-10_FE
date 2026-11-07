import { create } from 'zustand';

// S3에서 올린 PDF 파일을 이 브라우저 메모리에만 들고 있다가 S4 근거 미리보기에 써요 (서버에 다시 받지 않아요).
// TODO(확인필요): [백엔드 확정 필요] 새로고침 뒤에도 미리보기를 보려면 서버가 원본 PDF나 페이지 이미지를 줘야 해요.
export const useMaterialStore = create((set) => ({
  files: {}, // { materialId: File }
  setFile: (materialId, file) => set((s) => ({ files: { ...s.files, [materialId]: file } })),
}));
