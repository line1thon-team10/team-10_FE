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
import { MemoryRouter } from 'react-router';
import { toQuizSet } from '../src/api/adapters/quiz.js';
import {
  acceptAnswerSave,
  answerRequest,
  createAnswerDraft,
  draftAnswers,
  editAnswerDraft,
  refreshAnswerDraft,
} from '../src/pages/quiz/answerDraft.js';

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
async function withRuntime(run) {
  const cacheDir = await mkdtemp(join(tmpdir(), 'team10-quiz-flow-test-'));
  let vite;
  try {
    vite = await createServer({
      root,
      cacheDir,
      configFile: false,
      appType: 'custom',
      server: { middlewareMode: true, hmr: false },
      resolve: { alias: { '@': `${root}/src` } },
      esbuild: { jsx: 'automatic' },
      logLevel: 'silent',
    });
    const api = await vite.ssrLoadModule('/src/api/quiz.js');
    const { http } = await vite.ssrLoadModule('/src/api/client.js');
    await run({ vite, api, http });
  } finally {
    try {
      await vite?.close();
    } finally {
      await rm(cacheDir, { recursive: true, force: true });
    }
  }
}

test('API uses the selected set and item IDs for saves, recovery and the existing final submit', async () =>
  withRuntime(async ({ api, http }) => {
    const requests = [];
    const answer = { choice: 0, text: null, confidence: 'sure', revision: 0 };
    http.defaults.adapter = async (config) => {
      requests.push({
        method: config.method,
        url: config.url,
        params: config.params,
        body: config.data && JSON.parse(config.data),
      });
      const data =
        config.method === 'get'
          ? { ...fixture, savedAnswers: [] }
          : config.method === 'put'
            ? {
                quizId: fixture.quizId,
                questionId: config.url.split('/').at(-1),
                saved: true,
                revision: JSON.parse(config.data).revision + 1,
              }
            : { subjectId: fixture.subjectId, items: [], unitChanges: [] };
      return { data: { success: true, data }, status: 200, statusText: 'OK', headers: {}, config };
    };
    await api.getQuizSet(fixture.subjectId, false, fixture.quizId);
    const saved = await api.putQuizAnswer({
      subjectId: fixture.subjectId,
      quizId: fixture.quizId,
      questionId: fixture.questions[1].id,
      ...answer,
      score: 100,
    });
    await api.putQuizAnswer({
      quizId: fixture.quizId,
      questionId: fixture.questions[5].id,
      text: '',
      confidence: 'unsure',
      revision: 4,
    });
    await api.postQuizSubmit({
      subjectId: fixture.subjectId,
      quizId: fixture.quizId,
      answers: { [fixture.questions[1].id]: answer },
    });
    assert.deepEqual(requests[0], {
      method: 'get',
      url: `/api/quiz/${fixture.subjectId}`,
      params: { quizId: fixture.quizId },
      body: undefined,
    });
    assert.deepEqual(requests[1], {
      method: 'put',
      url: `/api/quiz/${fixture.quizId}/answers/${fixture.questions[1].id}`,
      params: undefined,
      body: answer,
    });
    assert.deepEqual(requests[2].body, {
      choice: null,
      text: '',
      confidence: 'unsure',
      revision: 4,
    });
    assert.equal(saved.revision, 1);
    assert.equal(requests[3].body.quizId, fixture.quizId);
    assert.deepEqual(requests[3].body.answers, [
      { questionId: fixture.questions[1].id, choice: 0, text: null, confidence: 'sure' },
    ]);
  }));

test('an unrelated set, item or invalid receipt cannot count as a successful save', async () =>
  withRuntime(async ({ api, http }) => {
    const request = {
      quizId: fixture.quizId,
      questionId: fixture.questions[1].id,
      choice: 0,
      text: null,
      confidence: 'sure',
      revision: 3,
    };
    const receipt = {
      quizId: request.quizId,
      questionId: request.questionId,
      saved: true,
      revision: 4,
    };
    for (const patch of [
      { quizId: 'another-set' },
      { questionId: 'another-item' },
      { saved: false },
      { revision: 0 },
      { revision: 2 },
      { revision: '4' },
      { revision: 4.5 },
    ]) {
      http.defaults.adapter = async (config) => ok(config, { ...receipt, ...patch });
      await assert.rejects(api.putQuizAnswer(request), /저장을 확인하지 못했어요/);
    }
    http.defaults.adapter = async (config) => ok(config, fixture);
    await assert.rejects(api.getQuizSet(fixture.subjectId, false, 'another-set'), /같은 퀴즈/);
  }));

