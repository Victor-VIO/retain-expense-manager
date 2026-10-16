import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Expense } from '../../types';
import { formatDate, formatMoney, paymentLabels, today } from '../../utils/format';
import { CategoryAvatar } from '../ui';

interface Props {
  expenses: Expense[];
  onDelete?: (expense: Expense) => void;
  /** Show "Today" / "Yesterday" / date headings between rows. */
  groupByDate?: boolean;
  /** Hide the date inside each row (e.g. when grouped). */
  compact?: boolean;
}

function dayLabel(date: string) {
  const t = today();
  const y = new Date(`${t}T00:00:00`);
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  if (date === t) return 'Today';
  if (date === yesterday) return 'Yesterday';
  return formatDate(date);
}

// One list for every screen size: icon, title, details, amount.
// The whole row opens the expense; edit/delete buttons show from small tablets up.
export default function ExpenseList({ expenses, onDelete, groupByDate = false, compact = false }: Props) {
  const navigate = useNavigate();

  return (
    <div>
      {expenses.map((expense, i) => {
        const showHeading = groupByDate && (i === 0 || expenses[i - 1].date !== expense.date);
        return (
          <Fragment key={expense.id}>
            {showHeading && <div className="tx-group-label">{dayLabel(expense.date)}</div>}
            <div className="tx-item position-relative">
              <CategoryAvatar name={expense.category.name} />
              <div className="tx-body">
                <Link to={`/expenses/${expense.id}`} className="tx-title d-block text-reset stretched-link">
                  {expense.title}
                </Link>
                <div className="tx-meta">
                  {expense.category.name} · {paymentLabels[expense.paymentMethod]}
                  {!groupByDate && !compact && <> · {formatDate(expense.date)}</>}
                </div>
              </div>
              <div className="tx-amount">−{formatMoney(expense.amount)}</div>
              {onDelete && (
                <div className="tx-actions d-none d-sm-flex position-relative" style={{ zIndex: 2 }}>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Edit ${expense.title}`}
                    title="Edit"
                    onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                  >
                    <i className="bi bi-pencil" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="icon-btn text-danger"
                    aria-label={`Delete ${expense.title}`}
                    title="Delete"
                    onClick={() => onDelete(expense)}
                  >
                    <i className="bi bi-trash3" aria-hidden />
                  </button>
                </div>
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
