import { useMutation } from '@tanstack/react-query';
import { askTutor } from '@/api/tutor.js';

// 기본 질문(TU-01)과 쉬운 설명(TU-02)은 따로 써요 (로딩·실패가 서로 안 섞이게)
export const useTutor = () => useMutation({ mutationFn: askTutor });
