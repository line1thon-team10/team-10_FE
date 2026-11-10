import { ArrowRight, FlaskConical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import { useDemoState, useSeed } from '@/hooks/useDemo.js';

// 데모 메뉴 (NF-09, 디자인 DemoMenu 모양): 시연용 시드 3개를 불러와요. 빈 계정은 계획 만들기(온보딩)로, 나머지는 홈으로 가요.
export default function DemoMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { data } = useDemoState();
  const seed = useSeed();

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);

  const pick = (key) =>
    seed.mutate(key, {
      onSuccess: () => {
        setOpen(false);
        toast(`시드를 불러왔어요 · ${data?.seeds[key] ?? key}`);
        navigate(key === 'empty' ? ROUTES.s1 : ROUTES.home);
      },
      onError: (e) => toast.error(e.message),
    });

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="데모 메뉴"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-2 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-fg-2 hover:border-fg-2 hover:text-fg-soft"
      >
        <FlaskConical size={12} aria-hidden="true" />
        데모
      </button>
      {open && (
        <div
          role="menu"
          aria-label="데모 시연 상태"
          className="absolute top-full right-0 z-50 mt-2 flex w-[248px] flex-col rounded-xl border border-line-2 bg-bg-2 p-1.5 shadow-[0_24px_50px_-24px_rgb(0_0_0/0.85)]"
        >
          <p className="label px-2.5 pt-1 pb-1.5 text-[9.5px]">시연 상태</p>
          {Object.entries(data?.seeds ?? {}).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              disabled={seed.isPending}
              onClick={() => pick(key)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-semibold hover:bg-white/[0.07]"
            >
              {label}
              {data?.seed === key && (
                <span className="text-[10.5px] font-normal text-brand-deep">지금</span>
              )}
            </button>
          ))}
          <div className="my-1.5 h-px bg-line" />
          <Link
            role="menuitem"
            to={ROUTES.dev}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12px] text-fg-2 hover:bg-white/[0.07] hover:text-fg"
          >
            개발용 페이지 (/dev)
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