test('save awaits its receipt, protects newer cached revisions and cancels an older GET before it can overwrite the save', async () =>
  withRuntime(async ({ vite, http }) => {
    const { useSaveQuizAnswer } = await vite.ssrLoadModule('/src/hooks/useQuiz.js');
    const { QK } = await vite.ssrLoadModule('/src/hooks/queryKeys.js');
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const key = QK.quizSetDetail(fixture.subjectId, false, fixture.quizId);
    const otherKey = QK.quizSetDetail(fixture.subjectId, false, 'another-set');
    const head = {
      questionId: fixture.questions[1].id,
      choice: 1,
      text: null,
      confidence: 'unsure',
      revision: 3,
    };
    const current = toQuizSet({ ...fixture, savedAnswers: [head] });
    qc.setQueryData(key, current);
    qc.setQueryData(otherKey, { ...current, quizId: 'another-set' });
    let save;
    function Probe() {
      save = useSaveQuizAnswer();
      return null;
    }
    renderToString(createElement(QueryClientProvider, { client: qc }, createElement(Probe)));
    try {
      const started = Promise.withResolvers();
      const response = Promise.withResolvers();
      http.defaults.adapter = async (config) => {
        started.resolve();
        return ok(config, await response.promise);
      };
      const request = {
        subjectId: fixture.subjectId,
        quizId: fixture.quizId,
        questionId: head.questionId,
        choice: 0,
        text: null,
        confidence: 'sure',
        revision: 0,
      };
      let completed = false;
      const pending = save.mutateAsync(request).then(() => {
        completed = true;
      });
      await started.promise;
      assert.equal(completed, false);
      assert.equal(qc.getQueryData(key).savedAnswers[0].revision, 3);
      response.resolve({
        quizId: fixture.quizId,
        questionId: head.questionId,
        saved: true,
        revision: 1,
      });
      await pending;
      assert.deepEqual(qc.getQueryData(key).savedAnswers, [head]);

      const oldRead = Promise.withResolvers();
      const reading = qc
        .fetchQuery({ queryKey: key, queryFn: () => oldRead.promise })
        .catch(() => null);
      http.defaults.adapter = async (config) =>
        ok(config, {
          quizId: fixture.quizId,
          questionId: head.questionId,
          saved: true,
          revision: 4,
        });
      await save.mutateAsync({ ...request, revision: 3 });
      oldRead.resolve(current);
      await reading;
      assert.deepEqual(qc.getQueryData(key).savedAnswers, [
        { ...head, choice: 0, confidence: 'sure', revision: 4 },
      ]);
      assert.deepEqual(qc.getQueryData(otherKey).savedAnswers, [head]);
    } finally {
      qc.clear();
    }
  }));

