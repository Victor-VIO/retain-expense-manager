import type { ReactNode } from 'react';
import { Card } from 'react-bootstrap';

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export default function StatCard({ label, value, hint, tone = 'default' }: Props) {
  return (
    <Card className={`stat-card h-100 stat-${tone}`}>
      <Card.Body>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint && <div className="small text-muted mt-1 text-truncate">{hint}</div>}
      </Card.Body>
    </Card>
  );
}
