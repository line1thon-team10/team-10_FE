import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { toCompletionInput, toFixResult, toTask, toToday } from './today.js';
import { toSession } from './study.js';

const fixture = (name) =>
  JSON.parse(readFileSync(new URL(`../../../docs/api-fixtures/${name}.json`, import.meta.url)));
const dataOf = (entry) => entry.response.body.data;

test('manual records omit nullable optional fields and keep zero-page corrections', () => {
  assert.deepEqual(toCompletionInput({ sessionId: null, toPage: null }), {});
  assert.deepEqual(toCompletionInput({}), {});
  assert.deepEqual(toCompletionInput({ completedRanges: [], sessionId: null }), {
    completedRanges: [],
  });
  assert.deepEqual(toCompletionInput({ toPage: 13, sessionId: 'returned-session-id' }), {
    toPage: 13,
    sessionId: 'returned-session-id',
  });
});

test('range snapshots and UUIDs are not converted into display identifiers', () => {
  const ranges = [
    { rangeId: 'dcb111a3-4671-485c-97b3-7155d1cdc101', toPage: 13 },
    { rangeId: '5e38b551-60ed-4f23-aef6-8f642f28f778', toPage: 2 },
  ];
  assert.deepEqual(toCompletionInput({ completedRanges: ranges }), { completedRanges: ranges });
  // Do not silently choose one of two conflicting inputs; the server validates them.
  assert.deepEqual(toCompletionInput({ toPage: 13, completedRanges: ranges }), {
    toPage: 13,
    completedRanges: ranges,
  });
});

test('page totals stay authoritative for overlapping, compound and empty ranges', () => {
  const raw = {
    id: 'task',
    from: null,
    to: null,
    pages: 14,
    donePages: 2,
    ranges: [
      { id: 'a', materialId: 'pdf-a', unitId: 'unit-a', from: 12, to: 20, doneTo: 13 },
      { id: 'b', materialId: 'pdf-b', unitId: 'unit-b', from: 1, to: 5, doneTo: null },
    ],
  };
  const task = toTask(raw);
  assert.equal(task.pages, 14);
  assert.equal(task.donePages, 2);
  assert.equal(task.from, null);
  assert.equal(task.ranges[0].doneTo, 13);
  assert.equal(task.ranges[1].materialId, 'pdf-b');
  assert.equal(task.ranges[1].conceptId, null);
  assert.equal(toTask({ ...raw, from: 1, to: 100, pages: 7 }).pages, 7);
  assert.equal(toTask({ ...raw, from: null, to: null, pages: 0, ranges: [] }).pages, 0);
  assert.deepEqual(toTask({ ...raw, ranges: [] }).ranges, []);
  const fixed = toFixResult({ ...raw, taskId: raw.id, status: 'partial', rate: 74 });
  assert.equal(fixed.donePages, 2);
  assert.deepEqual(fixed.ranges, task.ranges);
});

test('captured day9 and compound responses retain server totals and session links', () => {
  for (const name of ['study-day9', 'study-compound']) {
    for (const entry of fixture(name).cases) {
      if (entry.request.path !== '/api/today' || entry.response.status !== 200) continue;
      const raw = dataOf(entry);
      const today = toToday(raw);
      assert.deepEqual(today.progress, raw.progress);
      for (const [index, task] of today.tasks.entries()) {
        assert.equal(task.pages, raw.tasks[index].pages);
        assert.equal(task.donePages, raw.tasks[index].donePages);
        assert.deepEqual(task.ranges, raw.tasks[index].ranges);
        assert.equal(task.pendingSessionId, raw.tasks[index].pendingSessionId);
      }
    }
  }
});

test('focus responses preserve server measurement and optional material', () => {
  const raw = {
    id: 'ended-session',
    taskId: 'task',
    task: { title: '복합', from: null, to: null, pages: 14, ranges: [], minutes: 45 },
    status: 'ended',
    material: null,
    minutes: 42,
    pausedMinutes: 3,
    todayMinutes: 100,
    subjectMinutes: 80,
  };
  const session = toSession(raw);
  assert.equal(session.id, raw.id);
  assert.deepEqual(session.task, raw.task);
  assert.equal(session.minutes, 42);
  assert.equal(session.todayMinutes, 100);
  assert.equal(session.subjectMinutes, 80);
  assert.equal(session.material, null);
  assert.equal(toSession(null), null);
});
