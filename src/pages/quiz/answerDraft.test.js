import assert from 'node:assert/strict';
import test from 'node:test';
import {
  acceptAnswerSave,
  answerRequest,
  canSaveAnswer,
  createAnswerDraft,
  draftAnswers,
  editAnswerDraft,
  refreshAnswerDraft,
  useSavedAnswer,
} from './answerDraft.js';

const set = {
  quizId: 'set-one',
  questions: [
    { id: 'item-choice', type: 'choice', options: ['O', 'X'] },
    { id: 'item-essay', type: 'essay', options: null },
  ],
  savedAnswers: [],
};
const receipt = (request, revision) => ({
  quizId: request.quizId,
  questionId: request.questionId,
  saved: true,
  revision,
});

test('choice 0 and a deliberately empty essay are savable; absent confidence and invalid options are not', () => {
  let state = createAnswerDraft(set);
  assert.equal(canSaveAnswer(state, 'item-choice'), false);
  state = editAnswerDraft(state, 'item-choice', { choice: 0 });
  assert.equal(canSaveAnswer(state, 'item-choice'), false);
  state = editAnswerDraft(state, 'item-choice', { confidence: 'sure' });
  assert.equal(canSaveAnswer(state, 'item-choice'), true);
  for (const choice of [null, -1, 2, '0', 0.5, false]) {
    assert.equal(
      canSaveAnswer(editAnswerDraft(state, 'item-choice', { choice }), 'item-choice'),
      false,
    );
  }
  state = editAnswerDraft(state, 'item-essay', { confidence: 'unsure' });
  assert.equal(canSaveAnswer(state, 'item-essay'), true);
  assert.deepEqual(answerRequest(state, 'item-essay'), {
    quizId: 'set-one',
    questionId: 'item-essay',
    choice: null,
    text: '',
    confidence: 'unsure',
    revision: 0,
  });
});

test('refresh recovery uses only current-set item IDs and does not invent answers for unsaved items', () => {
  const answer = {
    questionId: 'item-choice',
    choice: 0,
    text: null,
    confidence: 'sure',
    revision: 4,
  };
  const state = createAnswerDraft({
    ...set,
    savedAnswers: [answer, { ...answer, questionId: 'original-question-id' }],
  });
  assert.deepEqual(Object.keys(state.items), ['item-choice', 'item-essay']);
  assert.equal(answerRequest(state, 'item-choice').revision, 4);
  assert.equal(answerRequest(state, 'item-choice').choice, 0);
  assert.equal(answerRequest(state, 'item-essay').revision, 0);
  assert.equal(canSaveAnswer(state, 'item-essay'), false);
});

test('a lost response retries the exact input/revision, while a delayed receipt cannot rewind the current answer', () => {
  let state = editAnswerDraft(createAnswerDraft(set), 'item-essay', {
    text: ' 첫 답\n',
    confidence: 'sure',
  });
  const first = answerRequest(state, 'item-essay');
  assert.deepEqual(answerRequest(state, 'item-essay'), first); // 통신 실패로 응답을 받지 못한 재시도
  state = acceptAnswerSave(state, first, receipt(first, 1));
  state = editAnswerDraft(state, 'item-essay', { text: '수정한 답' });
  const second = answerRequest(state, 'item-essay');
  assert.equal(second.revision, 1);
  state = acceptAnswerSave(state, second, receipt(second, 2));
  const before = structuredClone(state);
  state = acceptAnswerSave(state, first, receipt(first, 1));
  assert.deepEqual(state, before);
  assert.equal(answerRequest(state, 'item-essay').revision, 2);
  assert.equal(draftAnswers(state)['item-essay'].text, '수정한 답');
  assert.deepEqual(
    acceptAnswerSave(state, { ...first, quizId: 'another-set' }, receipt(first, 99)),
    state,
  );
});

test('typing after a request preserves the newer draft when its acknowledgement arrives', () => {
  let state = editAnswerDraft(createAnswerDraft(set), 'item-essay', {
    text: '전송한 답',
    confidence: 'sure',
  });
  const request = answerRequest(state, 'item-essay');
  state = editAnswerDraft(state, 'item-essay', { text: '아직 보내지 않은 답' });
  state = acceptAnswerSave(state, request, receipt(request, 1));
  assert.equal(draftAnswers(state)['item-essay'].text, '아직 보내지 않은 답');
  assert.equal(state.items['item-essay'].head.text, '전송한 답');
  assert.equal(answerRequest(state, 'item-essay').revision, 1);
});

test('conflict refresh keeps the writer input and updates its revision; server input is an explicit choice', () => {
  let state = editAnswerDraft(createAnswerDraft(set), 'item-essay', {
    text: '내 입력\n',
    confidence: 'sure',
  });
  const server = {
    ...set,
    savedAnswers: [
      {
        questionId: 'item-essay',
        choice: null,
        text: '다른 창의 답',
        confidence: 'unsure',
        revision: 3,
      },
      { questionId: 'item-choice', choice: 0, text: null, confidence: 'sure', revision: 1 },
    ],
  };
  state = refreshAnswerDraft(state, server, 'item-essay');
  assert.deepEqual(answerRequest(state, 'item-essay'), {
    quizId: 'set-one',
    questionId: 'item-essay',
    choice: null,
    text: '내 입력\n',
    confidence: 'sure',
    revision: 3,
  });
  assert.equal(draftAnswers(state)['item-choice'].choice, 0);
  const before = structuredClone(state);
  state = refreshAnswerDraft(
    state,
    { ...set, savedAnswers: [{ ...server.savedAnswers[0], revision: 1 }] },
    'item-essay',
  );
  assert.deepEqual(state, before);
  assert.throws(() => refreshAnswerDraft(state, { ...server, quizId: 'other-set' }), /같은 퀴즈/);
  assert.equal(
    draftAnswers(useSavedAnswer(state, 'item-essay'))['item-essay'].text,
    '다른 창의 답',
  );
  assert.equal(draftAnswers(state)['item-essay'].text, '내 입력\n');
});
