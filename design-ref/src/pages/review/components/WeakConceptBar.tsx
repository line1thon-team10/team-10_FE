import type { WeakGroup } from "@/pages/review/types";
import { getWeakSentence } from "@/pages/review/utils";

type Props = {
  groups: WeakGroup[];
  noteCount: number;
};

export default function WeakConceptBar({ groups, noteCount }: Props) {
  const sentence = getWeakSentence(groups);

  return (
    <section className="rv-weak mt-6" aria-label="취약 개념 요약">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h2 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--qz-ink)]">
          <i className="ri-alarm-warning-line text-[14px] leading-none text-[var(--qz-brand)]" />
          취약 개념 <span className="text-[var(--qz-muted)]">(오답 2회 이상)</span>
        </h2>
        <span className="qz-chip">
          <i className="ri-article-line text-[11px] leading-none" />
          누적 {noteCount}문항
        </span>
      </div>

      <div className="rv-weak__row mt-3">
        {groups.length === 0 ? (
          <p className="text-[12px] text-[var(--qz-muted)]">
            아직 두 번 이상 틀린 개념이 없어요. 지금 페이스를 유지해 보세요.
          </p>
        ) : (
          groups.map((group) => (
            <span key={group.subject} className={`rv-weak__concept rv-accent-${group.accent}`}>
              <span className="rv-dot" aria-hidden="true" />
              {group.subject} {group.concepts.map((concept) => concept.name).join("·")}
            </span>
          ))
        )}
      </div>

      <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--qz-muted)]">
        {sentence ? `${sentence}에서 반복해서 틀렸어요. ` : ""}
        맞춤 문제 뽑기에서 이 범위만 골라 5문항으로 다시 확인할 수 있어요.
      </p>
    </section>
  );
}