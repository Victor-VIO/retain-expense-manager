import { Badge, Card, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { BudgetSummary } from '../types';
import { budgetStatusInfo, formatMoney, formatMonth } from '../utils/format';

interface Props {
  budget: BudgetSummary;
  showLink?: boolean;
}

// Shows spent vs budget for a month with a coloured progress bar.
export default function BudgetCard({ budget, showLink = false }: Props) {
  const status = budgetStatusInfo[budget.status];
  const percent = budget.percentUsed ?? 0;

  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
          <div>
            <Card.Title className="h6 mb-0">Budget – {formatMonth(budget.month)}</Card.Title>
          </div>
          <Badge bg={status.variant}>{status.label}</Badge>
        </div>

        {budget.amount === null ? (
          <p className="text-muted mb-0">
            You've spent {formatMoney(budget.spent)} this month but haven't set a budget yet.{' '}
            {showLink && <Link to="/budget">Set one now</Link>}
          </p>
        ) : (
          <>
            <ProgressBar
              now={Math.min(percent, 100)}
              variant={status.variant}
              label={`${percent}%`}
              className="budget-progress mb-3"
            />
            <div className="row text-center g-2">
              <div className="col-4">
                <div className="small text-muted">Budget</div>
                <div className="fw-semibold">{formatMoney(budget.amount)}</div>
              </div>
              <div className="col-4">
                <div className="small text-muted">Spent</div>
                <div className="fw-semibold">{formatMoney(budget.spent)}</div>
              </div>
              <div className="col-4">
                <div className="small text-muted">{(budget.remaining ?? 0) < 0 ? 'Over by' : 'Remaining'}</div>
                <div className={`fw-semibold ${(budget.remaining ?? 0) < 0 ? 'text-danger' : ''}`}>
                  {formatMoney(Math.abs(budget.remaining ?? 0))}
                </div>
              </div>
            </div>
            {showLink && (
              <div className="text-end mt-3">
                <Link to="/budget" className="small">
                  Update budget
                </Link>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}
