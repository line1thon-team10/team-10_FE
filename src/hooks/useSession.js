import { useQuery } from '@tanstack/react-query';
import { createSession } from '@/api/session.js';
import { readAnonymousId, saveAnonymousId } from '@/lib/anonymousId.js';
import { QK } from './queryKeys.js';

// 같은 브라우저로 다시 오면 저장해 둔 익명 ID를 그대로 써요 (NF-01).
export function useSession() {
  return useQuery({
    queryKey: QK.session,
    staleTime: Infinity,
    queryFn: async () => {
      const saved = readAnonymousId();
      if (saved) return { anonymousId: saved };
      const session = await createSession();
      saveAnonymousId(session.anonymousId);
      return session;
    },
  });
}
