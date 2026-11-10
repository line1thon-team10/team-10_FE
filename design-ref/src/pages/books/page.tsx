import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./books.css";
import "@/pages/home/home.css";
import AppNav from "@/components/feature/AppNav";
import SubjectTabs from "./components/SubjectTabs";
import UnitShelf from "./components/UnitShelf";
import ReadinessCard from "./components/ReadinessCard";
import { bookSubjects } from "@/mocks/books";
import type { BookSubject, PickedBlock } from "./types";
import { STATE_LABEL, STATE_NOTE, STATE_ORDER, STATE_TONE, describeBlock } from "./utils";

const subjects = bookSubjects as unknown as BookSubject[];

const DONE_STATES = ["stable", "wobble", "risk"];

export default function BooksPage() {
  const [subjectId, setSubjectId] = useState(subjects[0].id);
  const [picked, setPicked] = useState<PickedBlock | null>(null);

  const subject = subjects.find((item) => item.id === subjectId) ?? subjects[0];
  const others = subjects.filter((item) => item.id !== subject.id);

  const pickedUnit = picked ? subject.units.find((unit) => unit.id === picked.unitId) ?? null : null;
  const pickedBlock = pickedUnit ? pickedUnit.blocks.find((block) => block.id === picked.blockId) ?? null : null;
  const detail = pickedUnit && pickedBlock ? describeBlock(pickedUnit, pickedBlock) : null;

  const totalBlocks = subject.units.reduce((sum, unit) => sum + unit.blocks.length, 0);
  const doneBlocks = subject.units.reduce(
    (sum, unit) => sum + unit.blocks.filter((block) => DONE_STATES.includes(block.state)).length,
    0,
  );

  useEffect(() => {
    document.title = `피뢰침 | 책 쌓기 · ${subject.name}`;
    const desc = document.querySelector('meta[name="description"]');
    const text =
      "태스크 하나가 책 한 권. 단원마다 쌓인 책 더미와 이해도 색으로 시험 준비도, 목표까지 남은 정도를 한 화면에서 확인하세요.";
    if (desc) desc.setAttribute("content", text);
    else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = text;
      document.head.appendChild(meta);
    }
  }, [subject.name]);

  const selectSubject = (id: string) => {
    setSubjectId(id);
    setPicked(null);
  };

  const headerRight = (
    <Link to="/home" className="hidden cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--nav-line-strong)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--nav-ink-soft)] transition-colors hover:text-[var(--nav-ink)] sm:inline-flex">
      <i className="ri-arrow-left-line text-[12px] leading-none" />
      오늘 기록
    </Link>
  );

  return (
    <div className="hp-scope flex min-h-screen w-full flex-col bg-[var(--hp-paper)]">
      <AppNav right={headerRight} />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-14 pt-8 md:px-8 md:pt-10">
        <header className="hp-rise flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold tracking-wide text-[var(--hp-muted)]">
              <i className="ri-book-2-line text-[13px] leading-none text-[var(--hp-brand)]" />
              책 쌓기 · 태스크 1개 = 책 1권
            </span>
            <h1 className="mt-3 text-[28px] leading-tight text-[var(--hp-ink)] md:text-[34px]">
              쌓인 책으로
              <br className="sm:hidden" /> 시험 준비도를 봐요
            </h1>
            <p className="mt-3 max-w-[540px] text-[13px] leading-relaxed text-[var(--hp-muted)]">
              단원마다 막대 하나. 아래부터 태스크 블록이 쌓이고, 막대 높이가 그 단원에 계획한 태스크 수예요.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2 md:border-l md:border-[var(--hp-line)] md:pl-6">
            <div>
              <p className="text-[11px] text-[var(--hp-muted)]">쌓인 블록</p>
              <p className="hp-display mt-1 text-[22px] leading-none text-[var(--hp-ink)]">
                {doneBlocks}
                <span className="ml-1 text-[12px] font-medium text-[var(--hp-muted)]">/ {totalBlocks}개</span>
              </p>
            </div>
            <div className="border-l border-[var(--hp-line)] pl-5">
              <p className="text-[11px] text-[var(--hp-muted)]">단원</p>
              <p className="hp-display mt-1 text-[22px] leading-none text-[var(--hp-ink)]">
                {subject.units.length}개
              </p>
            </div>
          </div>
        </header>

        <div className="hp-rise hp-d1 mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SubjectTabs
            subjects={subjects.map((item) => ({ id: item.id, name: item.name }))}
            activeId={subject.id}
            onChange={selectSubject}
          />
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-[var(--hp-muted)]">
            <span className="hp-tag hp-tag--brand">
              <i className="ri-flag-line text-[11px] leading-none" />
              목표 {subject.readiness.target}%
            </span>
            <span>한 번 쌓인 블록은 빼지 않아요</span>
          </p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0">
            <section className="hp-rise hp-d2 rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-3.5 md:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-[17px] text-[var(--hp-ink)] md:text-[19px]">{subject.name} 책장</h2>
                <p className="text-[11.5px] text-[var(--hp-muted)]">
                  블록을 누르면 상태를 글로 확인할 수 있어요
                </p>
              </div>

              <div className="mt-2">
                <UnitShelf
                  units={subject.units}
                  tone={subject.tone}
                  picked={picked}
                  onPick={(unitId, blockId) => setPicked({ unitId, blockId })}
                />
              </div>

              <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--hp-line)] pt-3.5 text-[11px] text-[var(--hp-muted)]">
                {STATE_ORDER.map((state) => (
                  <li key={state} className="flex items-center gap-1.5 whitespace-nowrap">
                    <span
                      className={`bk-legend-block ${STATE_TONE[state]} ${
                        state === "planned"
                          ? "bk-block--planned"
                          : state === "progress"
                            ? "bk-block--progress"
                            : state === "supplement"
                              ? "bk-block--supplement"
                              : ""
                      }`}
                      aria-hidden="true"
                    />
                    {STATE_LABEL[state]}
                    <span className="hidden text-[var(--hp-line-strong)] sm:inline">·</span>
                    <span className="hidden sm:inline">{STATE_NOTE[state]}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="hp-rise hp-d3 mt-4 rounded-2xl border border-dashed border-[var(--hp-line-strong)] bg-white/[0.02] px-4 py-3.5">
              <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--hp-ink)]">
                <i className="ri-information-line text-[13px] leading-none text-[var(--hp-brand-deep)]" />
                읽는 법
              </h2>
              <ul className="mt-2 flex flex-col gap-1.5 text-[11.5px] leading-relaxed text-[var(--hp-muted)]">
                <li className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--hp-muted)]" />
                  블록 1개 = 태스크 1개, 막대 높이 = 그 단원에 계획한 태스크 수
                </li>
                <li className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--hp-muted)]" />
                  완료 블록의 색은 단원 이해도로 정해요 (초록 안정 · 노랑 흔들림 · 빨강 붕괴 위기)
                </li>
                <li className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-[var(--hp-muted)]" />
                  보충 학습은 지우지 않고 막대 위에 새 블록으로 올려요
                </li>
              </ul>
            </section>
          </div>

          <aside className="flex min-w-0 flex-col gap-4">
            <ReadinessCard subject={subject} others={others} onSelect={selectSubject} />

            <section className="rounded-2xl border border-[var(--hp-line)] bg-[var(--hp-card)] p-4">
              <h2 className="text-[13px] font-semibold text-[var(--hp-ink)]">블록 정보</h2>
              {pickedUnit && pickedBlock && detail ? (
                <div className="hp-rise mt-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] text-[var(--hp-muted)]">
                    <span className={`bk-ribbon ${subject.tone}`} aria-hidden="true" />
                    {pickedUnit.no}단원 · {pickedUnit.name}
                  </p>
                  <p className="mt-1.5 text-[12.5px] font-semibold leading-snug text-[var(--hp-ink)]">
                    {pickedBlock.task}
                  </p>
                  <p className="mt-1 text-[11.5px] tabular-nums text-[var(--hp-muted)]">
                    {pickedBlock.pages} · {STATE_LABEL[pickedBlock.state]}
                  </p>
                  <p className="mt-2.5 rounded-lg border border-[var(--hp-line)] bg-white/[0.02] px-2.5 py-2 text-[11.5px] leading-relaxed text-[var(--hp-ink-soft)]">
                    {detail.head}
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-[var(--hp-muted)]">{detail.foot}</p>
                </div>
              ) : (
                <div className="mt-2.5">
                  <p className="text-[11.5px] leading-relaxed text-[var(--hp-muted)]">
                    막대의 책 블록을 누르면 그 태스크의 상태를 글로 볼 수 있어요.
                  </p>
                  <div className="mt-3 flex flex-col gap-[3px]" aria-hidden="true">
                    <span className={`bk-block ${subject.tone} h-[16px]`} />
                    <span className={`bk-block ${subject.tone} h-[16px]`} />
                    <span className={`bk-block ${subject.tone} bk-block--progress h-[16px]`} />
                    <span className={`bk-block bk-block--planned h-[16px]`} />
                  </div>
                  <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--hp-muted)]">
                    예) 흔들림 · 노란불 · 이해도 73점
                  </p>
                </div>
              )}
            </section>

            <Link
              to="/home"
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--hp-solid)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--hp-solid-ink)] transition-colors hover:bg-[var(--hp-solid-hover)]"
            >
              <i className="ri-play-fill text-[12px] leading-none" />
              오늘 공부 기록하러 가기
            </Link>
          </aside>
        </div>
      </main>

      <footer className="border-t border-[var(--hp-line)] bg-[var(--hp-paper-warm)]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center justify-between gap-2 px-4 py-5 text-[11.5px] text-[var(--hp-muted)] sm:flex-row md:px-8">
          <p>© 2026 피뢰침. 쌓인 만큼 드러나는 준비도.</p>
          <p className="flex items-center gap-2">
            <span className="hp-chip hp-bk-green" aria-hidden="true" />
            책 1권 = 태스크 1개
          </p>
        </div>
      </footer>
    </div>
  );
}