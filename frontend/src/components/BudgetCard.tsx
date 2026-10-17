import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type { BudgetSummary } from '../types';
import { formatMoney, formatMonth, monthDays } from '../utils/format';
import BudgetRing from './BudgetRing';
import { StatusPill } from './ui';

interface Props {
  budget: BudgetSummary;
  showLink?: boolean;
  /** Stretch to the height of its row (dashboard). */
  fill?: boolean;
}

const STATUS_TEXT = {
  within: "You're on track. Keep it up!",
  approaching: "Careful – you've used over 80% of your budget.",
  over: "You've spent more than your budget this month.",
  no_budget: 'Set a monthly budget to see how much you can still spend.',
};

// Headline card: ring meter + "left to spend" figure + simple daily guidance.
export default function BudgetCard({ budget, showLink = false, fill = true }: Props) {
  const days = monthDays(budget.month);
  const remaining = budget.remaining ?? 0;
  const over = remaining < 0;
  const dailyAverage = days.elapsed ? budget.spent / days.elapsed : 0;
  const safePerDay = days.isCurrent && budget.amount !== null && !over && days.left > 0 ? remaining / days.left : null;

  return (
    <Card className={`budget-hero ${fill ? 'h-100' : ''}`}>
      <Card.Body>
        <div className="card-header-row">
          <h2 className="section-title">
            <i className="bi bi-wallet2 me-2 text-muted" aria-hidden />
            {formatMonth(budget.month)} budget
          </h2>
          <StatusPill status={budget.status} />
        </div>

        <div className="d-flex flex-column flex-sm-row align-items-center gap-4">
          <BudgetRing percent={budget.percentUsed} status={budget.status} />

          <div className="flex-grow-1 w-100 text-center text-sm-start">
            {budget.amount === null ? (
              <>
                <div className="hero-label">Spent this month</div>
                <div className="hero-figure">{formatMoney(budget.spent)}</div>
                <p className="text-muted small mt-2 mb-3">{STATUS_TEXT.no_budget}</p>
                <Link to="/budget" className="btn btn-primary btn-sm">
                  <i className="bi bi-plus-lg me-1" aria-hidden /> Set a budget
                </Link>
              </>
            ) : (
              <>
                <div className="hero-label">{over ? 'Over budget by' : 'Left to spend'}</div>
                <div className={`hero-figure ${over ? 'text-danger' : ''}`}>{formatMoney(Math.abs(remaining))}</div>
                <div className="text-muted small mt-1">
                  {formatMoney(budget.spent)} spent of {formatMoney(budget.amount)}
                </div>
                <p className="small mt-2 mb-0">{STATUS_TEXT[budget.status]}</p>
              </>
            )}
          </div>
        </div>

        {budget.amount !== null && (
          <Row className="g-2 mt-3">
            <Col xs={12} sm={4}>
              <div className="mini-stat">
                <div className="label">{days.isCurrent ? 'Days left' : 'Days'}</div>
                <div className="value">{days.isCurrent ? days.left : days.total}</div>
              </div>
            </Col>
            <Col xs={12} sm={4}>
              <div className="mini-stat">
                <div className="label">Daily average</div>
                <div className="value">{formatMoney(Math.round(dailyAverage))}</div>
              </div>
            </Col>
            <Col xs={12} sm={4}>
              <div className="mini-stat">
                <div className="label">Safe per day</div>
                <div className="value">{safePerDay === null ? '—' : formatMoney(Math.floor(safePerDay))}</div>
              </div>
            </Col>
          </Row>
        )}

        {showLink && budget.amount !== null && (
          <div className="text-end mt-3">
            <Link to="/budget" className="small fw-semibold">
              Change budget <i className="bi bi-arrow-right" aria-hidden />
            </Link>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
