import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fromAnswer, fromAnswers, toQuizSet, toSavedAnswer } from './quiz.js';

const fixture = JSON.parse(
  await readFile(new URL('../../../docs/api-fixtures/quiz-unanswered.json', import.meta.url)),
).cases[0].response.body.data;

test('captured unanswered set retains the actual set, item and material IDs without invented input', () => {
  const set = toQuizSet(fixture);
  assert.equal(set.quizId, '5b5d0cbf-92be-4e92-8e5a-069378b1b18d');
  assert.equal(set.questions[0].id, '4516ba73-914c-4b6d-8a12-b821fa2aa08e');
  assert.equal(set.questions[0].materialId, '2f1e33ef-719d-4f71-a998-5fac78d64460');
  assert.equal(set.questions[0].unitId, '66502536-2a38-41fc-a339-6c56a1be658b');
  assert.deepEqual(set.savedAnswers, []);
});

test('recovery preserves choice zero, an empty essay and raw whitespace, without grading information', () => {
  const answers = [
    { questionId: fixture.questions[1].id, choice: 0, text: null, confidence: 'sure', revision: 3 },
    {
      questionId: fixture.questions[5].id,
      choice: null,
      text: '',
      confidence: 'unsure',
      revision: 1,
    },
    {
      questionId: fixture.questions[0].id,
      choice: null,
      text: '  답\n',
      confidence: 'sure',
      revision: 2,
    },
  ];
  const secret = {
    page: 13,
    correct: true,
    score: 100,
    explanation: '정답',
    evidence: { quote: '근거' },
    gradingStatus: 'done',
  };
  const set = toQuizSet({
    ...fixture,
    ...secret,
    questions: fixture.questions.map((q) => ({ ...q, ...secret })),
    savedAnswers: answers.map((a) => ({ ...a, ...secret })),
  });
  assert.deepEqual(set.savedAnswers, answers);
  for (const object of [set, ...set.questions, ...set.savedAnswers]) {
    for (const key of Object.keys(secret)) assert.equal(Object.hasOwn(object, key), false, key);
  }
});

test('PUT projects only answer input and revision; final submit does not leak local bookkeeping', () => {
  const choice = { choice: 0, text: null, confidence: 'sure', revision: 0 };
  assert.deepEqual(
    fromAnswer({ ...choice, quizId: 'set', questionId: 'item', subjectId: 'subject', score: 99 }),
    choice,
  );
  assert.deepEqual(fromAnswer({ text: '', confidence: 'unsure', revision: 2 }), {
    choice: null,
    text: '',
    confidence: 'unsure',
    revision: 2,
  });
  assert.deepEqual(fromAnswers({ item: { ...choice, dirty: true } }), [
    {
      questionId: 'item',
      choice: 0,
      text: null,
      confidence: 'sure',
    },
  ]);
  assert.deepEqual(
    toSavedAnswer({ quizId: 'set', questionId: 'item', saved: true, revision: 3, score: 100 }),
    {
      quizId: 'set',
      questionId: 'item',
      saved: true,
      revision: 3,
    },
  );
});
