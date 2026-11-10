import { useEffect } from "react";

export type LegalKind = "terms" | "privacy";

const CONTENT: Record<LegalKind, { title: string; body: string[] }> = {
  terms: {
    title: "이용약관",
    body: [
      "본 서비스는 AI가 학습 일정을 설계하고 진행 상황을 확인할 수 있도록 돕는 학습 보조 도구입니다.",
      "회원은 자신의 계정 정보를 안전하게 관리해야 하며, 타인에게 양도하거나 공유할 수 없습니다.",
      "서비스가 제공하는 학습 계획은 참고 자료이며, 시험 결과나 성적을 보장하지 않습니다.",
      "운영 정책상 필요한 경우 사전 공지 후 서비스 내용이 변경될 수 있습니다.",
    ],
  },
  privacy: {
    title: "개인정보처리방침",
    body: [
      "수집 항목: 이메일, 목표 시험, 시험일, 하루 학습 가능 시간.",
      "이용 목적: 맞춤 학습 플랜 생성, 진행 대시보드 제공, 서비스 개선.",
      "보관 기간: 회원 탈퇴 시 즉시 파기하며, 법령상 보관이 필요한 경우 해당 기간 동안 보관합니다.",
      "이용자는 언제든지 자신의 개인정보 열람·정정·삭제를 요청할 수 있습니다.",
    ],
  },
};

export default function LegalDialog({ kind, onClose }: { kind: LegalKind | null; onClose: () => void }) {
  useEffect(() => {
    if (!kind) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [kind, onClose]);

  if (!kind) return null;
  const doc = CONTENT[kind];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={doc.title}
      onClick={onClose}
    >
      <div
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[var(--lk-line)] bg-[var(--lk-card)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--lk-line)] px-6 py-4">
          <h3 className="text-base font-bold text-[var(--lk-ink)]">{doc.title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--lk-muted)] transition-colors hover:bg-[var(--lk-brand-tint)] hover:text-[var(--lk-brand-deep)]"
          >
            <i className="ri-close-line text-lg leading-none" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          <ul className="space-y-3">
            {doc.body.map((line) => (
              <li key={line} className="flex gap-2 text-[13.5px] leading-relaxed text-[var(--lk-muted)]">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--lk-brand)]" />
                <span className="min-w-0">{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-[var(--lk-line)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full whitespace-nowrap rounded-xl bg-[var(--lk-solid)] px-5 py-3 text-sm font-semibold text-[var(--lk-solid-ink)] transition-colors hover:bg-white"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}