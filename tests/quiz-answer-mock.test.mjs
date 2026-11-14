import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const runtime = () =>
  createServer({
    root,
    configFile: false,
    appType: 'custom',
    server: { middlewareMode: true, hmr: false },
    resolve: { alias: { '@': `${root}/src` } },
    logLevel: 'silent',
  });

test('mock HTTP save/replay/conflict and a fresh module reload preserve inputs without changing grading policy', async (t) => {
  const prior = Object.fromEntries(
    ['location', 'sessionStorage', 'localStorage', 'addEventListener'].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  const storage = new Map();
  t.after(() => {
    for (const [key, value] of Object.entries(prior)) {
      if (value === undefined) delete globalThis[key];
      else Object.defineProperty(globalThis, key, value);
    }
  });
  let pagehide;
  globalThis.location = new URL('http://localhost');
  for (const name of ['sessionStorage', 'localStorage'])
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
    });
  globalThis.addEventListener = (event, callback) => {
    if (event === 'pagehide') pagehide = callback;
  };
  const vite = await runtime();
  let server;
  let quizId;
  let questionId;
  try {
    const { setupServer } = await import('msw/node');
    const { db } = await vite.ssrLoadModule('/src/mocks/db.js');
    const { quizHandlers } = await vite.ssrLoadModule('/src/mocks/handlers/quiz.js');
    db.seed('day9');
    const original = structuredClone({
      bookshelf: db.get().bookshelf,
      results: db.get().quizResults,
      tasks: db.get().today.tasks,
    });
    server = setupServer(...quizHandlers);
    server.listen({ onUnhandledRequest: 'error' });
    const set = (await (await fetch('http://localhost/api/quiz/ai')).json()).data;
    quizId = set.quizId;
    questionId = set.questions.find((q) => q.type === 'choice').id;
    const essayId = set.questions.find((q) => q.type === 'essay').id;
    assert.deepEqual(set.savedAnswers, []);
    assert.equal(Object.hasOwn(set.questions[0], 'page'), false);
    const put = async (id, input, status = 200) => {
      const response = await fetch(`http://localhost/api/quiz/${quizId}/answers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      assert.equal(response.status, status);
      return response.json();
    };
    const first = { choice: 0, text: null, confidence: 'sure', revision: 0 };
    assert.equal((await put(questionId, first)).data.revision, 1);
    assert.equal((await put(questionId, first)).data.revision, 1);
    assert.equal((await put(questionId, { ...first, choice: 1, revision: 1 })).data.revision, 2);
    assert.equal((await put(questionId, first)).data.revision, 1);
    assert.equal(
      (await put(questionId, { ...first, revision: 1 }, 409)).error.code,
      'ANSWER_CONFLICT',
    );
    assert.equal((await put('different-item', first, 422)).error.code, 'INVALID_INPUT');
    await put(essayId, { choice: null, text: '', confidence: 'unsure', revision: 0 });
    const recovered = (await (await fetch(`http://localhost/api/quiz/ai?quizId=${quizId}`)).json())
      .data;
    assert.deepEqual(
      recovered.savedAnswers.find((a) => a.questionId === questionId),
      { questionId, choice: 1, text: null, confidence: 'sure', revision: 2 },
    );
    assert.equal(recovered.savedAnswers.find((a) => a.questionId === essayId).text, '');
    assert.deepEqual(
      { bookshelf: db.get().bookshelf, results: db.get().quizResults, tasks: db.get().today.tasks },
      original,
    );
    await t.test(
      'hybrid routes real answer IDs to the server and leaves mock IDs to the mock handler',
      async () => {
        const { hybridHandler } = await vite.ssrLoadModule('/src/mocks/hybrid.js');
        const realQuiz = '5b5d0cbf-92be-4e92-8e5a-069378b1b18d';
        const realItem = 'ff823393-d7de-4ca2-a31f-53cf505005e2';
        for (const [quiz, item, server] of [
          [realQuiz, realItem, true],
          [quizId, questionId, false],
          [realQuiz, questionId, false],
        ]) {
          const result = await hybridHandler.run({
            request: new Request(`http://localhost/api/quiz/${quiz}/answers/${item}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(first),
            }),
            requestId: `${quiz}-${item}`,
          });
          assert.equal(result?.response?.headers.get('x-msw-intention') === 'passthrough', server);
        }
        const existing = await hybridHandler.run({
          request: new Request(`http://localhost/api/quiz/${realQuiz}`),
          requestId: 'existing-get',
        });
        assert.equal(existing.response.headers.get('x-msw-intention'), 'passthrough');
      },
    );
    pagehide();
  } finally {
    server?.close();
    await vite.close();
  }
  const fresh = await runtime();
  try {
    const { quizSetView } = await fresh.ssrLoadModule('/src/mocks/logic.js');
    assert.equal(
      quizSetView('ai', quizId).savedAnswers.find((a) => a.questionId === questionId).revision,
      2,
    );
    assert.throws(() => quizSetView('os', quizId), { code: 'NO_QUIZ' });
  } finally {
    await fresh.close();
  }
});
