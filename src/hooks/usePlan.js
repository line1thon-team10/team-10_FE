import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteResplit,
  getJob,
  getMaterialFile,
  getMaterials,
  getPlanDraft,
  getResplit,
  getUnits,
  patchUnitExam,
  postApprove,
  postResplit,
  postResplitApply,
  postToc,
  putUnits,
  uploadMaterial,
} from '@/api/plan.js';
import { QK } from './queryKeys.js';

// 분석 중인 파일이 있으면 1초마다 목록을 다시 받아요
export const useMaterials = () =>
  useQuery({
    queryKey: QK.materials,
    queryFn: getMaterials,
    refetchInterval: (q) =>
      q.state.data?.subjects.some((s) => s.files.some((f) => f.status === 'running'))
        ? 1000
        : false,
  });

export function useUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadMaterial,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.materials }),
  });
}

// 분석 진행 상태: 끝나거나 실패할 때까지 0.7초마다 다시 물어봐요 (NF-05)
export function useJob(jobId) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const job = await getJob(jobId);
      if (job.status !== 'running') qc.invalidateQueries({ queryKey: QK.materials });
      return job;
    },
    enabled: Boolean(jobId),
    refetchInterval: (q) => (q.state.data && q.state.data.status !== 'running' ? false : 700),
  });
}

export const useToc = () => useMutation({ mutationFn: postToc });

export const useUnits = (subjectId) =>
  useQuery({
    queryKey: QK.units(subjectId),
    queryFn: () => getUnits(subjectId),
    enabled: Boolean(subjectId),
  });
export const useAllUnits = (subjectIds) =>
  useQueries({
    queries: subjectIds.map((id) => ({ queryKey: QK.units(id), queryFn: () => getUnits(id) })),
  });

export function useSaveUnits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: putUnits,
    onSuccess: (data) => {
      qc.setQueryData(QK.units(data.subjectId), data);
      qc.invalidateQueries({ queryKey: QK.planDraft });
    },
  });
}

// S4 시험 범위 체크 (PDF-08): 바꾸면 단원 목록과 S5 분량을 다시 받아요
export function useUnitExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patchUnitExam,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QK.units(data.subjectId) });
      qc.invalidateQueries({ queryKey: QK.planDraft });
    },
  });
}

// S5 계획 생성 (AI). saved면 저장된 결과
export const usePlanDraft = (saved = false) =>
  useQuery({
    queryKey: [...QK.planDraft, saved],
    queryFn: () => getPlanDraft(saved),
    retry: false,
  });

export function useApprove() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: postApprove, onSuccess: () => qc.invalidateQueries() });
}

// 원본 PDF (Blob). 한 번 받으면 다시 받지 않아요
export const useMaterialFile = (materialId) =>
  useQuery({
    queryKey: ['material', 'file', materialId],
    queryFn: () => getMaterialFile(materialId),
    enabled: Boolean(materialId),
    staleTime: Infinity,
    retry: false,
  });

// 다시 나누기 (S5-1 · S5-2, PL-06)
export function useResplitRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postResplit,
    onSuccess: (data) => {
      if (!data.question) qc.removeQueries({ queryKey: QK.resplit });
    },
  });
}
export const useResplit = () =>
  useQuery({ queryKey: QK.resplit, queryFn: getResplit, retry: false });

// 승인 · 되돌리기: S5 첫 주 미리보기를 다시 받아요
function useResplitDecide(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.removeQueries({ queryKey: QK.resplit });
      qc.invalidateQueries({ queryKey: QK.planDraft });
    },
  });
}
export const useApplyResplit = () => useResplitDecide(postResplitApply);
export const useCancelResplit = () => useResplitDecide(deleteResplit);
