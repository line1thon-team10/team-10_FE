import { ChevronDown, FileText, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import AiWait from '@/components/common/AiWait.jsx';
import { MockBadge } from '@/components/common/Badge.jsx';
import Button from '@/components/common/Button.jsx';
import PdfPageDialog from '@/components/common/PdfPageDialog.jsx';
import { useAiWait } from '@/hooks/useAiWait.js';
import { useTutor } from '@/hooks/useTutor.js';

const EASY_ASK = '더 쉽게 설명해줘';
const pageLabel = (p) => (p.from === p.to ? `근거 p.${p.from}` : `근거 p.${p.from}–${p.to}`);

// 근거 칩 → PDF 보기 (그 범위의 첫 쪽)
function PageChips({ pages, onOpen }) {
  if (!pages.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {pages.map((p) => (
        <button
          key={`${p.from}-${p.to}`}
          type="button"
          className="badge hover:border-fg-2 hover:text-fg"
          onClick={() => onOpen(p)}
        >
          <FileText size={11} aria-hidden="true" />
          {pageLabel(p)}
        </button>
      ))}
    </div>
  );
}

// 답 하나의 로딩(8초 안내 · 30초 다시 시도) · 실패(저장된 결과) · 결과 (NF-05·10)
function Reply({ m, startedAt, label, onRetry, onBackup, children }) {
  const wait = useAiWait(startedAt, m.isPending);
  if (m.isPending)
    return (
      <AiWait
        phase={wait}
        label={label}
        retryNote="응답이 없으면 저장된 답을 보여드려요"
        onRetry={onBackup}
      />
    );
  if (m.isError)
    return (
      <div className="flex flex-col gap-2 text-[12.5px]">
        <p className="text-st-risk">답을 받지 못했어요. {m.error.message}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={onRetry}>
            다시 물어보기
          </Button>
          <Button size="sm" onClick={onBackup}>
            저장된 답 보기
          </Button>
        </div>
      </div>
    );
  return m.isSuccess ? children(m.data) : null;
}

// S6-3 AI 튜터 (TU-01 · TU-02, 정의서 v2_2 4-14, 디자인 AskBar)
// 단일턴: 질문 1개에 답 1개 (history = []). 답마다 [더 쉽게 설명해줘] 1번 → 직전 한 쌍을 history로 보내
// 쉬운 설명 카드 1개를 그 답 아래 붙여요. 근거 칩은 원래 답 그대로
export default function TutorPanel({ suggestions = [] }) {
  const tutor = useTutor();
  const easy = useTutor();
  const [text, setText] = useState('');
  const [asked, setAsked] = useState(null);
  const [open, setOpen] = useState(false);
  const [pdf, setPdf] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [easyAt, setEasyAt] = useState(null); // 이 답에 쉬운 설명을 썼으면 시작 시각
  const pair = tutor.data;

  const ask = (question, backup) => {
    setAsked(question);
    setOpen(true);
    setStartedAt(Date.now());
    setEasyAt(null); // 새 질문의 답에는 버튼이 다시 생겨요
    easy.reset();
    tutor.mutate(backup ? { backup } : { question, history: [] });
  };
  const askEasy = (backup) => {
    setEasyAt(Date.now());
    easy.mutate(
      backup
        ? { backup }
        : {
            question: EASY_ASK,
            history: [{ question: pair.question, answer: pair.answer, pages: pair.pages }],
          },
    );
  };
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || tutor.isPending) return;
    ask(text.trim());
    setText('');
  };

  return (
    <div className="sticky bottom-0 -mx-6 mt-auto flex flex-col border-t border-line bg-bg/95 backdrop-blur">
      {open && (
        <section
          className="mx-6 mt-3 flex max-h-[52vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-line-2 bg-surface p-4"
          aria-label="AI 튜터 답변"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-[12.5px] text-fg-2">
              <span className="ai-chip">AI 튜터</span>
              {pair?.subjectName ?? '올린'} 자료 기준으로 답해요
            </p>
            <button
              type="button"
              className="flex items-center gap-1 text-[12px] text-fg-2 hover:text-fg"
              onClick={() => setOpen(false)}
            >
              접기
              <ChevronDown size={13} aria-hidden="true" />
            </button>
          </div>
          {asked && (
            <p className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-ink px-3.5 py-2 text-[13px] text-ink-fg">
              {pair?.question ?? asked}
            </p>
          )}
          <Reply
            m={tutor}
            startedAt={startedAt}
            label="AI가 강의자료에서 답을 찾고 있어요"
            onRetry={() => ask(asked)}
            onBackup={() => ask(asked, 'basic')}
          >
            {(p) => (
              <div className="flex flex-col gap-2 rounded-2xl rounded-bl-sm border border-line bg-bg-2 px-3.5 py-3">
                <p className="flex flex-wrap items-center gap-1.5">
                  {p.saved && <span className="badge">저장된 답</span>}
                  <MockBadge />
                </p>
                <p className="text-[13.5px] leading-relaxed">{p.answer}</p>
                <PageChips pages={p.pages} onOpen={setPdf} />
                {/* TU-02: 답 하나당 1번. 쓰면 사라지고 새 질문의 답에는 다시 생겨요 */}
                {!easyAt && (
                  <Button size="sm" className="self-start" onClick={() => askEasy()}>
                    <Sparkles size={12} aria-hidden="true" />
                    {EASY_ASK}
                  </Button>
                )}
              </div>
            )}
          </Reply>
          {easyAt && (
            <Reply
              m={easy}
              startedAt={easyAt}
              label="AI가 쉬운 말로 다시 설명하고 있어요"
              onRetry={() => askEasy()}
              onBackup={() => askEasy('easy')}
            >
              {(e) => (
                <div
                  className="ml-4 flex flex-col gap-2 rounded-2xl border border-dashed border-brand-line bg-brand-tint px-3.5 py-3"
                  aria-label="쉬운 설명"
                >
                  <p className="flex flex-wrap items-center gap-1.5">
                    <span className="badge border-brand-line text-brand-deep">
                      <Sparkles size={11} aria-hidden="true" />더 쉽게
                    </span>
                    {e.saved && <span className="badge">저장된 답</span>}
                    <MockBadge />
                  </p>
                  <p className="text-[13.5px] leading-relaxed">{e.answer}</p>
                  {/* 근거는 원래 답 그대로 (4-14 제안) */}
                  <PageChips pages={pair.pages} onOpen={setPdf} />
                </div>
              )}
            </Reply>
          )}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5" aria-label="추천 질문">
              <span className="text-[11.5px] text-fg-2">이런 것도 물어보세요</span>
              {suggestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="chip text-[12px]"
                  disabled={tutor.isPending}
                  onClick={() => ask(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </section>
      )}
      <form className="flex items-center gap-2 px-6 py-3" onSubmit={submit}>
        <span className="ai-chip self-center">AI 튜터</span>
        <input
          id="tutor-question"
          className="min-w-0 flex-1 rounded-full border border-line-2 bg-bg px-4 py-2"
          placeholder="올린 자료 내용 무엇이든 물어보세요 (답에 근거 페이지 표시)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => pair && setOpen(true)}
          autoComplete="off"
        />
        <Button type="submit" variant="primary" disabled={!text.trim() || tutor.isPending}>
          <Send size={13} aria-hidden="true" />
          질문
        </Button>
      </form>
      {pdf && (
        <PdfPageDialog
          materialId={pdf.materialId}
          page={pdf.from}
          title={`근거 원본 · ${pageLabel(pdf).replace('근거 ', '')}`}
          onClose={() => setPdf(null)}
        />
      )}
    </div>
  );
}
