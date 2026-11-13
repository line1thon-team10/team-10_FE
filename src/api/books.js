import { toBooks } from './adapters/books.js';
import { ApiError, http } from './client.js';
import { EP } from './endpoints.js';

export const getBooks = async () => {
  const books = toBooks(await http.get(EP.books));
  // [임시] 서버는 계획이 없으면(empty 시드) 200 + 과목 0개를 줘요. S9는 과목이 1개 이상이라고 보고 그려서 멈추니,
  // 일단 NO_PLAN 오류로 바꿔 '불러오지 못했어요'를 보여요. 목업 empty 시드에는 과목이 있어서 이 경우가 없어요.
  // TODO(확인필요): [기획 확인] 빈 계정 S9를 오류 대신 빈 상태 안내로 보여 줄지 (그러면 화면 수정)
  if (!books.subjects.length)
    throw new ApiError('아직 계획이 없어요. 계획을 먼저 만들어 주세요', { code: 'NO_PLAN' });
  return books;
};
