// S6 홈 (S6-2 조금 밀린 날, S6-3 AI 튜터 답변은 같은 주소의 상태) — 신민종
import Placeholder from '@/components/Placeholder.jsx';

export default function S6Home() {
  return (
    <div className="flex flex-col gap-4">
      <Placeholder id="S6" />
      <div className="grid gap-4 md:grid-cols-2">
        <Placeholder id="S6-2" compact />
        <Placeholder id="S6-3" compact />
      </div>
    </div>
  );
}
