import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./plan.css";
import PlanHeader from "./components/PlanHeader";
import PlanStepper from "./components/PlanStepper";
import StepGoal from "./components/StepGoal";
import StepCalendar from "./components/StepCalendar";
import StepMaterials from "./components/StepMaterials";
import StepUnits from "./components/StepUnits";
import StepAmount from "./components/StepAmount";
import TocDialog from "./components/TocDialog";
import { planMaterials, planRepeats, planSubjects, planUnits, planWeeks } from "@/mocks/planSetup";
import type {
  PlanAllocation,
  PlanBlock,
  PlanDraft,
  PlanMaterial,
  PlanSubject,
  PlanUnit,
  PlanWeek,
} from "./types";
import { buildSubjectFromText, formatFileSize, scrollToPageTop, unitPages } from "./utils";
import { savePlanDraft } from "./storage";
import { confirmPlanAccess } from "./access";

const initialWeeks: PlanWeek[] = planWeeks.map((week) => ({
  label: week.label,
  range: week.range,
  blocks: week.blocks.map((block) => ({ ...block })),
}));

const createMaterials = (): PlanMaterial[] => planMaterials.map((item) => ({ ...item }));const createUnits = (): PlanUnit[] => planUnits.map((item) => ({ ...item }));

type Dialog = {
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export default function PlanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [subjects, setSubjects] = useState<PlanSubject[]>(() => planSubjects.map((item) => ({ ...item })));
  const [weeks, setWeeks] = useState<PlanWeek[]>(() => initialWeeks);
  const [materials, setMaterials] = useState<PlanMaterial[]>(createMaterials);
  const [units, setUnits] = useState<PlanUnit[]>(createUnits);
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [tocMaterialId, setTocMaterialId] = useState<string | null>(null);
  const [addFlow, setAddFlow] = useState(
    () => new URLSearchParams(location.search).get("add") === "1",
  );
  const [rangeSubjectId, setRangeSubjectId] = useState<string | null>(
    () => new URLSearchParams(location.search).get("subject"),
  );

  useEffect(() => {
    document.title = "피뢰침 | 학습 계획 설정";
    const desc = document.querySelector('meta[name="description"]');
    const text = "시험 일정과 목표를 정리하고, 자료를 올려 단원과 분량까지 나누는 피뢰침의 계획 설정 화면입니다.";
    if (desc) desc.setAttribute("content", text);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = text;
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isNew = params.get("new") === "1";
    const isAdd = params.get("add") === "1";
    const subjectParam = params.get("subject");
    const stepParam = Number(params.get("step"));

    if (isNew) {
      setAddFlow(false);
      setRangeSubjectId(null);
      setStep(1);
      setMaxStep(1);
      setSubjects(planSubjects.map((item) => ({ ...item })));
      setWeeks(
        initialWeeks.map((item) => ({ ...item, blocks: item.blocks.map((block) => ({ ...block })) })),
      );
      setMaterials(createMaterials());
      setUnits(createUnits());
      setWeekIndex(0);
      setSelectedBlockId(null);
      setDialog(null);
      scrollToPageTop();
      navigate("/plan", { replace: true });
      return;
    }

    // 관리 화면 [과목 추가]: 기존 계획은 그대로 두고 새 과목 하나만 입력받습니다.
    if (isAdd) {
      setAddFlow(true);
      setRangeSubjectId(null);
      setStep(1);
      setMaxStep(1);
      setSubjects([]);
      setMaterials([]);
      setUnits([]);
      setWeekIndex(0);
      setSelectedBlockId(null);
      setDialog(null);
      scrollToPageTop();
      return;
    }

    // 관리 화면 [범위 고치기]: 4단계를 그 과목만 보여줍니다.
    if (subjectParam) {
      setAddFlow(false);
      setRangeSubjectId(subjectParam);
      setStep(4);
      setMaxStep(5);
      scrollToPageTop();
      return;
    }

    if (stepParam) {
      setStep(stepParam);
      setMaxStep((prev) => Math.max(prev, stepParam));
    }
  }, [location.search, navigate]);

  const week = weeks[weekIndex];
  const visibleSubjects = rangeSubjectId
    ? subjects.filter((subject) => subject.id === rangeSubjectId)
    : subjects;
  const tocMaterial = tocMaterialId ? materials.find((item) => item.id === tocMaterialId) ?? null : null;

  const setWeekBlocks = (nextBlocks: PlanBlock[]) => {
    setWeeks((prev) =>
      prev.map((item, index) => (index === weekIndex ? { ...item, blocks: nextBlocks } : item)),
    );
  };

  const updateSubject = (id: string, patch: Partial<PlanSubject>) => {
    setSubjects((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addSubject = (text: string): boolean => {
    const subject = buildSubjectFromText(text);
    if (!subject) return false;
    setSubjects((prev) => [...prev, subject]);
    return true;
  };

  const replaceSubjects = (list: PlanSubject[]) => {
    setSubjects(list.map((item) => ({ ...item })));
  };

  const addBlock = (payload: { title: string; day: number; start: string; end: string }) => {
    const block: PlanBlock = {
      id: `custom-${Date.now()}`,
      day: payload.day,
      start: payload.start,
      end: payload.end,
      title: payload.title,
      kind: "custom",
      dashed: true,
    };
    setWeekBlocks([...week.blocks, block]);
    setSelectedBlockId(block.id);
  };

  const updateBlock = (id: string, patch: Partial<PlanBlock>) => {
    setWeekBlocks(week.blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  };

  const deleteBlock = (id: string) => {
    setWeekBlocks(week.blocks.filter((block) => block.id !== id));
  };

  const goStep = (next: number) => {
    setStep(next);
    setMaxStep((prev) => Math.max(prev, next));
    setSelectedBlockId(null);
    scrollToPageTop();
  };

  const selectStep = (next: number) => {
    if (addFlow && next === 2) {
      goStep(3);
      return;
    }
    if (next > maxStep) {
      setDialog({
        title: "앞 단계를 먼저 마무리해 주세요",
        message: "지금 단계에서 [다음]을 누르면 순서대로 넘어갈 수 있어요. 지나온 단계는 언제든 다시 볼 수 있습니다.",
        primaryLabel: "확인",
      });
      return;
    }
    goStep(next);
  };

  const buildDraft = (allocations?: PlanAllocation[]): PlanDraft => ({
    subjects,
    weeks,
    repeats: planRepeats,
    materials,
    units,
    allocations,
    updatedAt: new Date().toISOString(),
  });

  const finishCalendar = async () => {
    const saved = await savePlanDraft(buildDraft());
    if (!saved) {
      setDialog({
        title: "저장하지 못했어요",
        message: "이 브라우저에서는 임시 저장이 막혀 있어요. 화면을 닫으면 정리한 내용이 사라질 수 있습니다.",
        primaryLabel: "그래도 계속",
        onPrimary: () => goStep(3),
      });
      return;
    }
    goStep(3);
  };

  const addMaterials = (subjectId: string, files: File[]) => {
    const accepted = files.filter((file) => /\.pdf$/i.test(file.name));
    if (accepted.length === 0) {
      setDialog({
        title: "PDF만 올릴 수 있어요",
        message: "PPT는 PDF로 바꿔 올려 주세요.",
        primaryLabel: "확인",
      });
      return;
    }
    const created: PlanMaterial[] = accepted.map((file, index) => ({
      id: `mat-${Date.now()}-${index}`,
      subjectId,
      name: file.name,
      pages: 24 + (Math.round(file.size / 1024) % 160),
      sizeLabel: formatFileSize(file.size),
      status: "reading",
      readStage: "text",
      scanned: /\.(png|jpe?g)$/i.test(file.name),
    }));

    setMaterials((prev) => [...prev, ...created]);
    setUnits((prev) => [
      ...prev,
      ...created.flatMap((material) => {
        const chunk = 20;
        const count = Math.max(1, Math.ceil(material.pages / chunk));
        return Array.from({ length: count }, (_, index) => {
          const startPage = index * chunk + 1;
          return {
            id: `unit-${material.id}-${index + 1}`,
            subjectId,
            title: `${index + 1}단원 (${material.name.replace(/\.(pdf|png|jpe?g)$/i, "").slice(0, 14)})`,
            startPage,
            endPage: Math.min(material.pages, startPage + chunk - 1),
            confirmed: true,
          };
        });
      }),
    ]);

    // 글자 읽기 → 목차 찾기 → 개념 추출 → 단원 인식 완료
    created.forEach((material) => {
      window.setTimeout(() => {
        setMaterials((prev) =>
          prev.map((item) => (item.id === material.id ? { ...item, readStage: "toc" } : item)),
        );
      }, 900);
      window.setTimeout(() => {
        setMaterials((prev) =>
          prev.map((item) => (item.id === material.id ? { ...item, readStage: "concept" } : item)),
        );
      }, 1800);
      window.setTimeout(() => {
        setMaterials((prev) =>
          prev.map((item) =>
            item.id === material.id
              ? {
                  ...item,
                  status: material.scanned ? "scan-low" : "ready",
                  readStage: undefined,
                }
              : item,
          ),
        );
      }, 2700);
    });
  };

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((item) => item.id !== id));
    setUnits((prev) => prev.filter((unit) => !unit.id.startsWith(`unit-${id}-`)));
  };

  const updateUnit = (id: string, patch: Partial<PlanUnit>) => {
    setUnits((prev) => prev.map((unit) => (unit.id === id ? { ...unit, ...patch } : unit)));
  };

  const removeUnit = (id: string) => {
    setUnits((prev) => prev.filter((unit) => unit.id !== id));
  };

  const addUnit = (subjectId: string) => {
    setUnits((prev) => {
      const list = prev.filter((unit) => unit.subjectId === subjectId);
      const last = list[list.length - 1];
      const startPage = last ? last.endPage + 1 : 1;
      return [
        ...prev,
        {
          id: `unit-new-${Date.now()}`,
          subjectId,
          title: `${list.length + 1}단원`,
          startPage,
          endPage: startPage + 19,
          confirmed: true,
        },
      ];
    });
  };

  const confirmAllUnits = (subjectId: string) => {
    setUnits((prev) =>
      prev.map((unit) => (unit.subjectId === subjectId ? { ...unit, confirmed: true } : unit)),
    );
  };

  const finishMaterials = () => {
    if (materials.length === 0) {
      setDialog({
        title: "자료를 먼저 올려 주세요",
        message: "과목마다 시험 범위 자료를 하나 이상 올려야 단원을 나눌 수 있어요.",
        primaryLabel: "확인",
      });
      return;
    }
    goStep(4);
  };

  const finishUnits = () => {
    goStep(5);
  };

  const approvePlan = async (allocations: PlanAllocation[]) => {
    const saved = await savePlanDraft(buildDraft(allocations));
    confirmPlanAccess();

    if (addFlow) {
      const name = subjects[0]?.name ?? "새 과목";
      navigate(`/manage?added=${encodeURIComponent(name)}`);
      return;
    }

    const totalPages = units
      .filter((unit) => unit.confirmed)
      .reduce((sum, unit) => sum + unitPages(unit.startPage, unit.endPage), 0);
    setDialog({
      title: saved ? "계획을 승인했어요" : "계획을 승인했지만 저장하지 못했어요",
      message: saved
        ? `확인한 단원 ${units.filter((unit) => unit.confirmed).length}개, ${totalPages}쪽을 시험일까지 나눠 배치했어요. 기록 화면에서 학습 블록으로 확인할 수 있습니다.`
        : "이 브라우저에서는 임시 저장이 막혀 있어요. 화면을 닫으면 배분한 분량이 사라질 수 있습니다.",
      primaryLabel: "기록 화면 보기",
      onPrimary: () => navigate("/home"),
    });
  };

  const addTocUnits = (list: { title: string; startPage: number; endPage: number }[]) => {
    if (!tocMaterial) return;
    const { id: materialId, subjectId } = tocMaterial;
    const stamp = Date.now();
    setUnits((prev) => [
      ...prev.filter((unit) => !unit.id.startsWith(`unit-${materialId}-`)),
      ...list.map((unit, index) => ({
        id: `unit-${materialId}-manual-${stamp}-${index}`,
        subjectId,
        title: unit.title,
        startPage: unit.startPage,
        endPage: unit.endPage,
        confirmed: true,
        quizDisabled: true,
      })),
    ]);
    setMaterials((prev) =>
      prev.map((item) =>
        item.id === materialId ? { ...item, status: "ready", manualToc: true } : item,
      ),
    );
    setTocMaterialId(null);
    setDialog({
      title: "목차를 단원으로 넣었어요",
      message: `단원 ${list.length}개를 4단계 단원 목록에 넣었습니다. 직접 입력한 범위는 퀴즈 없이 계획·기록·책 쌓기에만 쓰여요.`,
      primaryLabel: "확인",
    });
  };

  return (
    <div className="ps-scope flex min-h-screen w-full flex-col bg-[var(--ps-paper)]">
      <PlanHeader />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-16 pt-6 md:px-8 md:pt-8">
        <PlanStepper current={step} reached={maxStep} onSelect={selectStep} />

        <div className="mt-2">
          {step === 1 ? (
            <StepGoal
              subjects={subjects}
              repeats={planRepeats}
              onUpdateSubject={updateSubject}
              onAddSubject={addSubject}
              onReplaceSubjects={replaceSubjects}
              onNext={() => goStep(addFlow ? 3 : 2)}
              mode={addFlow ? "add" : "create"}
            />
          ) : null}

          {step === 2 ? (
            <StepCalendar
              week={week}
              subjects={subjects}
              weekIndex={weekIndex}
              weekCount={weeks.length}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onPrevWeek={() => {
                setWeekIndex((prev) => Math.max(0, prev - 1));
                setSelectedBlockId(null);
              }}
              onNextWeek={() => {
                setWeekIndex((prev) => Math.min(weeks.length - 1, prev + 1));
                setSelectedBlockId(null);
              }}
              onThisWeek={() => {
                setWeekIndex(0);
                setSelectedBlockId(null);
              }}
              onAddBlock={addBlock}
              onUpdateBlock={updateBlock}
              onDeleteBlock={deleteBlock}
              onPrev={() => goStep(1)}
              onNext={finishCalendar}
            />
          ) : null}

          {step === 3 ? (
            <StepMaterials
              subjects={subjects}
              materials={materials}
              onAddFiles={addMaterials}
              onRemove={removeMaterial}
              onOpenToc={setTocMaterialId}
              onPrev={() => goStep(addFlow ? 1 : 2)}
              onNext={finishMaterials}
            />
          ) : null}

          {step === 4 ? (
            <StepUnits
              subjects={visibleSubjects}
              units={units}
              onUpdate={updateUnit}
              onRemove={removeUnit}
              onAdd={addUnit}
              onConfirmAll={confirmAllUnits}
              onPrev={() => goStep(3)}
              onNext={finishUnits}
              editMode={Boolean(rangeSubjectId)}
              onCancel={() => navigate("/manage")}
              onPreview={() => navigate(`/manage?range=${rangeSubjectId ?? ""}`)}
            />
          ) : null}

          {step === 5 ? (
            <StepAmount
              subjects={subjects}
              units={units}
              onPrev={() => goStep(4)}
              onApprove={approvePlan}
            />
          ) : null}
        </div>
      </main>

      <footer className="border-t border-[var(--ps-line)] bg-[var(--ps-paper-warm)]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-[11.5px] text-[var(--ps-muted)] sm:flex-row md:px-8">
          <p>© 2026 피뢰침. 계획은 언제든 다시 세울 수 있어요.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ps-brand)]" aria-hidden="true" />
            {step}단계 / 5단계
          </p>
        </div>
      </footer>

      {dialog ? (
        <div className="ps-overlay" role="presentation" onClick={() => setDialog(null)}>
          <div
            className="ps-modal"
            role="dialog"
            aria-modal="true"
            aria-label={dialog.title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--ps-brand-tint)]">
                <i className="ri-information-line text-[17px] leading-none text-[var(--ps-brand-deep)]" />
              </span>
              <h2 className="mt-1.5 text-[15px] font-semibold text-[var(--ps-ink)]">{dialog.title}</h2>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--ps-ink-soft)]">{dialog.message}</p>
            <div className="mt-5 flex items-center justify-end gap-2">
              {dialog.secondaryLabel ? (
                <button
                  type="button"
                  onClick={() => {
                    const action = dialog.onSecondary;
                    setDialog(null);
                    action?.();
                  }}
                  className="ps-btn-ghost"
                >
                  {dialog.secondaryLabel}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  const action = dialog.onPrimary;
                  setDialog(null);
                  action?.();
                }}
                className="ps-btn-solid"
              >
                {dialog.primaryLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tocMaterial ? (
        <TocDialog
          subjectName={subjects.find((subject) => subject.id === tocMaterial.subjectId)?.name ?? ""}
          fileName={tocMaterial.name}
          onClose={() => setTocMaterialId(null)}
          onConfirm={addTocUnits}
        />
      ) : null}
    </div>
  );
}