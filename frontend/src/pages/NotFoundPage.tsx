import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <Card className="narrow-page mt-4">
      <Card.Body>
        <EmptyState
          icon="signpost-split"
          title="Page not found"
          text="The page you're looking for doesn't exist or has moved."
          action={
            <Link to="/" className="btn btn-primary btn-sm">
              Go to dashboard
            </Link>
          }
        />
      </Card.Body>
    </Card>
  );
}
