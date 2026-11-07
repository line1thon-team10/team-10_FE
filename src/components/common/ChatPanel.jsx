import { useEffect, useRef, useState } from 'react';
import AiBox from './AiBox.jsx';
import Button from './Button.jsx';
import Chip from './Chip.jsx';

// AI 대화 공통 틀: S1 온보딩, S5-1 다시 나누기, S6-3 AI 튜터에서 같이 써요 (정의서: S1 말풍선 재사용).
// 칩을 누르면 입력창에 붙고, 보내기를 누르면 onSend(text)가 불려요.
export default function ChatPanel({
  title,
  messages,
  chips = [],
  onSend,
  pending = false,
  placeholder = '메시지 입력',
  inputId,
}) {
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, pending]);

  const toggleChip = (c) =>
    setText((t) => {
      const parts = t
        .split(' · ')
        .map((x) => x.trim())
        .filter(Boolean);
      return (parts.includes(c) ? parts.filter((x) => x !== c) : [...parts, c]).join(' · ');
    });

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() || pending) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <AiBox label="AI" className="min-h-[420px]">
      {title && <h2 className="text-sm font-semibold">{title}</h2>}
      <div
        ref={listRef}
        className="flex max-h-[360px] flex-1 flex-col gap-2.5 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {messages.map((m, i) => (
          <p
            key={i}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] whitespace-pre-line ${m.role === 'user' ? 'self-end rounded-br-sm bg-ink text-ink-fg' : 'self-start rounded-bl-sm bg-surface-2'}`}
          >
            {m.text}
          </p>
        ))}
        {pending && (
          <p className="self-start rounded-2xl bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-fg-2">
            정리하는 중…
          </p>
        )}
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="빠른 선택">
          {chips.map((c) => (
            <Chip key={c} pressed={text.split(' · ').includes(c)} onClick={() => toggleChip(c)}>
              {c}
            </Chip>
          ))}
        </div>
      )}
      <form className="flex gap-2" onSubmit={submit}>
        <input
          id={inputId}
          className="min-w-0 flex-1 rounded-sm border border-line bg-surface px-3 py-2"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
        />
        <Button type="submit" variant="primary" disabled={!text.trim() || pending}>
          보내기
        </Button>
      </form>
    </AiBox>
  );
}
