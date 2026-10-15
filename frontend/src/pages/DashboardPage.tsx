import { useCallback, useState } from 'react';
import { Alert, Card, Col, Form, Row } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { dashboardApi } from '../api';
import BudgetCard from '../components/BudgetCard';
import CategoryBreakdown from '../components/CategoryBreakdown';
import ExpenseTable from '../components/expenses/ExpenseTable';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { formatMoney, formatMonth, thisMonth } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const denied = (location.state as { denied?: boolean } | null)?.denied;
  const [month, setMonth] = useState(thisMonth());

  const load = useCallback(() => dashboardApi.get(month), [month]);
  const { data, loading, error } = useApi(load);

  const remaining = data?.budget.remaining ?? null;
  const remainingTone = data?.budget.status === 'over' ? 'danger' : data?.budget.status === 'approaching' ? 'warning' : 'success';

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h3 mb-0">Hi, {user?.name.split(' ')[0]}</h1>
          <p className="text-muted mb-0">Here's your spending for {formatMonth(month)}.</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Control
            type="month"
            aria-label="Choose month"
            value={month}
            max={thisMonth()}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
          />
          <Link to="/expenses/new" className="btn btn-primary text-nowrap">
            + Add expense
          </Link>
        </div>
      </div>

      {denied && <Alert variant="warning">That page is only available to admins.</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && !data && <Loader />}

      {data && (
        <>
          <Row className="g-3 mb-3">
            <Col xs={6} lg={3}>
              <StatCard
                label="Total spent"
                value={formatMoney(data.totalSpent)}
                hint={`${data.expenseCount} expense${data.expenseCount === 1 ? '' : 's'}`}
              />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard
                label="Remaining budget"
                value={remaining === null ? '—' : formatMoney(remaining)}
                hint={remaining === null ? 'No budget set' : `of ${formatMoney(data.budget.amount ?? 0)}`}
                tone={remaining === null ? 'default' : remainingTone}
              />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard
                label="Highest expense"
                value={data.highestExpense ? formatMoney(data.highestExpense.amount) : '—'}
                hint={data.highestExpense?.title ?? 'Nothing yet'}
              />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard
                label="Top category"
                value={<span className="fs-5">{data.spendingByCategory[0]?.name ?? '—'}</span>}
                hint={data.spendingByCategory[0] ? formatMoney(data.spendingByCategory[0].total) : 'Nothing yet'}
              />
            </Col>
          </Row>

          <Row className="g-3">
            <Col lg={5}>
              <div className="mb-3">
                <BudgetCard budget={data.budget} showLink />
              </div>
              <Card>
                <Card.Body>
                  <Card.Title className="h6 mb-3">Spending by category</Card.Title>
                  <CategoryBreakdown items={data.spendingByCategory} emptyText="No expenses this month yet." />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={7}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title className="h6 mb-0">Recent expenses</Card.Title>
                    <Link to="/expenses" className="small">
                      View all
                    </Link>
                  </div>
                  {data.recentExpenses.length ? (
                    <ExpenseTable expenses={data.recentExpenses} />
                  ) : (
                    <p className="text-muted mb-0">
                      No expenses yet. <Link to="/expenses/new">Add your first one</Link>.
                    </p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
