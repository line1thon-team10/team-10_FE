import assert from 'node:assert/strict';
import test from 'node:test';
import { toToday } from '../src/api/adapters/today.js';
import { toSession } from '../src/api/adapters/study.js';
import {
  initialRangeInput,
  recordSelection,
  rangeInputLabel,
  taskRangeLabel,
} from '../src/pages/study/recordInput.js';

const compound = {
  pages: 14,
  ranges: [
    { id: 'range-a', materialId: 'pdf-a', from: 12, to: 20, doneTo: 13 },
    { id: 'range-b', materialId: 'pdf-b', from: 1, to: 5, doneTo: null },
  ],
};

test('compound input preserves earlier completion and submits a whole snapshot', () => {
  const values = initialRangeInput(compound);
  assert.deepEqual(values, { 'range-a': '13', 'range-b': '' });
  assert.deepEqual(recordSelection(compound, values, null, true), {
    valid: true,
    completion: { completedRanges: [{ rangeId: 'range-a', toPage: 13 }] },
  });
  const changed = { ...values, 'range-b': '2' };
  assert.deepEqual(recordSelection(compound, changed, 'partial').completion, {
    completedRanges: [
      { rangeId: 'range-a', toPage: 13 },
      { rangeId: 'range-b', toPage: 2 },
    ],
  });
  assert.deepEqual(values, { 'range-a': '13', 'range-b': '' });
  assert.equal(taskRangeLabel(compound), '2개 범위');
  assert.match(rangeInputLabel(compound, compound.ranges[1], 1), /자료 2.*p.1–5/);
});

test('single range uses toPage, while clearing a correction sends an explicit empty snapshot', () => {
  const single = { pages: 9, ranges: [compound.ranges[0]] };
  assert.deepEqual(recordSelection(single, { 'range-a': '13' }, 'partial').completion, {
    toPage: 13,
  });
  assert.deepEqual(recordSelection(single, { 'range-a': '' }, null, true).completion, {
    completedRanges: [],
  });
  assert.deepEqual(recordSelection(single, { 'range-a': '20' }, null, true).completion, {
    toPage: 20,
  });
  assert.equal(recordSelection(single, { 'range-a': '20' }, 'partial').valid, false);
  assert.equal(recordSelection(single, { 'range-a': '' }, 'partial').valid, false);
});

test('invalid page edits and switching result do not erase draft input', () => {
  for (const invalid of ['11', '21', '12.5', 'text', 'Infinity']) {
    const values = { 'range-a': invalid, 'range-b': '2' };
    assert.equal(recordSelection(compound, values, 'partial').valid, false);
    assert.deepEqual(recordSelection(compound, values, 'none'), { valid: true, completion: {} });
    assert.deepEqual(recordSelection(compound, values, 'done'), { valid: true, completion: {} });
    assert.equal(values['range-a'], invalid);
    assert.equal(values['range-b'], '2');
  }
});

test('page-less and overlapping ranges keep server totals instead of deriving a preview', () => {
  const empty = { pages: 0, ranges: [] };
  assert.deepEqual(initialRangeInput(empty), {});
  assert.equal(recordSelection(empty, {}, 'partial').valid, false);
  assert.equal(recordSelection(empty, {}, 'done').valid, true);
  assert.equal(recordSelection(empty, {}, 'none').valid, true);
  assert.equal(taskRangeLabel(empty), '페이지 없는 학습');
  const overlap = {
    pages: 9,
    ranges: [compound.ranges[0], { ...compound.ranges[0], id: 'overlap' }],
  };
  const picked = recordSelection(overlap, { 'range-a': '13', overlap: '14' }, 'partial');
  assert.deepEqual(
    picked.completion.completedRanges.map((item) => item.toPage),
    [13, 14],
  );
  assert.equal(overlap.pages, 9);
  assert.equal('rate' in picked, false);
});

test('mock response shapes retain the day9 seed and single-page record compatibility', async (t) => {
  const previous = globalThis.addEventListener;
  globalThis.addEventListener = () => {};
  t.after(() => {
    if (previous) globalThis.addEventListener = previous;
    else delete globalThis.addEventListener;
  });
  const { db } = await import('../src/mocks/db.js');
  const { buildToday, activeSessionView, finishSession, recordTask } =
    await import('../src/mocks/logic.js');
  db.seed('day9');
  const before = toToday(buildToday());
  assert.equal(before.progress.donePages, 18);
  assert.equal(before.progress.totalPages, 27);
  const active = toSession(activeSessionView());
  const task = before.tasks.find((item) => item.id === active.taskId);
  assert.equal(task.pages, 9);
  assert.equal(task.ranges[0].from, 12);
  assert.equal(task.ranges[0].to, 20);
  assert.deepEqual(active.task.ranges, task.ranges);
  const ended = toSession(finishSession(active.id));
  assert.equal(ended.minutes, 42);
  assert.equal(ended.status, 'ended');
  recordTask(task.id, 'partial', 13, ended.id);
  const after = toToday(buildToday());
  assert.equal(after.progress.donePages, 20);
  assert.equal(after.progress.totalPages, 27);
  assert.equal(after.progress.rate, 74);
  const recorded = after.tasks.find((item) => item.id === task.id);
  assert.equal(recorded.ranges[0].doneTo, 13);
  assert.equal(recorded.measuredMinutes, 42);
  assert.equal(recorded.pendingSessionId, null);
});
