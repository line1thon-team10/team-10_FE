import { useSession } from '@/hooks/useSession.js';

// 첫 접속 때 익명 ID를 받아 둔 뒤 화면을 보여줘요 (NF-01).
export default function RootGate({ children }) {
  const { isPending, isError, refetch } = useSession();
  if (isPending) return <p className="p-6 text-fg-2">준비하고 있어요…</p>;
  if (isError)
    return (
      <div className="p-6">
        <p className="mb-2">서버에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.</p>
        <button type="button" className="btn btn-sm" onClick={() => refetch()}>
          다시 시도
        </button>
      </div>
    );
  return children;
}
