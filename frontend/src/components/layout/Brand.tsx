import { Link } from 'react-router-dom';

export default function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link to="/" className="brand" onClick={onClick}>
      <span className="brand-mark">
        <i className="bi bi-piggy-bank-fill" aria-hidden />
      </span>
      Retain
    </Link>
  );
}
