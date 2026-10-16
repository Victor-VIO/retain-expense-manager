import { Spinner } from 'react-bootstrap';

export default function Loader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="d-flex align-items-center justify-content-center gap-2 py-5 text-muted" role="status">
      <Spinner animation="border" size="sm" />
      <span>{text}</span>
    </div>
  );
}
