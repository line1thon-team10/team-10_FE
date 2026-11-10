import { HttpResponse, bypass, http } from 'msw';
import { EP } from '@/api/endpoints.js';
import { db } from '../db.js';
import { MOCK_PDF } from '../logic.js';
import { fail, ok } from './respond.js';

// mock: PDF 분석(김현민)·저장(백엔드 B)을 흉내 내요. 파일 내용은 읽지 않고 데이터 세트 단원표를 돌려줘요.
// 파일 이름에 '스캔'이 있으면 '글자 읽는 중'(글자 인식)으로 분석하고 퀴즈 없음으로 끝나요 (PDF-01·07).
// 파일 이름에 '실패'가 있으면 첫 단계에서 실패해요 (S3-2 목차 직접 입력 시연용, 11/10 결정).
const STEPS = ['텍스트 읽기', '목차 찾기', '개념 추출', '개념별 페이지 연결'];
const OCR_STEPS = ['글자 읽는 중 (글자 인식)', ...STEPS.slice(1)];
const STEP_MS = 900;
const setup = () => db.get().setup;
const subjectsOf = () => (setup().subjects.length ? setup().subjects : db.get().subjects);
let seq = 0;

function jobView(jobId) {
  const job = setup().jobs[jobId];
  if (!job) return null;
  const sub = db.get().subjects.find((s) => s.id === job.subjectId);
  const elapsed = Date.now() - job.startedAt;
  const step = Math.floor(elapsed / STEP_MS);
  const material = setup().materials[job.subjectId].find((m) => m.id === job.materialId);
  let status = 'running';
  if (job.reused || step >= STEPS.length) status = 'done';
  if (job.fail && elapsed > STEP_MS * 1.3) status = 'failed';
  material.status = status;
  if (status === 'done') material.pages = job.ocr ? db.get().scanFile.pages : sub.file.pages; // mock: 스캔본 쪽수는 시드 값
  return {
    jobId,
    materialId: job.materialId,
    subjectId: job.subjectId,
    status, // running | done | failed
    ocr: Boolean(job.ocr),
    steps: (job.ocr ? OCR_STEPS : STEPS).map((name, i) =>
      i === 1 && status === 'done' ? `${name} · ${sub.units.length}단원` : name,
    ),
    current: status === 'done' ? STEPS.length : job.fail ? 0 : Math.min(step, STEPS.length - 1),
    failedStep: status === 'failed' ? 0 : null,
    progress:
      status === 'done'
        ? 100
        : Math.min(95, Math.round((elapsed / (STEP_MS * STEPS.length)) * 100)),
    reused: Boolean(job.reused),
    reason: status === 'failed' ? '글자를 읽을 수 없었어요' : null,
  };
}

function materialsView() {
  // 진행 중인 파일은 상태를 다시 계산해요 (서버가 들고 있는 최신 상태 흉내)
  for (const list of Object.values(setup().materials))
    for (const m of list) if (m.status === 'running') jobView(m.jobId);
  return {
    subjects: subjectsOf().map((s) => {
      const full = db.get().subjects.find((x) => x.id === s.id);
      return {
        id: s.id,
        name: s.name,
        color: full.color,
        files: (setup().materials[s.id] ?? []).map((m) => ({ ...m })),
      };
    }),
  };
}

// "보충 1. 서브넷 계산 연습 p.1–5" 같은 줄을 단원으로 나눠요 (mock: AI 정리 자리)
function parseToc(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const m = line.match(/p?\.?\s*(\d+)\s*[-~–]\s*(\d+)/);
      const title = line
        .replace(/p?\.?\s*\d+\s*[-~–]\s*\d+\s*(p|쪽|페이지)?/, '')
        .replace(/^\s*\d+[.)]\s*/, '')
        .trim();
      return {
        no: i + 1,
        title: title || `단원 ${i + 1}`,
        from: m ? Number(m[1]) : null,
        to: m ? Number(m[2]) : null,
      };
    });
}

export const materialsHandlers = [
  http.get(EP.materials, () => ok(materialsView())),

  http.post(EP.materials, async ({ request }) => {
    const form = await request.formData();
    const subjectId = form.get('subjectId');
    const file = form.get('file');
    if (!subjectId || !file) return fail('BAD_REQUEST', '과목과 파일이 필요해요');
    if (!/\.pdf$/i.test(file.name))
      return fail('NOT_PDF', 'PDF 파일만 올릴 수 있어요. PPT는 PDF로 바꿔서 올려 주세요');
    const list = (setup().materials[subjectId] ??= []);
    // PDF-06: 같은 파일(이름·크기)을 다시 올리면 저장된 결과를 써요
    const same = list.find(
      (m) => m.name === file.name && m.size === file.size && m.status === 'done',
    );
    const materialId = `m${++seq}`;
    const jobId = `job${seq}`;
    list.push({
      id: materialId,
      name: file.name,
      size: file.size,
      pages: null,
      status: 'running',
      jobId,
      quizless: /스캔/.test(file.name),
      ocr: /스캔/.test(file.name),
    });
    setup().jobs[jobId] = {
      startedAt: Date.now(),
      subjectId,
      materialId,
      ocr: /스캔/.test(file.name),
      fail: /실패/.test(file.name),
      reused: Boolean(same),
    };
    return ok({ materialId, jobId }, 300);
  }),

  http.get(`${EP.materialJob}/:jobId`, ({ params }) => {
    const v = jobView(params.jobId);
    return v ? ok(v, 100) : fail('JOB_NOT_FOUND', '분석 작업을 찾지 못했어요', 404);
  }),

  // S4 시험 범위 체크 (PDF-08). 빼면 S5 분량·태스크에서 빠져요 (mock은 온보딩 안에서만, 11/10 결정 A)
  http.patch(`${EP.materials}/:id/units`, async ({ params, request }) => {
    const { unitNo, inExam } = await request.json();
    const subjectId = Object.keys(setup().materials).find((id) =>
      setup().materials[id].some((m) => m.id === params.id),
    );
    if (!subjectId) return fail('MATERIAL_NOT_FOUND', '자료를 찾지 못했어요', 404);
    const out = new Set(setup().outOfExam[subjectId] ?? []);
    if (inExam) out.delete(unitNo);
    else out.add(unitNo);
    setup().outOfExam[subjectId] = [...out];
    return ok({ subjectId, unitNo, inExam: Boolean(inExam) });
  }),

  // 원본 PDF (QZ-13 근거 · 집중 모드 자료 열기). mock은 목업 PDF를 돌려줘요
  // TODO(확인필요): [기획 확인] 시연 PDF(김현민)를 받으면 public/mock 파일만 바꿔요
  http.get(`${EP.materials}/:id/file`, async ({ params }) => {
    const path = MOCK_PDF[params.id];
    if (!path) return fail('NO_FILE', '이 자료는 원본 PDF가 아직 없어요', 404);
    const res = await fetch(bypass(new URL(path, location.origin)));
    return new HttpResponse(await res.arrayBuffer(), {
      headers: { 'Content-Type': 'application/pdf' },
    });
  }),

  http.post(EP.toc, async ({ request }) => {
    const { text } = await request.json();
    if (!text?.trim()) return fail('EMPTY', '목차를 붙여넣어 주세요');
    return ok({ units: parseToc(text) }, 800);
  }),
];
