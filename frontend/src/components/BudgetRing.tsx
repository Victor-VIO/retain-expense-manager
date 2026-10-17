import type { BudgetStatus } from '../types';

const STATUS_COLOR: Record<BudgetStatus, string> = {
  within: 'var(--status-good)',
  approaching: 'var(--status-warning)',
  over: 'var(--status-critical)',
  no_budget: 'var(--status-none)',
};

interface Props {
  percent: number | null;
  status: BudgetStatus;
  size?: number;
}

// Circular meter: how much of the month's budget is used. The arc caps at 100%;
// the number in the middle shows the real figure (e.g. 120%).
export default function BudgetRing({ percent, status, size = 150 }: Props) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const shown = Math.min(Math.max(percent ?? 0, 0), 100);
  const label = percent === null ? 'No budget set' : `${percent}% of budget used`;

  return (
    <div className="budget-ring" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--track)" strokeWidth={stroke} />
        {percent !== null && shown > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={STATUS_COLOR[status]}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${(shown / 100) * circumference} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        )}
      </svg>
      <div className="budget-ring-center">
        <span className="pct">{percent === null ? '—' : `${percent}%`}</span>
        <small>{percent === null ? 'no budget' : 'used'}</small>
      </div>
    </div>
  );
}
