const inputOf = (answer) => ({
  choice: answer.choice ?? null,
  text: answer.text ?? null,
  confidence: answer.confidence ?? null,
});
const emptyInput = (question) => ({
  choice: null,
  text: question.type === 'choice' ? null : '',
  confidence: null,
});
const sameInput = (a, b) =>
  a.choice === b.choice && a.text === b.text && a.confidence === b.confidence;

export function createAnswerDraft(set) {
  const saved = new Map(set.savedAnswers.map((answer) => [answer.questionId, answer]));
  return {
    quizId: set.quizId,
    items: Object.fromEntries(
      set.questions.map((question) => {
        const head = saved.get(question.id) ?? null;
        return [
          question.id,
          { question, input: head ? inputOf(head) : emptyInput(question), head },
        ];
      }),
    ),
  };
}

export function editAnswerDraft(state, questionId, patch) {
  const item = state.items[questionId];
  return {
    ...state,
    items: { ...state.items, [questionId]: { ...item, input: { ...item.input, ...patch } } },
  };
}

export function canSaveAnswer(state, questionId) {
  const { question, input } = state.items[questionId];
  if (!['sure', 'unsure'].includes(input.confidence)) return false;
  if (question.type === 'choice') {
    return (
      Number.isInteger(input.choice) && input.choice >= 0 && input.choice < question.options.length
    );
  }
  return typeof input.text === 'string';
}

export function answerRequest(state, questionId) {
  const { input, head } = state.items[questionId];
  return { quizId: state.quizId, questionId, ...inputOf(input), revision: head?.revision ?? 0 };
}

export function acceptAnswerSave(state, request, response) {
  if (state.quizId !== request.quizId || !state.items[request.questionId]) return state;
  const item = state.items[request.questionId];
  // 실제 수신 영수증은 과거 revision을 돌려줄 수 있어요. 현재 head와 입력을 되돌리지 않아요.
  if (item.head && item.head.revision >= response.revision) return state;
  const head = { questionId: request.questionId, ...inputOf(request), revision: response.revision };
  return { ...state, items: { ...state.items, [request.questionId]: { ...item, head } } };
}

export function refreshAnswerDraft(state, set, preserveQuestionId) {
  if (state.quizId !== set.quizId)
    throw new Error('같은 퀴즈의 답안을 불러오지 못했어요. 다시 시도해 주세요.');
  const items = { ...state.items };
  for (const head of set.savedAnswers) {
    const item = items[head.questionId];
    if (!item || (item.head && item.head.revision >= head.revision)) continue;
    const unchanged = sameInput(
      item.input,
      item.head ? inputOf(item.head) : emptyInput(item.question),
    );
    items[head.questionId] = {
      ...item,
      head,
      input: head.questionId !== preserveQuestionId && unchanged ? inputOf(head) : item.input,
    };
  }
  return { ...state, items };
}

export function useSavedAnswer(state, questionId) {
  const item = state.items[questionId];
  return {
    ...state,
    items: {
      ...state.items,
      [questionId]: { ...item, input: item.head ? inputOf(item.head) : emptyInput(item.question) },
    },
  };
}

export const draftAnswers = (state) =>
  Object.fromEntries(Object.entries(state.items).map(([id, item]) => [id, inputOf(item.input)]));
