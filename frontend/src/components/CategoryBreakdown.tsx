import { ProgressBar } from 'react-bootstrap';
import type { CategoryTotal } from '../types';
import { formatMoney } from '../utils/format';

interface Props {
  items: CategoryTotal[];
  emptyText?: string;
}

// Horizontal bars showing each category's share of the total.
export default function CategoryBreakdown({ items, emptyText = 'No spending to show yet.' }: Props) {
  const total = items.reduce((sum, item) => sum + item.total, 0);
  if (!items.length || total === 0) return <p className="text-muted mb-0">{emptyText}</p>;

  return (
    <ul className="list-unstyled mb-0">
      {items.map((item) => {
        const share = Math.round((item.total / total) * 100);
        return (
          <li key={item.categoryId} className="mb-3">
            <div className="d-flex justify-content-between small mb-1 gap-2">
              <span className="text-truncate">
                {item.name} <span className="text-muted">({item.count})</span>
              </span>
              <span className="fw-semibold text-nowrap">
                {formatMoney(item.total)} <span className="text-muted fw-normal">· {share}%</span>
              </span>
            </div>
            <ProgressBar now={share} className="category-bar" />
          </li>
        );
      })}
    </ul>
  );
}
