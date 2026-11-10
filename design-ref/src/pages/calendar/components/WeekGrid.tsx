import type { CalBlock, CalWeek } from "@/pages/calendar/types";
import {
  CAL_HOURS,
  CAL_HOUR_HEIGHT,
  blockHeight,
  blockRange,
  blockTop,
  kindClass,
} from "@/pages/calendar/utils";

type Props = {
  week: CalWeek;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

function BlockButton({
  block,
  selected,
  onSelect,
}: {
  block: CalBlock;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const height = blockHeight(block);
  return (
    <button
      type="button"
      onClick={() => onSelect(block.id)}
      title={`${block.title} ${blockRange(block)}`}
      aria-pressed={selected}
      className={`cl-block ${kindClass(block)} ${selected ? "is-selected" : ""} ${
        height < 34 ? "cl-block--tight" : ""
      }`}
      style={{ top: blockTop(block), height }}
    >
      <span className="cl-block-title">{block.title}</span>
      <span className="cl-block-time">{blockRange(block)}</span>
    </button>
  );
}

export default function WeekGrid({ week, selectedId, onSelect }: Props) {
  return (
    <div className="cl-scroll">
      <div className="cl-min">
        <div className="cl-head">
          <span aria-hidden="true" />
          {week.days.map((day) => (
            <div key={`${week.id}-${day.date}-head`} className={`cl-dhead ${day.today ? "is-today" : ""}`}>
              <span className="cl-dhead-day">
                {day.label} {day.date}
                {day.today ? " · 오늘" : ""}
              </span>
              {day.exam ? (
                <span className="cl-dhead-exam" title={day.exam}>
                  {day.exam}
                </span>
              ) : day.memo ? (
                <span className="cl-dhead-memo">{day.memo}</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="cl-body">
          <div>
            {CAL_HOURS.map((hour) => (
              <div key={hour} className="cl-axis-cell" style={{ height: CAL_HOUR_HEIGHT }}>
                {`${String(hour).padStart(2, "0")}:00`}
              </div>
            ))}
          </div>

          {week.days.map((day, dayIndex) => (
            <div
              key={`${week.id}-${day.date}-col`}
              className={`cl-col ${day.today ? "is-today" : ""}`}
            >
              {CAL_HOURS.map((hour) => (
                <div key={`${day.date}-${hour}`} className="cl-slot" style={{ height: CAL_HOUR_HEIGHT }} />
              ))}
              {week.blocks
                .filter((block) => block.day === dayIndex)
                .map((block) => (
                  <BlockButton
                    key={block.id}
                    block={block}
                    selected={selectedId === block.id}
                    onSelect={onSelect}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}