import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// 팝업 공통 틀. Esc나 바깥을 누르면 닫혀요.
export default function Modal({ title, onClose, wide = false, footer, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-40 grid place-items-center overflow-auto bg-[rgb(10_12_18/0.45)] p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`card flex max-h-full w-full flex-col gap-4 overflow-auto p-5 shadow-xl ${wide ? 'max-w-[780px]' : 'max-w-[580px]'}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" className="btn btn-sm" onClick={onClose}>
            닫기
          </button>
        </div>
        {children}
        {footer && <div className="flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
