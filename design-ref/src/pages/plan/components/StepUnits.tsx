import { useMemo } from "react";
import type { PlanSubject, PlanUnit } from "@/pages/plan/types";
import { unitPages } from "@/pages/plan/utils";

type Props = {
  subjects: PlanSubject[];
  units: PlanUnit[];
  onUpdate: (id: string, patch: Partial<PlanUnit>) => void;
  onRemove: (id: string) => void;
  onAdd: (subjectId: string) => void;
  onConfirmAll: (subjectId: string) => void;
  onPrev: () => void;
  onNext: () => void;
  /** 관리 화면에서 범위만 고치러 들어온 경우 */
  editMode?: boolean;
  onCancel?: () => void;
  onPreview?: () => void;
};

export default function StepUnits({
  subjects,
  units,
  onUpdate,
  onRemove,
  onAdd,
  onConfirmAll,
  onPrev,
  onNext,
  editMode = false,
  onCancel,
  onPreview,
}: Props) {
  const stats = useMemo(() => {
    const included = units.filter((unit) => unit.confirmed);
    const pages = included.reduce((sum, unit) => sum + unitPages(unit.startPage, unit.endPage), 0);
    return { total: units.length, included: included.length, pages };
  }, [units]);

  return (
    <div className="ps-rise">
      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[25px] leading-snug text-[var(--ps-ink)] md:text-[31px]">
            {editMode ? "바꿀 시험 범위만 골라 주세요" : "AI가 나눈 단원이 맞는지 봐 주세요"}
          </h1>
          <p className="mt-2.5 max-w-[620px] text-[13px] leading-relaxed text-[var(--ps-muted)]">
            {editMode
              ? "체크한 단원만 계획에 들어가요. 체크를 풀면 그 단원은 계획·퀴즈·진도율에서 빠집니다."
              : "처음에는 모든 단원이 시험 범위로 체크되어 있어요. 빼고 싶은 단원만 체크를 풀면 됩니다."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {editMode ? (
            <button type="button" onClick={onCancel} className="ps-btn-ghost">
              취소
            </button>
          ) : (
            <>
              <button type="button" onClick={onPrev} className="ps-btn-ghost">
                이전
              </button>
              <button type="button" onClick={onNext} className="ps-btn-solid">
                다음: 분량 확인
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4">
          {subjects.map((subject) => {
            const list = units.filter((unit) => unit.subjectId === subject.id);
            const included = list.filter((unit) => unit.confirmed).length;
            const pages = list
              .filter((unit) => unit.confirmed)
              .reduce((sum, unit) => sum + unitPages(unit.startPage, unit.endPage), 0);
            return (
              <div key={subject.id} className="ps-card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[var(--ps-line)] px-4 py-3.5 sm:px-5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="ps-ai-mark">AI</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-[var(--ps-ink)]">
                        {subject.name}
                      </span>
                      <span className="block text-[10.5px] text-[var(--ps-muted)]">
                        {list.length}단원 · 시험 범위 {included}/{list.length} 단원 · {pages}p
                      </span>
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onConfirmAll(subject.id)}
                      disabled={list.length === 0 || included === list.length}
                      className="ps-btn-ghost px-2.5 py-1.5 text-[11px] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <i className="ri-check-double-line text-[12px] leading-none" />
                      전체 포함
                    </button>
                    <button
                      type="button"
                      onClick={() => onAdd(subject.id)}
                      className="ps-btn-ghost px-2.5 py-1.5 text-[11px]"
                    >
                      <i className="ri-add-line text-[12px] leading-none" />
                      단원 추가
                    </button>
                  </div>
                </div>

                {list.length === 0 ? (
                  <p className="px-5 py-6 text-[11.5px] leading-relaxed text-[var(--ps-muted)]">
                    이 과목은 아직 단원이 없어요. 자료를 올리거나 [단원 추가]로 직접 만들 수 있어요.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--ps-line)]">
                    {list.map((unit) => (
                      <li
                        key={unit.id}
                        className={`px-4 py-3 sm:px-5 ${unit.confirmed ? "" : "bg-white/[0.015]"}`}
                      >
                        <div
                          className={`flex flex-col gap-2 sm:flex-row sm:items-center ${
                            unit.confirmed ? "" : "opacity-45"
                          }`}
                        >
                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onUpdate(unit.id, { confirmed: !unit.confirmed })}
                              aria-pressed={unit.confirmed}
                              aria-label={`${unit.title} 시험 범위`}
                              className={`flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded-md border transition-colors ${
                                unit.confirmed
                                  ? "border-[var(--ps-brand)] bg-[var(--ps-brand)] text-[#180f05]"
                                  : "border-[var(--ps-line-strong)] text-transparent hover:border-[var(--ps-ink-soft)]"
                              }`}
                            >
                              <i className="ri-check-line text-[12px] leading-none" />
                            </button>
                            <span className="whitespace-nowrap text-[10.5px] font-medium text-[var(--ps-muted)]">
                              시험 범위
                            </span>
                          </div>

                          <input
                            type="text"
                            value={unit.title}
                            onChange={(event) => onUpdate(unit.id, { title: event.target.value })}
                            aria-label={`${subject.name} 단원 이름`}
                            className="ps-field box-border min-w-0 flex-1"
                          />

                          {unit.quizDisabled ? (
                            <span className="shrink-0 whitespace-nowrap rounded-full border border-[var(--ps-line-strong)] bg-white/[0.04] px-1.5 py-[1px] text-[9.5px] font-medium text-[var(--ps-muted)]">
                              퀴즈 없음
                            </span>
                          ) : null}

                          <div className="flex shrink-0 items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              value={unit.startPage}
                              onChange={(event) =>
                                onUpdate(unit.id, {
                                  startPage: Math.max(1, Number(event.target.value) || 1),
                                })
                              }
                              aria-label={`${unit.title} 시작 페이지`}
                              className="ps-field w-[68px] px-2 text-center"
                            />
                            <span className="text-[11px] text-[var(--ps-muted)]">–</span>
                            <input
                              type="number"
                              min={1}
                              value={unit.endPage}
                              onChange={(event) =>
                                onUpdate(unit.id, {
                                  endPage: Math.max(Number(event.target.value) || 1, unit.startPage),
                                })
                              }
                              aria-label={`${unit.title} 끝 페이지`}
                              className="ps-field w-[68px] px-2 text-center"
                            />
                            <span className="w-[42px] whitespace-nowrap text-[10.5px] text-[var(--ps-muted)]">
                              {unitPages(unit.startPage, unit.endPage)}쪽
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemove(unit.id)}
                              aria-label={`${unit.title} 삭제`}
                              className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-md text-[var(--ps-muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--ps-ink)]"
                            >
                              <i className="ri-close-line text-[14px] leading-none" />
                            </button>
                          </div>
                        </div>

                        {unit.confirmed ? null : (
                          <p className="mt-2 flex items-start gap-1.5 pl-0 text-[10.5px] leading-relaxed text-[var(--ps-brand-deep)] sm:pl-[92px]">
                            <i className="ri-information-line mt-[2px] text-[11px] leading-none" />
                            <span>계획·퀴즈·진도율에서 빠져요</span>
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <aside className="flex flex-col gap-4">
          <div className="ps-card p-5">
            <h2 className="text-[14px] font-semibold text-[var(--ps-ink)]">시험 범위</h2>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[26px] leading-none text-[var(--ps-ink)]">
                {stats.included}
                <span className="text-[14px] text-[var(--ps-muted)]"> / {stats.total}</span>
              </span>
              <span className="pb-1 text-[11px] text-[var(--ps-muted)]">단원 · {stats.pages}p</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-[var(--ps-brand)] transition-all"
                style={{ width: `${stats.total ? Math.round((stats.included / stats.total) * 100) : 0}%` }}
              />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--ps-muted)]">
              체크한 단원 <strong className="font-semibold text-[var(--ps-ink-soft)]">{stats.pages}쪽</strong>만
              계획에 넣어요. 체크를 풀면 그 단원은 계획·퀴즈·진도율에서 빠집니다.
            </p>
          </div>

          <div className="ps-card p-5">
            <h2 className="text-[14px] font-semibold text-[var(--ps-ink)]">이렇게 나눴어요</h2>
            <ul className="mt-3 flex flex-col gap-2.5 text-[11.5px] leading-relaxed text-[var(--ps-ink-soft)]">
              <li className="flex items-start gap-2">
                <i className="ri-book-open-line mt-0.5 text-[12px] leading-none text-[var(--ps-brand-deep)]" />
                <span className="min-w-0">목차와 굵은 제목을 기준으로 단원을 나눴어요.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-file-list-3-line mt-0.5 text-[12px] leading-none text-[var(--ps-brand-deep)]" />
                <span className="min-w-0">페이지가 겹치면 한 단원으로 합쳐서 보여드려요.</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-edit-2-line mt-0.5 text-[12px] leading-none text-[var(--ps-brand-deep)]" />
                <span className="min-w-0">틀린 곳은 이름·페이지를 직접 고치면 됩니다.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--ps-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11.5px] leading-relaxed text-[var(--ps-muted)]">
          시험 범위로 {stats.included}개 단원 · {stats.pages}p를 계획에 넣어요.
        </p>
        {editMode ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={onCancel} className="ps-btn-ghost">
              취소
            </button>
            <button type="button" onClick={onPreview} className="ps-btn-solid">
              바뀌는 날 보기
              <i className="ri-arrow-right-line text-[14px] leading-none" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={onNext} className="ps-btn-solid w-full justify-center sm:w-auto">
            다음: 분량 확인
            <i className="ri-arrow-right-line text-[14px] leading-none" />
          </button>
        )}
      </div>
    </div>
  );
}