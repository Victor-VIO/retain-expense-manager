import { useState, type CSSProperties } from 'react';
import type { CategoryTotal } from '../types';
import { categoryStyle } from '../utils/categories';
import { formatMoney, plural } from '../utils/format';
import { CategoryAvatar } from './ui';

interface Props {
  items: CategoryTotal[];
  emptyText?: string;
  /** Rows to list before folding the rest into "Other". */
  maxRows?: number;
}

// Part-to-whole: one split bar on top, then a labelled row per category.
// Every colour has its name and amount beside it, so colour is never the only cue.
export default function CategoryBreakdown({ items, emptyText = 'No spending to show yet.', maxRows = 6 }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const sorted = [...items].filter((i) => i.total > 0).sort((a, b) => b.total - a.total);
  const total = sorted.reduce((sum, item) => sum + item.total, 0);

  if (!sorted.length) return <p className="text-muted small mb-0">{emptyText}</p>;

  // Fold the long tail into one "Other" row.
  const rows = sorted.slice(0, maxRows);
  const rest = sorted.slice(maxRows);
  if (rest.length) {
    rows.push({
      categoryId: -1,
      name: `Other (${rest.length})`,
      total: rest.reduce((s, r) => s + r.total, 0),
      count: rest.reduce((s, r) => s + r.count, 0),
    });
  }

  const share = (value: number) => (value / total) * 100;
  const colorOf = (row: CategoryTotal) => (row.categoryId === -1 ? 'var(--cat-other)' : categoryStyle(row.name).color);

  return (
    <div onMouseLeave={() => setHovered(null)}>
      <div className={`split-bar ${hovered !== null ? 'has-hover' : ''}`} aria-hidden>
        {rows.map((row) => (
          <span
            key={row.categoryId}
            className={hovered === row.categoryId ? 'hovered' : ''}
            style={{ width: `${share(row.total)}%`, background: colorOf(row) }}
            title={`${row.name}: ${formatMoney(row.total)} (${Math.round(share(row.total))}%)`}
            onMouseEnter={() => setHovered(row.categoryId)}
          />
        ))}
      </div>

      <ul className="list-unstyled mb-0">
        {rows.map((row) => (
          <li
            key={row.categoryId}
            className={`legend-row ${hovered === row.categoryId ? 'hovered' : ''}`}
            onMouseEnter={() => setHovered(row.categoryId)}
          >
            {row.categoryId === -1 ? (
              <span className="cat-avatar sm" style={{ '--c': 'var(--cat-other)' } as CSSProperties} aria-hidden>
                <i className="bi bi-three-dots" />
              </span>
            ) : (
              <CategoryAvatar name={row.name} size="sm" />
            )}
            <div className="flex-grow-1 min-w-0" style={{ minWidth: 0 }}>
              <div className="d-flex justify-content-between gap-2">
                <span className="name text-truncate">{row.name}</span>
                <span className="amount">{formatMoney(row.total)}</span>
              </div>
              <div className="d-flex justify-content-between gap-2">
                <span className="meta">{plural(row.count, 'expense')}</span>
                <span className="meta">{Math.round(share(row.total))}%</span>
              </div>
              <div className="legend-track">
                <span style={{ width: `${share(row.total)}%`, background: colorOf(row) }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
