import { X } from 'lucide-react';
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
      className="fixed inset-0 z-40 grid place-items-center overflow-auto bg-black/60 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`card flex max-h-full w-full flex-col gap-4 overflow-auto border-line-2 p-6 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.9)] ${wide ? 'max-w-[780px]' : 'max-w-[580px]'}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl">{title}</h2>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-full border border-line-2 text-fg-2 hover:text-fg"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        {children}
        {footer && <div className="flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
