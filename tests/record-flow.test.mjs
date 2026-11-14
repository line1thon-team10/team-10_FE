import assert from 'node:assert/strict';
import test from 'node:test';
import { toToday } from '../src/api/adapters/today.js';
import { toSession } from '../src/api/adapters/study.js';

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
