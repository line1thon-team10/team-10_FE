import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ROUTES } from '@/app/screens.js';
import { useDemoState, useSeed } from '@/hooks/useDemo.js';

// 데모 메뉴 (NF-09): 시연용 시드 3개를 불러와요. 빈 계정은 계획 만들기(온보딩)로, 나머지는 홈으로 가요.
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
        className="btn btn-sm"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        데모 ▾
      </button>
      {open && (
        <div
          role="menu"
          className="card absolute right-0 z-30 mt-1.5 flex w-72 flex-col gap-0.5 p-1.5 shadow-lg"
        >
          <span className="label px-2 py-1">시드 불러오기</span>
          {Object.entries(data?.seeds ?? {}).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              disabled={seed.isPending}
              onClick={() => pick(key)}
              className="rounded-sm px-2.5 py-2 text-left text-[13px] hover:bg-surface-2"
            >
              {label}
              {data?.seed === key && <span className="ml-1.5 text-xs text-fg-3">· 지금</span>}
            </button>
          ))}
          <hr className="my-1 border-line" />
          <Link
            role="menuitem"
            to={ROUTES.dev}
            onClick={() => setOpen(false)}
            className="rounded-sm px-2.5 py-2 text-[13px] hover:bg-surface-2"
          >
            개발용 페이지 (/dev)
          </Link>
        </div>
      )}
    </div>
  );
}
