import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const fixture = JSON.parse(
  await readFile(new URL('../docs/api-fixtures/quiz-unanswered.json', import.meta.url)),
).cases[0].response.body.data;

test('API uses the selected set and item IDs for saves, recovery and the existing final submit', async () => {
  const vite = await createServer({
    root,
    configFile: false,
    appType: 'custom',
    server: { middlewareMode: true, hmr: false },
    resolve: { alias: { '@': `${root}/src` } },
    logLevel: 'silent',
  });
  try {
    const api = await vite.ssrLoadModule('/src/api/quiz.js');
    const { http } = await vite.ssrLoadModule('/src/api/client.js');
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
                questionId: fixture.questions[1].id,
                saved: true,
                revision: 1,
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
  } finally {
    await vite.close();
  }
});
