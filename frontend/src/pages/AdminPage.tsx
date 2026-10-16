import { useCallback } from 'react';
import { Alert, Badge, Card, Col, Row, Table } from 'react-bootstrap';
import { adminApi } from '../api';
import CategoryManager from '../components/admin/CategoryManager';
import CategoryBreakdown from '../components/CategoryBreakdown';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import { useApi } from '../hooks/useApi';
import { useCategories } from '../hooks/useCategories';
import type { CategoryTotal } from '../types';
import { formatDate, formatMoney, plural } from '../utils/format';

function UsageList({ title, items }: { title: string; items: CategoryTotal[] }) {
  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="h6 mb-3">{title}</Card.Title>
        <ol className="mb-0 ps-3">
          {items.map((c) => (
            <li key={c.categoryId} className="mb-1">
              <div className="d-flex justify-content-between gap-2">
                <span className="text-truncate">{c.name}</span>
                <span className="text-muted small text-nowrap">{plural(c.count, 'use')}</span>
              </div>
            </li>
          ))}
        </ol>
      </Card.Body>
    </Card>
  );
}

export default function AdminPage() {
  const { data, loading, error, reload } = useApi(adminApi.insights);
  const { categories, reload: reloadCategories } = useCategories();

  // Category changes affect the insights too.
  const handleCategoriesChanged = useCallback(() => {
    reloadCategories();
    reload();
  }, [reloadCategories, reload]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h3 mb-0">Admin dashboard</h1>
          <p className="text-muted mb-0">Platform activity and category management.</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && !data && <Loader text="Loading insights..." />}

      {data && (
        <>
          <Row className="g-3 mb-3">
            <Col xs={6} lg={3}>
              <StatCard label="Registered users" value={data.totalUsers} />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard label="Expenses recorded" value={data.totalExpenses} />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard label="Total value" value={formatMoney(data.totalExpenseValue)} />
            </Col>
            <Col xs={6} lg={3}>
              <StatCard label="Expenses this month" value={data.expensesThisMonth} />
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col lg={5}>
              <CategoryManager categories={categories} onChanged={handleCategoriesChanged} />
            </Col>
            <Col lg={7}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="h6 mb-3">Total spending per category</Card.Title>
                  <CategoryBreakdown items={data.spendingPerCategory.filter((c) => c.total > 0)} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-3 mb-3">
            <Col md={6}>
              <UsageList title="Top 5 most-used categories" items={data.topCategories} />
            </Col>
            <Col md={6}>
              <UsageList title="Bottom 5 least-used categories" items={data.bottomCategories} />
            </Col>
          </Row>

          <Row className="g-3">
            <Col lg={7}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="h6 mb-2">Recently added expenses</Card.Title>
                  {data.recentExpenses.length ? (
                    <Table size="sm" responsive className="mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th className="d-none d-sm-table-cell">User</th>
                          <th className="d-none d-md-table-cell">Category</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentExpenses.map((e) => (
                          <tr key={e.id}>
                            <td>
                              {e.title}
                              <div className="small text-muted">{formatDate(e.date)}</div>
                            </td>
                            <td className="d-none d-sm-table-cell">{e.userName}</td>
                            <td className="d-none d-md-table-cell">{e.categoryName}</td>
                            <td className="text-end text-nowrap">{formatMoney(e.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-muted mb-0">No expenses recorded yet.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col lg={5}>
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="h6 mb-2">Recently registered users</Card.Title>
                  <Table size="sm" responsive className="mb-0 align-middle">
                    <tbody>
                      {data.recentUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            {u.name}{' '}
                            {u.role === 'admin' && (
                              <Badge bg="dark" className="ms-1">
                                admin
                              </Badge>
                            )}
                            <div className="small text-muted text-break">{u.email}</div>
                          </td>
                          <td className="text-end small text-muted text-nowrap">{formatDate(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
