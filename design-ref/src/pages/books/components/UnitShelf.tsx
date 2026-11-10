import type { BookUnit, PickedBlock } from "@/pages/books/types";
import { blockClass, unitSummary } from "@/pages/books/utils";

type Props = {
  units: BookUnit[];
  tone: string;
  picked: PickedBlock | null;
  onPick: (unitId: string, blockId: string) => void;
};

/** 단원마다 세로 막대 1개: 아래부터 태스크 블록을 쌓은 책 더미 */
export default function UnitShelf({ units, tone, picked, onPick }: Props) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div
        className="grid min-w-[560px] items-end gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${units.length}, minmax(0, 1fr))` }}
      >
        {units.map((unit) => (
          <div key={unit.id} className="flex min-w-0 flex-col items-center">
            <span className={`bk-score ${unit.score === null ? "text-[var(--hp-muted)]" : ""}`}>
              {unit.score === null ? "예정" : unit.score}
              {unit.score === null ? null : <small>점</small>}
            </span>

            <div className="mt-2 flex h-[176px] w-full flex-col-reverse justify-start gap-[3px]">
              {unit.blocks.map((block) => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => onPick(unit.id, block.id)}
                  aria-pressed={picked?.blockId === block.id}
                  aria-label={`${unit.no}단원 ${block.task} ${block.pages} 블록 보기`}
                  className={blockClass(unit, block, picked?.blockId === block.id)}
                />
              ))}
            </div>

            <div className="mt-2.5 flex h-[52px] w-full flex-col items-center text-center">
              <span className="flex max-w-full items-center gap-1.5">
                <span className={`bk-ribbon ${tone}`} aria-hidden="true" />
                <span className="whitespace-nowrap text-[11.5px] font-semibold text-[var(--hp-ink)]">
                  {unit.no}단원
                </span>
              </span>
              <span className="mt-0.5 line-clamp-2 text-[10.5px] leading-tight text-[var(--hp-muted)]">
                {unit.name}
              </span>
              <span className="sr-only">{unitSummary(unit)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}