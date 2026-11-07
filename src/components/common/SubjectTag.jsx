// 과목 색은 과목 탭·캘린더 일정·체크리스트 띠·단원 이름표에만 써요 (정의서 4-5).
export default function SubjectTag({ name, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
      <span className="h-2 w-2 rounded-[2px]" style={{ background: color }} aria-hidden="true" />
      {name}
    </span>
  );
}
