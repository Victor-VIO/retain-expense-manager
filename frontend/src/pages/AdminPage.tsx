import { useCallback } from 'react';
import { Alert, Badge, Card, Col, Row } from 'react-bootstrap';
import { adminApi } from '../api';
import CategoryManager from '../components/admin/CategoryManager';
import CategoryBreakdown from '../components/CategoryBreakdown';
import Loader from '../components/Loader';
import { CategoryAvatar, PageHeader, StatTile } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { useCategories } from '../hooks/useCategories';
import { usePageTitle } from '../hooks/usePageTitle';
import type { CategoryTotal } from '../types';
import { formatDate, formatMoney, plural } from '../utils/format';

// Ranked list of categories by how often they're used.
function UsageList({ title, subtitle, items }: { title: string; subtitle: string; items: CategoryTotal[] }) {
  const max = Math.max(...items.map((c) => c.count), 1);
  return (
    <Card className="h-100">
      <Card.Body>
        <h2 className="section-title">{title}</h2>
        <p className="text-muted small mb-3">{subtitle}</p>
        <ol className="list-unstyled mb-0 d-grid gap-3">
          {items.map((c, i) => (
            <li key={c.categoryId} className="d-flex align-items-center gap-3">
              <span className="rank-badge">{i + 1}</span>
              <CategoryAvatar name={c.name} size="sm" />
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div className="d-flex justify-content-between gap-2 small">
                  <span className="fw-semibold text-truncate">{c.name}</span>
                  <span className="text-muted text-nowrap">{plural(c.count, 'use')}</span>
                </div>
                <div className="legend-track">
                  <span style={{ width: `${(c.count / max) * 100}%`, background: 'var(--brand)' }} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Card.Body>
    </Card>
  );
}

export default function AdminPage() {
  usePageTitle('Admin');
  const { data, loading, error, reload } = useApi(adminApi.insights);
  const { categories, reload: reloadCategories } = useCategories();

  // Category changes affect the insights too.
  const handleCategoriesChanged = useCallback(() => {
    reloadCategories();
    reload();
  }, [reloadCategories, reload]);

  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Activity across all Retain users, and the expense categories everyone uses." />

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && !data && <Loader text="Loading insights..." />}

      {data && (
        <>
          <Row className="g-3 mb-3">
            <Col xs={6} lg={3}>
              <StatTile icon="people" tone="brand" label="Registered users" value={data.totalUsers} />
            </Col>
            <Col xs={6} lg={3}>
              <StatTile icon="receipt" tone="blue" label="Expenses recorded" value={data.totalExpenses} />
            </Col>
            <Col xs={6} lg={3}>
              <StatTile icon="cash-stack" tone="orange" label="Total value" value={formatMoney(data.totalExpenseValue)} />
            </Col>
            <Col xs={6} lg={3}>
              <StatTile icon="calendar-check" tone="violet" label="Expenses this month" value={data.expensesThisMonth} />
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col lg={7}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="section-title">Total spending per category</h2>
                  <p className="text-muted small mb-3">All users combined.</p>
                  <CategoryBreakdown items={data.spendingPerCategory} maxRows={8} />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={5}>
              <CategoryManager categories={categories} onChanged={handleCategoriesChanged} />
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col md={6}>
              <UsageList title="Most-used categories" subtitle="Top 5 by number of expenses" items={data.topCategories} />
            </Col>
            <Col md={6}>
              <UsageList title="Least-used categories" subtitle="Bottom 5 by number of expenses" items={data.bottomCategories} />
            </Col>
          </Row>

          <Row className="g-3">
            <Col lg={7}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="section-title mb-2">Recently added expenses</h2>
                  {data.recentExpenses.length ? (
                    data.recentExpenses.map((e) => (
                      <div key={e.id} className="tx-item">
                        <CategoryAvatar name={e.categoryName} />
                        <div className="tx-body">
                          <div className="tx-title">{e.title}</div>
                          <div className="tx-meta">
                            {e.userName} · {e.categoryName} · {formatDate(e.date)}
                          </div>
                        </div>
                        <div className="tx-amount">{formatMoney(e.amount)}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted small mb-0">No expenses recorded yet.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={5}>
              <Card className="h-100">
                <Card.Body>
                  <h2 className="section-title mb-2">Recently registered users</h2>
                  {data.recentUsers.map((u) => (
                    <div key={u.id} className="tx-item">
                      <div className="avatar">
                        {u.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="tx-body">
                        <div className="tx-title">
                          {u.name}
                          {u.role === 'admin' && (
                            <Badge bg="secondary" className="ms-2 fw-semibold">
                              admin
                            </Badge>
                          )}
                        </div>
                        <div className="tx-meta">{u.email}</div>
                      </div>
                      <div className="small text-muted text-nowrap">{formatDate(u.createdAt)}</div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
