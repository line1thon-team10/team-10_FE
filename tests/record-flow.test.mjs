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

test('record success waits for fresh home totals and invalidates recorded focus views', async (t) => {
  const { createServer } = await import('vite');
  const { createElement } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { QueryClient, QueryClientProvider, QueryObserver } = await import('@tanstack/react-query');
  const server = await createServer({
    configFile: false,
    appType: 'custom',
    server: { middlewareMode: true, hmr: false },
    resolve: { alias: { '@': new URL('../src', import.meta.url).pathname } },
    logLevel: 'silent',
  });
  t.after(() => server.close());
  const { http } = await server.ssrLoadModule('/src/api/client.js');
  const { useRecord } = await server.ssrLoadModule('/src/hooks/useToday.js');
  const { useEndSession } = await server.ssrLoadModule('/src/hooks/useStudy.js');
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  t.after(() => client.clear());
  const capture = (useHook) => {
    let hook;
    function Probe() {
      hook = useHook();
      return null;
    }
    renderToString(createElement(QueryClientProvider, { client }, createElement(Probe)));
    return hook;
  };
  let sent;
  http.defaults.adapter = async (config) => {
    sent = JSON.parse(config.data);
    return { config, status: 200, headers: {}, data: { success: true, data: { event: null } } };
  };
  client.setQueryData(['today'], { donePages: 18, totalPages: 27, rate: 67 });
  for (const key of [['books'], ['quiz', 'today'], ['study', 'session', 'ended-id']])
    client.setQueryData(key, { before: true });
  const started = Promise.withResolvers();
  const fresh = Promise.withResolvers();
  const observer = new QueryObserver(client, {
    queryKey: ['today'],
    staleTime: Infinity,
    queryFn: () => {
      started.resolve();
      return fresh.promise;
    },
  });
  const stop = observer.subscribe(() => {});
  t.after(stop);
  let completed = false;
  const saving = capture(useRecord)
    .mutateAsync({
      taskId: 'task',
      result: 'partial',
      toPage: 13,
      sessionId: null,
    })
    .then(() => {
      completed = true;
    });
  await started.promise;
  assert.deepEqual(sent, { taskId: 'task', result: 'partial', toPage: 13 });
  assert.equal(completed, false);
  fresh.resolve({ donePages: 20, totalPages: 27, rate: 74 });
  await saving;
  assert.deepEqual(client.getQueryData(['today']), { donePages: 20, totalPages: 27, rate: 74 });
  assert.equal(client.getQueryState(['study', 'session', 'ended-id']).isInvalidated, true);
  assert.equal(client.getQueryState(['quiz', 'today']).isInvalidated, true);

  // A late active GET must not put an already-ended focus session back in cache.
  const stale = Promise.withResolvers();
  const checking = Promise.withResolvers();
  const active = { id: 'ended-id', taskId: 'task', status: 'active' };
  client.setQueryData(['study', 'active'], active);
  const activeObserver = new QueryObserver(client, {
    queryKey: ['study', 'active'],
    staleTime: Infinity,
    queryFn: () => {
      checking.resolve();
      return stale.promise;
    },
  });
  t.after(activeObserver.subscribe(() => {}));
  const late = client.invalidateQueries({ queryKey: ['study', 'active'] });
  await checking.promise;
  const ended = {
    ...active,
    status: 'ended',
    minutes: 42,
    task: { pages: 9, ranges: [], minutes: 45 },
  };
  http.defaults.adapter = async (config) => ({
    config,
    status: 200,
    headers: {},
    data: { success: true, data: ended },
  });
  const result = await capture(useEndSession).mutateAsync(ended.id);
  stale.resolve(active);
  await late;
  assert.equal(result.id, ended.id);
  assert.equal(result.minutes, 42);
  assert.equal(client.getQueryData(['study', 'active']), null);
  assert.equal(client.getQueryData(['study', 'session', ended.id]).status, 'ended');
});
