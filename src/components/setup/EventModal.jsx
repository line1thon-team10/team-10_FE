import { useState } from 'react';
import Button from '@/components/common/Button.jsx';
import Modal from '@/components/common/Modal.jsx';
import { SCHEDULE_KIND } from '@/config/labels.js';
import { DAY_NAMES } from '@/config/schedule.js';

// S2 일정 추가·수정 팝업. event.id가 있으면 수정, 없으면 추가
export default function EventModal({ event, onSave, onDelete, onClose, saving }) {
  const [form, setForm] = useState(() => ({
    kind: event.kind ?? 'other',
    title: event.title ?? '',
    days: event.days ?? null,
    date: event.date ?? null,
    start: event.start ?? '09:00',
    end: event.end ?? '10:00',
  }));
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const toggleDay = (d) =>
    set({
      days: form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d].sort(),
    });
  const valid = form.title.trim() && form.start < form.end && (form.date || form.days?.length);

  return (
    <Modal
      title={event.id ? '일정 고치기' : '일정 추가'}
      onClose={onClose}
      footer={
        <>
          {event.id && (
            <Button onClick={onDelete} disabled={saving} className="mr-auto">
              삭제
            </Button>
          )}
          <Button onClick={onClose}>취소</Button>
          <Button
            variant="primary"
            disabled={!valid || saving}
            onClick={() => onSave({ ...form, title: form.title.trim() })}
          >
            저장
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-[100px_1fr] sm:items-center">
        <label htmlFor="ev-kind" className="text-sm font-semibold">
          종류
        </label>
        <select
          id="ev-kind"
          className="rounded-sm border border-line px-3 py-2"
          value={form.kind}
          onChange={(e) => set({ kind: e.target.value })}
        >
          {Object.entries(SCHEDULE_KIND).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <label htmlFor="ev-title" className="text-sm font-semibold">
          이름
        </label>
        <input
          id="ev-title"
          className="rounded-sm border border-line px-3 py-2"
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
        />
        {form.days ? (
          <>
            <span className="text-sm font-semibold">요일 (매주)</span>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <label
                  key={d}
                  className={`cursor-pointer rounded-sm border px-2.5 py-1 text-sm ${form.days.includes(d) ? 'border-ink bg-ink text-ink-fg' : 'border-line'}`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.days.includes(d)}
                    onChange={() => toggleDay(d)}
                  />
                  {DAY_NAMES[d]}
                </label>
              ))}
            </div>
          </>
        ) : (
          <>
            <label htmlFor="ev-date" className="text-sm font-semibold">
              날짜
            </label>
            <input
              id="ev-date"
              type="date"
              className="rounded-sm border border-line px-3 py-2"
              value={form.date}
              onChange={(e) => set({ date: e.target.value })}
            />
          </>
        )}
        <span className="text-sm font-semibold">시간</span>
        <div className="flex items-center gap-2">
          <input
            aria-label="시작 시간"
            type="time"
            step="1800"
            className="num rounded-sm border border-line px-3 py-2"
            value={form.start}
            onChange={(e) => set({ start: e.target.value })}
          />
          <span>–</span>
          <input
            aria-label="끝 시간"
            type="time"
            step="1800"
            className="num rounded-sm border border-line px-3 py-2"
            value={form.end}
            onChange={(e) => set({ end: e.target.value })}
          />
        </div>
      </div>
      {form.start >= form.end && (
        <p className="text-xs text-st-risk">끝 시간이 시작 시간보다 늦어야 해요.</p>
      )}
    </Modal>
  );
}
