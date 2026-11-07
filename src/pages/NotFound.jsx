import { Link } from 'react-router';
import { ROUTES } from '@/app/screens.js';
import { EmptyState } from '@/components/common/StateView.jsx';

export default function NotFound() {
  return (
    <EmptyState
      title="없는 주소예요"
      description="주소를 다시 확인하거나 홈으로 돌아가세요."
      action={
        <Link className="btn btn-primary" to={ROUTES.home}>
          홈으로
        </Link>
      }
    />
  );
}
