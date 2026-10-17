// Small presentational building blocks shared across pages.
import type { CSSProperties, ReactNode } from 'react';
import { Card } from 'react-bootstrap';
import type { BudgetStatus } from '../types';
import { categoryStyle } from '../utils/categories';
import { budgetStatusInfo } from '../utils/format';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function CategoryAvatar({ name, size }: { name: string; size?: 'sm' | 'lg' }) {
  const { icon, color } = categoryStyle(name);
  return (
    <span className={`cat-avatar ${size ?? ''}`} style={{ '--c': color } as CSSProperties} aria-hidden>
      <i className={`bi bi-${icon}`} />
    </span>
  );
}

const STATUS_ICONS: Record<BudgetStatus, string> = {
  within: 'check-circle-fill',
  approaching: 'exclamation-triangle-fill',
  over: 'x-octagon-fill',
  no_budget: 'dash-circle',
};

// Budget state always shows an icon + words, never colour alone.
export function StatusPill({ status }: { status: BudgetStatus }) {
  return (
    <span className={`status-pill status-${status}`}>
      <i className={`bi bi-${STATUS_ICONS[status]}`} aria-hidden />
      {budgetStatusInfo[status].label}
    </span>
  );
}

type ChipTone = 'brand' | 'blue' | 'orange' | 'violet' | 'good' | 'warning' | 'critical';

export function StatTile({
  icon,
  tone = 'brand',
  label,
  value,
  hint,
}: {
  icon: string;
  tone?: ChipTone;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <Card className="stat-tile">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between gap-2">
          <span className="stat-label">{label}</span>
          <span className={`icon-chip chip-${tone}`}>
            <i className={`bi bi-${icon}`} aria-hidden />
          </span>
        </div>
        <div className="stat-value">{value}</div>
        {hint && <div className="stat-hint text-truncate">{hint}</div>}
      </Card.Body>
    </Card>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="icon-chip chip-brand">
        <i className={`bi bi-${icon}`} aria-hidden />
      </span>
      <div className="fw-bold mb-1">{title}</div>
      {text && <p className="text-muted small mb-3">{text}</p>}
      {action}
    </div>
  );
}
