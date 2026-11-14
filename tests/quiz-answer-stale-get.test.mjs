import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toQuizSet } from '../src/api/adapters/quiz.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const fixture = JSON.parse(
  await readFile(new URL('../docs/api-fixtures/quiz-unanswered.json', import.meta.url)),
).cases[0].response.body.data;
const ok = (config, data) => ({
  data: { success: true, data },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

test('a cancelled unpinned GET cannot overwrite the newer pinned saved-answer revision', async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), 'team10-fe03a-independent-'));
  const vite = await createServer({
    root,
    cacheDir,
    configFile: false,
    appType: 'custom',
    server: { middlewareMode: true, hmr: false },
    resolve: { alias: { '@': `${root}/src` } },
    esbuild: { jsx: 'automatic' },
    logLevel: 'silent',
  });
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } },
  });
  try {
    const { http } = await vite.ssrLoadModule('/src/api/client.js');
    const { useQuizSet, useSaveQuizAnswer } = await vite.ssrLoadModule('/src/hooks/useQuiz.js');
    const { QK } = await vite.ssrLoadModule('/src/hooks/queryKeys.js');
    const unpinned = QK.quizSetDetail(fixture.subjectId, false, null);
    const pinned = QK.quizSetDetail(fixture.subjectId, false, fixture.quizId);
    const oldHead = {
      questionId: fixture.questions[1].id,
      choice: 1,
      text: null,
      confidence: 'unsure',
      revision: 1,
    };
    const oldSet = { ...fixture, savedAnswers: [oldHead] };
    qc.setQueryData(unpinned, toQuizSet(oldSet));
    qc.setQueryData(pinned, toQuizSet(oldSet));
    let save;
    function Hooks() {
      useQuizSet(fixture.subjectId, false, null);
      save = useSaveQuizAnswer();
      return null;
    }
    renderToString(createElement(QueryClientProvider, { client: qc }, createElement(Hooks)));
    const started = Promise.withResolvers();
    const release = Promise.withResolvers();
    const fnFinished = Promise.withResolvers();
    http.defaults.adapter = async (config) => {
      if (config.method === 'get') {
        started.resolve();
        await release.promise;
        return ok(config, oldSet);
      }
      return ok(config, {
        quizId: fixture.quizId,
        questionId: oldHead.questionId,
        saved: true,
        revision: 2,
      });
    };
    const registered = qc.getQueryCache().find({ queryKey: unpinned, exact: true }).options;
    const actualQueryFn = registered.queryFn;
    const read = qc
      .fetchQuery({
        ...registered,
        queryFn: async (context) => {
          try {
            return await actualQueryFn(context);
          } finally {
            fnFinished.resolve();
          }
        },
      })
      .catch(() => null);
    await started.promise;
    await save.mutateAsync({
      subjectId: fixture.subjectId,
      quizId: fixture.quizId,
      questionId: oldHead.questionId,
      choice: 0,
      text: null,
      confidence: 'sure',
      revision: 1,
    });
    assert.equal(qc.getQueryData(pinned).savedAnswers[0].revision, 2);
    release.resolve();
    await fnFinished.promise;
    await read;
    assert.deepEqual(qc.getQueryData(pinned).savedAnswers, [
      {
        ...oldHead,
        choice: 0,
        confidence: 'sure',
        revision: 2,
      },
    ]);
  } finally {
    qc.clear();
    await vite.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
});
