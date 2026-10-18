import { useCallback, useState } from 'react';
import { Alert, Card, Col, Row } from 'react-bootstrap';
import { MonthPicker } from '../components/DatePickers';
import { Link, useLocation } from 'react-router-dom';
import { dashboardApi } from '../api';
import BudgetCard from '../components/BudgetCard';
import CategoryBreakdown from '../components/CategoryBreakdown';
import DailySpendingChart from '../components/DailySpendingChart';
import ExpenseList from '../components/expenses/ExpenseList';
import { DashboardSkeleton } from '../components/Skeleton';
import { EmptyState, PageHeader, StatTile } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { usePageTitle } from '../hooks/usePageTitle';
import type { DashboardData } from '../types';
import { formatMoney, formatMonth, monthDays, plural, thisMonth } from '../utils/format';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

// Two-step checklist for brand-new users.
function GettingStarted({ hasBudget, hasExpense }: { hasBudget: boolean; hasExpense: boolean }) {
  const steps = [
    { done: hasBudget, to: '/budget', icon: 'wallet2', title: 'Set your monthly budget', text: 'Decide how much you want to spend this month.' },
    { done: hasExpense, to: '/expenses/new', icon: 'plus-circle', title: 'Add your first expense', text: 'Record something you paid for today.' },
  ];
  return (
    <Card className="getting-started mb-3">
      <Card.Body>
        <div className="fw-bold fs-5">Welcome to Retain 👋</div>
        <p className="mb-3" style={{ opacity: 0.85 }}>
          Two quick steps and your dashboard comes to life.
        </p>
        <Row className="g-2">
          {steps.map((s) => (
            <Col md={6} key={s.title}>
              <Link to={s.to} className={`step ${s.done ? 'done' : ''}`}>
                <i className={`bi bi-${s.icon} fs-4`} aria-hidden />
                <div className="flex-grow-1">
                  <div className="fw-semibold">{s.title}</div>
                  <div className="small" style={{ opacity: 0.8 }}>
                    {s.text}
                  </div>
                </div>
                <i className={`state bi bi-${s.done ? 'check-circle-fill' : 'arrow-right-circle'}`} aria-label={s.done ? 'Done' : 'Not done yet'} />
              </Link>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
}

// Warning when the current month's budget is nearly or fully used.
function BudgetAlert({ data }: { data: DashboardData }) {
  const { budget } = data;
  const days = monthDays(data.month);
  if (!days.isCurrent || budget.amount === null) return null;
  if (budget.status === 'over') {
    return (
      <Alert variant="danger" className="budget-alert">
        <i className="bi bi-x-octagon-fill" aria-hidden />
        <div>
          <strong>You're over budget.</strong> You've spent {formatMoney(Math.abs(budget.remaining ?? 0))} more than
          your {formatMonth(data.month)} budget. Try to hold off on non-essential spending until next month.
        </div>
      </Alert>
    );
  }
  if (budget.status === 'approaching') {
    const perDay = Math.floor((budget.remaining ?? 0) / Math.max(days.left, 1));
    return (
      <Alert variant="warning" className="budget-alert">
        <i className="bi bi-exclamation-triangle-fill" aria-hidden />
        <div>
          <strong>Heads up – {budget.percentUsed}% of your budget is gone.</strong> You have {formatMoney(budget.remaining ?? 0)} left
          for {plural(days.left, 'day')}, about {formatMoney(perDay)} a day.
        </div>
      </Alert>
    );
  }
  return null;
}

// "↑ 12% vs September" – spending more than last month shows as up.
function Delta({ current, previous, month }: { current: number; previous: number; month: string }) {
  if (!previous) return <>No spending in {formatMonth(month).split(' ')[0]} to compare</>;
  const change = Math.round(((current - previous) / previous) * 100);
  const label = formatMonth(month).split(' ')[0];
  if (change === 0) return <>Same as {label}</>;
  return (
    <span className={`delta ${change > 0 ? 'up' : 'down'}`}>
      <i className={`bi bi-arrow-${change > 0 ? 'up' : 'down'}-right`} aria-hidden /> {Math.abs(change)}%{' '}
      <span className="fw-normal text-muted">{change > 0 ? 'more' : 'less'} than {label}</span>
    </span>
  );
}

export default function DashboardPage() {
  usePageTitle('Dashboard');
  const { user } = useAuth();
  const location = useLocation();
  const denied = (location.state as { denied?: boolean } | null)?.denied;
  const [month, setMonth] = useState(thisMonth());
  const [showDenied, setShowDenied] = useState(true);

  const load = useCallback(() => dashboardApi.get(month), [month]);
  const { data, loading, error } = useApi(load);
  const days = monthDays(month);
  const isNewUser = data && month === thisMonth() && (data.budget.amount === null || data.recentExpenses.length === 0);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user?.name.split(' ')[0]}`}
        subtitle={`Here's how your money moved in ${formatMonth(month)}.`}
        actions={
          <>
            <MonthPicker id="dashboard-month" value={month} max={thisMonth()} onChange={setMonth} />
            <Link to="/expenses/new" className="btn btn-primary text-nowrap d-none d-lg-inline-block">
              <i className="bi bi-plus-lg me-1" aria-hidden /> Add expense
            </Link>
          </>
        }
      />

      {denied && showDenied && (
        <Alert variant="secondary" dismissible onClose={() => setShowDenied(false)} className="d-flex align-items-center gap-2">
          <i className="bi bi-shield-lock" aria-hidden />
          That page is only for admins, so we brought you back to your dashboard.
        </Alert>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {loading && !data && <DashboardSkeleton />}

      {data && (
        <div className={loading ? 'opacity-50' : ''} style={{ transition: 'opacity 0.2s' }}>
          {isNewUser && <GettingStarted hasBudget={data.budget.amount !== null} hasExpense={data.recentExpenses.length > 0} />}
          <BudgetAlert data={data} />

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
                    hint={<Delta current={data.totalSpent} previous={data.previousMonth.totalSpent} month={data.previousMonth.month} />}
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
                    icon="receipt"
                    tone="violet"
                    label="Expenses"
                    value={data.expenseCount}
                    hint={data.spendingByCategory[0] ? `Most on ${data.spendingByCategory[0].name}` : 'Nothing yet'}
                  />
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="g-3">
            <Col lg={7} className="d-flex flex-column gap-3">
              <Card>
                <Card.Body>
                  <div className="card-header-row mb-2">
                    <h2 className="section-title">Spending per day</h2>
                    <span className="small text-muted">{formatMonth(month)}</span>
                  </div>
                  <DailySpendingChart month={month} daily={data.dailySpending} budget={data.budget.amount} />
                </Card.Body>
              </Card>
              <Card className="flex-grow-1">
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
          </Row>
        </div>
      )}
    </>
  );
}
