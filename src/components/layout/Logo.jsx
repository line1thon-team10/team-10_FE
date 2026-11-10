import { Link } from 'react-router';
import { ROUTES } from '@/app/screens.js';
import { APP_NAME } from '@/config/app.js';

// TODO(확인필요): [기획 확인] 김현민님 로고 파일을 받으면 이미지로 바꿔요. 지금은 글자 로고
export default function Logo({ to = ROUTES.home }) {
  return (
    <Link to={to} className="display shrink-0 text-[20px] leading-none text-fg">
      {APP_NAME}
    </Link>
  );
}
