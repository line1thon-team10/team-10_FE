import { Outlet } from 'react-router';
import RootGate from './RootGate.jsx';

// 집중 모드 틀: 메뉴 없이 화면 하나만 (머리는 화면이 그려요 — 오른쪽 [시간 보기])
export default function FocusLayout() {
  return (
    <RootGate>
      <div className="flex min-h-screen flex-col">
        <Outlet />
      </div>
    </RootGate>
  );
}
