import { useCallback, useState } from 'react';
import { Alert, Card, Col, Form, Row } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { dashboardApi } from '../api';
import BudgetCard from '../components/BudgetCard';
import CategoryBreakdown from '../components/CategoryBreakdown';
import ExpenseList from '../components/expenses/ExpenseList';
import Loader from '../components/Loader';
import { EmptyState, PageHeader, StatTile } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { formatMoney, formatMonth, monthDays, plural, thisMonth } from '../utils/format';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const denied = (location.state as { denied?: boolean } | null)?.denied;
  const [month, setMonth] = useState(thisMonth());

  const load = useCallback(() => dashboardApi.get(month), [month]);
  const { data, loading, error } = useApi(load);
  const days = monthDays(month);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user?.name.split(' ')[0]}`}
        subtitle={`Here's how your money moved in ${formatMonth(month)}.`}
        actions={
          <>
            <Form.Control
              type="month"
              aria-label="Choose month"
              value={month}
              max={thisMonth()}
              onChange={(e) => e.target.value && setMonth(e.target.value)}
              style={{ maxWidth: 190 }}
            />
            <Link to="/expenses/new" className="btn btn-primary text-nowrap d-none d-lg-inline-block">
              <i className="bi bi-plus-lg me-1" aria-hidden /> Add expense
            </Link>
          </>
        }
      />

      {denied && <Alert variant="warning">That page is only available to admins.</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && !data && <Loader />}

      {data && (
        <div className={loading ? 'opacity-50' : ''}>
          <Row className="g-3 mb-3">
            <Col lg={7}>
              <BudgetCard budget={data.budget} showLink />
            </Col>
            <Col lg={5}>
              <Row className="g-3 h-100">
                <Col xs={6}>
                  <StatTile
                    icon="cash-coin"
                    tone="brand"
                    label="Total spent"
                    value={formatMoney(data.totalSpent)}
                    hint={plural(data.expenseCount, 'expense')}
                  />
                </Col>
                <Col xs={6}>
                  <StatTile
                    icon="calendar3"
                    tone="blue"
                    label="Daily average"
                    value={formatMoney(Math.round(days.elapsed ? data.totalSpent / days.elapsed : 0))}
                    hint={days.isCurrent ? `over ${plural(days.elapsed, 'day')} so far` : `over ${days.total} days`}
                  />
                </Col>
                <Col xs={6}>
                  <StatTile
                    icon="arrow-up-right-circle"
                    tone="orange"
                    label="Biggest expense"
                    value={data.highestExpense ? formatMoney(data.highestExpense.amount) : '—'}
                    hint={data.highestExpense?.title ?? 'Nothing yet'}
                  />
                </Col>
                <Col xs={6}>
                  <StatTile
                    icon="trophy"
                    tone="violet"
                    label="Top category"
                    value={<span className="fs-6 fw-bold">{data.spendingByCategory[0]?.name ?? '—'}</span>}
                    hint={data.spendingByCategory[0] ? formatMoney(data.spendingByCategory[0].total) : 'Nothing yet'}
                  />
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="g-3">
            <Col lg={5}>
              <Card className="h-100">
                <Card.Body>
                  <div className="card-header-row">
                    <h2 className="section-title">Where your money went</h2>
                  </div>
                  <CategoryBreakdown items={data.spendingByCategory} emptyText="No expenses this month yet." />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={7}>
              <Card className="h-100">
                <Card.Body>
                  <div className="card-header-row">
                    <h2 className="section-title">Recent expenses</h2>
                    <Link to="/expenses" className="small fw-semibold">
                      View all <i className="bi bi-arrow-right" aria-hidden />
                    </Link>
                  </div>
                  {data.recentExpenses.length ? (
                    <ExpenseList expenses={data.recentExpenses} />
                  ) : (
                    <EmptyState
                      icon="receipt"
                      title="No expenses yet"
                      text="Add your first expense and it will show up here."
                      action={
                        <Link to="/expenses/new" className="btn btn-primary btn-sm">
                          Add expense
                        </Link>
                      }
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </>
  );
}