test('409 recovery fetches the same quiz and keeps typed input even if the first reload fails', async () =>
  withRuntime(async ({ api, http }) => {
    const set = toQuizSet(fixture);
    const questionId = fixture.questions[0].id;
    let state = editAnswerDraft(createAnswerDraft(set), questionId, {
      text: ' 내 답\n',
      confidence: 'sure',
    });
    const before = structuredClone(state);
    const requests = [];
    http.defaults.adapter = async (config) => {
      requests.push(config);
      return {
        ...ok(config, null),
        status: 409,
        data: {
          success: false,
          error: { code: 'ANSWER_CONFLICT', message: '다른 답이 저장됐어요' },
        },
      };
    };
    await assert.rejects(api.putQuizAnswer(answerRequest(state, questionId)), {
      code: 'ANSWER_CONFLICT',
    });
    http.defaults.adapter = async () => {
      throw new Error('offline');
    };
    await assert.rejects(api.getQuizSet(fixture.subjectId, false, fixture.quizId));
    assert.deepEqual(state, before);
    http.defaults.adapter = async (config) => {
      requests.push(config);
      return ok(config, {
        ...fixture,
        savedAnswers: [
          { questionId, choice: null, text: '서버의 답', confidence: 'unsure', revision: 5 },
        ],
      });
    };
    state = refreshAnswerDraft(
      state,
      await api.getQuizSet(fixture.subjectId, false, fixture.quizId),
      questionId,
    );

    test('an uncancelled set read keeps newer pinned answers while recovering other saved items', async () =>
      withRuntime(async ({ vite, http }) => {
        const { useQuizSet } = await vite.ssrLoadModule('/src/hooks/useQuiz.js');
        const { QK } = await vite.ssrLoadModule('/src/hooks/queryKeys.js');
        const qc = new QueryClient();
        const key = QK.quizSetDetail(fixture.subjectId, false, fixture.quizId);
        const head = {
          questionId: fixture.questions[1].id,
          choice: 0,
          text: null,
          confidence: 'sure',
          revision: 3,
        };
        const other = {
          questionId: fixture.questions[0].id,
          choice: null,
          text: '',
          confidence: 'unsure',
          revision: 1,
        };
        qc.setQueryData(key, toQuizSet({ ...fixture, savedAnswers: [head] }));
        function Probe() {
          useQuizSet(fixture.subjectId);
          return null;
        }
        renderToString(createElement(QueryClientProvider, { client: qc }, createElement(Probe)));
        try {
          http.defaults.adapter = async (config) =>
            ok(config, { ...fixture, savedAnswers: [{ ...head, choice: 1, revision: 2 }, other] });
          const query = qc
            .getQueryCache()
            .find({ queryKey: QK.quizSetDetail(fixture.subjectId), exact: true });
          const recovered = await qc.fetchQuery(query.options);
          assert.deepEqual(recovered.savedAnswers, [other, head]);
          assert.deepEqual(qc.getQueryData(key).savedAnswers, [other, head]);
          http.defaults.adapter = async (config) =>
            ok(config, { ...fixture, savedAnswers: [{ ...head, choice: 1, revision: 4 }, other] });
          await qc.fetchQuery(query.options);
          assert.deepEqual(qc.getQueryData(key).savedAnswers, [
            other,
            { ...head, choice: 1, revision: 4 },
          ]);
        } finally {
          qc.clear();
        }
      }));
    assert.deepEqual(requests[1].params, { quizId: fixture.quizId });
    assert.equal(draftAnswers(state)[questionId].text, ' 내 답\n');
    http.defaults.adapter = async (config) => {
      requests.push(config);
      return ok(config, { quizId: fixture.quizId, questionId, saved: true, revision: 6 });
    };
    const retry = answerRequest(state, questionId);
    state = acceptAnswerSave(state, retry, await api.putQuizAnswer(retry));
    assert.deepEqual(JSON.parse(requests[2].data), {
      choice: null,
      text: ' 내 답\n',
      confidence: 'sure',
      revision: 5,
    });
    assert.equal(answerRequest(state, questionId).revision, 6);
  }));

test('the rendered player restores choice zero and confidence without displaying answers or evidence', async () =>
  withRuntime(async ({ vite }) => {
    const { default: Quiz } = await vite.ssrLoadModule('/src/pages/quiz/S8Quiz.jsx');
    const { QK } = await vite.ssrLoadModule('/src/hooks/queryKeys.js');
    const qc = new QueryClient();
    const question = fixture.questions[1];
    qc.setQueryData(
      QK.quizSetDetail(fixture.subjectId, false, fixture.quizId),
      toQuizSet({
        ...fixture,
        questions: [
          {
            ...question,
            page: 919,
            explanation: 'DO_NOT_SHOW_EXPLANATION',
            evidence: { quote: 'DO_NOT_SHOW_EVIDENCE' },
            gradingStatus: 'DO_NOT_SHOW_GRADING',
          },
        ],
        savedAnswers: [
          { questionId: question.id, choice: 0, text: null, confidence: 'sure', revision: 2 },
        ],
      }),
    );
    try {
      const html = renderToString(
        createElement(
          QueryClientProvider,
          { client: qc },
          createElement(
            MemoryRouter,
            { initialEntries: [`/quiz?subject=${fixture.subjectId}&quizId=${fixture.quizId}`] },
            createElement(Quiz),
          ),
        ),
      );
      assert.match(html, new RegExp(`name="q-${question.id}"[^>]*checked=""`));
      assert.match(html, new RegExp(`name="conf-${question.id}"[^>]*checked=""`));
      assert.doesNotMatch(html, /919|DO_NOT_SHOW/);
      assert.match(html, /제출하고 채점하기/);
    } finally {
      qc.clear();
    }
  }));
