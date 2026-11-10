import { useState } from "react";
import type { PlanMaterial, PlanSubject } from "@/pages/plan/types";
import AiWait from "@/components/feature/AiWait";

const ACCEPT = ".pdf";

const STAGE_LABEL = {
  text: "글자 읽는 중",
  toc: "목차 찾는 중",
  concept: "개념 추출 중",
} as const;

const STAGE_ORDER = ["text", "toc", "concept"] as const;

type Props = {
  subjects: PlanSubject[];
  materials: PlanMaterial[];
  onAddFiles: (subjectId: string, files: File[]) => void;
  onRemove: (id: string) => void;
  onOpenToc: (materialId: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function StepMaterials({
  subjects,
  materials,
  onAddFiles,
  onRemove,
  onOpenToc,
  onPrev,
  onNext,
}: Props) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const totalPages = materials.reduce((sum, item) => sum + item.pages, 0);
  const pagesOf = (subjectId: string) =>
    materials.filter((item) => item.subjectId === subjectId).reduce((sum, item) => sum + item.pages, 0);
  const maxPages = Math.max(1, ...subjects.map((subject) => pagesOf(subject.id)));
  const readingCount = materials.filter((item) => item.status === "reading").length;

  return (
    <div className="ps-rise">
      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[25px] leading-snug text-[var(--ps-ink)] md:text-[31px]">
            시험 범위 자료를 올려 주세요
          </h1>
          <p className="mt-2.5 max-w-[620px] text-[13px] leading-relaxed text-[var(--ps-muted)]">
            과목마다 PDF를 올리면 AI가 쪽수를 읽고 단원을 나눠요. 교수님이 강조한 범위만 잘라 올려도 괜찮습니다. PPT는 PDF로 바꿔 올려 주세요.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onPrev} className="ps-btn-ghost">
            이전
          </button>
          <button type="button" onClick={onNext} className="ps-btn-solid">
            다음: 단원 확인
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="ps-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ps-line)] px-5 py-3.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="ps-mark">
                <i className="ri-file-upload-line text-[14px] leading-none" />
              </span>
              <h2 className="truncate text-[13.5px] font-semibold text-[var(--ps-ink)]">과목별 자료</h2>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10.5px] font-medium text-[var(--ps-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ps-brand)]" />
              {materials.length}개 파일 · {totalPages}쪽
            </span>
          </div>

          {readingCount > 0 ? (
            <div className="border-b border-[var(--ps-line)] px-5 py-3.5">
              <AiWait tone="plan" bare label={`AI가 ${readingCount}개 파일의 글자와 목차를 읽고 있어요`}>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] leading-relaxed text-[var(--ps-ink-soft)]">
                  <span className="ps-ai-mark">AI</span>
                  <span>
                    자료 {materials.length}개 · {totalPages}쪽을 읽었어요. 단원을 찾으면 4단계에서 확인할 수 있어요.
                  </span>
                </p>
              </AiWait>
            </div>
          ) : null}

          <div className="divide-y divide-[var(--ps-line)]">
            {subjects.map((subject) => {
              const list = materials.filter((item) => item.subjectId === subject.id);
              const isOver = dragOverId === subject.id;
              return (
                <div key={subject.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-1.5 w-1.5 flex-none rounded-full bg-[var(--ps-brand)]" />
                      <p className="truncate text-[13px] font-semibold text-[var(--ps-ink)]">{subject.name}</p>
                      <span className="whitespace-nowrap text-[11px] text-[var(--ps-muted)]">시험 {subject.examDate}</span>
                    </div>
                    <span className="whitespace-nowrap text-[11px] text-[var(--ps-muted)]">
                      {list.length}개 파일 · {pagesOf(subject.id)}쪽
                    </span>
                  </div>

                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverId(subject.id);
                    }}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragOverId(null);
                      onAddFiles(subject.id, Array.from(event.dataTransfer.files));
                    }}
                    className={`mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed px-3.5 py-3 transition-colors ${
                      isOver
                        ? "border-[var(--ps-brand)] bg-[var(--ps-brand-tint)]"
                        : "border-[var(--ps-line-strong)] bg-white/[0.02]"
                    }`}
                  >
                    <p className="flex min-w-0 items-center gap-2 text-[11.5px] leading-relaxed text-[var(--ps-muted)]">
                      <i className="ri-upload-cloud-2-line text-[15px] leading-none text-[var(--ps-brand-deep)]" />
                      <span className="min-w-0">PDF를 끌어다 놓거나</span>
                    </p>
                    <label className="ps-btn-ghost cursor-pointer px-3 py-1.5 text-[11.5px]">
                      파일 선택
                      <input
                        type="file"
                        multiple
                        accept={ACCEPT}
                        className="hidden"
                        onChange={(event) => {
                          const files = event.target.files ? Array.from(event.target.files) : [];
                          if (files.length) onAddFiles(subject.id, files);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {list.length ? (
                    <ul className="mt-2.5 flex flex-col gap-2">
                      {list.map((item) => {
                        const reading = item.status === "reading";
                        const stage = item.readStage ?? "text";
                        const stageIndex = STAGE_ORDER.indexOf(stage);
                        return (
                          <li
                            key={item.id}
                            className="rounded-lg border border-[var(--ps-line)] bg-white/[0.02] px-3 py-2.5"
                          >
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-[var(--ps-brand-tint)]">
                                <i className="ri-file-pdf-2-line text-[14px] leading-none text-[var(--ps-brand-deep)]" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[12px] font-medium text-[var(--ps-ink)]">
                                  {item.name}
                                </span>
                                <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10.5px] text-[var(--ps-muted)]">
                                  <span>{item.sizeLabel}</span>
                                  <span>·</span>
                                  <span>{item.pages}쪽</span>
                                  <span>·</span>
                                  {reading ? (
                                    <span className="inline-flex items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1" aria-hidden="true">
                                        {STAGE_ORDER.map((key, index) => (
                                          <span
                                            key={key}
                                            className={`h-1 w-3 rounded-full ${
                                              index <= stageIndex
                                                ? "bg-[var(--ps-brand)]"
                                                : "bg-[var(--ps-line-strong)]"
                                            }`}
                                          />
                                        ))}
                                      </span>
                                      <span className="text-[var(--ps-brand-deep)]">{STAGE_LABEL[stage]}</span>
                                    </span>
                                  ) : item.status === "failed" ? (
                                    <span className="text-[var(--ps-brand-deep)]">목차를 읽지 못했어요</span>
                                  ) : (
                                    <>
                                      <span className="text-[var(--ps-brand-deep)]">단원 인식 완료</span>
                                      {item.status === "scan-low" || item.manualToc ? (
                                        <span className="inline-flex items-center rounded-full border border-[var(--ps-line-strong)] bg-white/[0.04] px-1.5 py-[1px] text-[9.5px] font-medium text-[var(--ps-muted)]">
                                          퀴즈 없음
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </span>
                              </span>

                              {item.status === "failed" ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenToc(item.id)}
                                  className="ps-btn-ghost shrink-0 px-2.5 py-1 text-[10.5px]"
                                >
                                  <i className="ri-edit-2-line text-[11px] leading-none" />
                                  목차 직접 입력
                                </button>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => onRemove(item.id)}
                                aria-label={`${item.name} 삭제`}
                                className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-md text-[var(--ps-muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--ps-ink)]"
                              >
                                <i className="ri-close-line text-[15px] leading-none" />
                              </button>
                            </div>

                            {item.status === "scan-low" ? (
                              <p className="mt-2 flex items-start gap-1.5 rounded-md bg-white/[0.03] px-2.5 py-2 text-[10.5px] leading-relaxed text-[var(--ps-muted)]">
                                <i className="ri-error-warning-line mt-[2px] text-[11px] leading-none text-[var(--ps-brand-deep)]" />
                                <span className="min-w-0">
                                  글자가 흐려서 이 파일은 퀴즈를 만들지 않아요. 계획·기록·책 쌓기는 그대로 돼요.
                                </span>
                              </p>
                            ) : null}

                            {item.status === "failed" ? (
                              <p className="mt-2 flex items-start gap-1.5 rounded-md bg-[var(--ps-brand-tint)] px-2.5 py-2 text-[10.5px] leading-relaxed text-[var(--ps-brand-deep)]">
                                <i className="ri-information-line mt-[2px] text-[11px] leading-none" />
                                <span className="min-w-0">
                                  PDF 글자를 읽지 못해 목차를 찾지 못했어요. 단원 이름과 페이지를 직접 적으면 계획에
                                  넣을 수 있어요.
                                </span>
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2.5 rounded-lg bg-white/[0.02] px-3 py-2 text-[11px] leading-relaxed text-[var(--ps-muted)]">
                      아직 자료가 없어요. 이 과목 자료를 올려야 단원이 만들어집니다.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="ps-card p-5">
            <h2 className="text-[14px] font-semibold text-[var(--ps-ink)]">자료 현황</h2>
            <ul className="mt-3.5 flex flex-col gap-3">
              {subjects.map((subject) => {
                const pages = pagesOf(subject.id);
                const width = Math.round((pages / maxPages) * 100);
                return (
                  <li key={subject.id}>
                    <div className="flex items-center justify-between gap-2 text-[11.5px]">
                      <span className="truncate font-medium text-[var(--ps-ink-soft)]">{subject.name}</span>
                      <span className="whitespace-nowrap text-[var(--ps-muted)]">{pages}쪽</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-[var(--ps-brand)] transition-all"
                        style={{ width: `${pages ? Math.max(6, width) : 0}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-[11px] leading-relaxed text-[var(--ps-muted)]">
              총 <strong className="font-semibold text-[var(--ps-ink-soft)]">{totalPages}쪽</strong>을 읽었어요. PDF는
              글자 인식이 어려우면 퀴즈 없이 단원만 나눠요.
            </p>
          </div>

          <div className="ps-card p-5">
            <h2 className="text-[14px] font-semibold text-[var(--ps-ink)]">올릴 때 확인해 주세요</h2>
            <ul className="mt-3 flex flex-col gap-2 text-[11.5px] leading-relaxed text-[var(--ps-ink-soft)]">
              <li className="flex items-start gap-2">
                <i className="ri-check-line mt-0.5 text-[12px] leading-none text-[var(--ps-brand-deep)]" />
                <span className="min-w-0">교수님이 강조한 페이지만 잘라 올려도 돼요.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line mt-0.5 text-[12px] leading-none text-[var(--ps-brand-deep)]" />
                <span className="min-w-0">PPT는 PDF로 바꿔 올려 주세요.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line mt-0.5 text-[12px] leading-none text-[var(--ps-brand-deep)]" />
                <span className="min-w-0">한 과목에 여러 파일을 올려도 한 번에 합쳐서 읽어요.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--ps-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11.5px] leading-relaxed text-[var(--ps-muted)]">
          올린 자료는 계획을 세우는 동안에만 쓰이고, 언제든 지울 수 있어요.
        </p>
        <button type="button" onClick={onNext} className="ps-btn-solid w-full justify-center sm:w-auto">
          다음: 단원 확인
          <i className="ri-arrow-right-line text-[14px] leading-none" />
        </button>
      </div>
    </div>
  );
}