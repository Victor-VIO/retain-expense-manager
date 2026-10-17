import { useCallback, useState, type FormEvent } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { budgetApi } from '../api';
import { getErrorMessage } from '../api/client';
import BudgetCard from '../components/BudgetCard';
import Loader from '../components/Loader';
import { PageHeader, StatusPill } from '../components/ui';
import { useApi } from '../hooks/useApi';
import type { BudgetSummary } from '../types';
import { formatMoney, formatMoneyShort, formatMonth, thisMonth } from '../utils/format';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

const STATUS_COLOR = {
  within: 'var(--status-good)',
  approaching: 'var(--status-warning)',
  over: 'var(--status-critical)',
  no_budget: 'var(--status-none)',
} as const;

export default function BudgetPage() {
  const [month, setMonth] = useState(thisMonth());
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const loadMonth = useCallback(() => budgetApi.get(month), [month]);
  const { data: budget, loading, error, setData: setBudget } = useApi<BudgetSummary>(loadMonth);
  const { data: history, reload: reloadHistory } = useApi(budgetApi.list);

  // Prefill the input with the saved budget whenever a new month's budget loads.
  const [prefilledFrom, setPrefilledFrom] = useState<BudgetSummary | null>(null);
  if (budget !== prefilledFrom) {
    setPrefilledFrom(budget);
    setAmount(budget?.amount ? String(budget.amount) : '');
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!amount || Number(amount) <= 0) {
      setMessage({ type: 'danger', text: 'Enter a budget greater than 0' });
      return;
    }
    setSaving(true);
    try {
      const saved = await budgetApi.save(month, Number(amount));
      setBudget(saved);
      reloadHistory();
      setMessage({ type: 'success', text: `Budget for ${formatMonth(month)} saved.` });
    } catch (err) {
      setMessage({ type: 'danger', text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Monthly budget" subtitle="Decide how much you want to spend this month, then track it." />

      <Row className="g-3">
        <Col lg={7}>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && !budget ? <Loader /> : budget && <BudgetCard budget={budget} fill={false} />}

          {history && history.length > 0 && (
            <Card className="mt-3">
              <Card.Body>
                <h2 className="section-title mb-1">Your budgets</h2>
                <p className="text-muted small mb-2">Tap a month to view or change it.</p>
                {history.map((b) => {
                  const pct = Math.min(b.percentUsed ?? 0, 100);
                  return (
                    <button
                      key={b.month}
                      type="button"
                      className={`legend-row w-100 border-0 text-start ${b.month === month ? 'hovered' : ''}`}
                      style={{ background: b.month === month ? undefined : 'transparent', color: 'inherit' }}
                      onClick={() => setMonth(b.month)}
                    >
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                          <span className="name">{formatMonth(b.month)}</span>
                          <StatusPill status={b.status} />
                        </div>
                        <div className="legend-track my-2">
                          <span style={{ width: `${pct}%`, background: STATUS_COLOR[b.status] }} />
                        </div>
                        <div className="meta">
                          {formatMoney(b.spent)} of {formatMoney(b.amount ?? 0)} · {b.percentUsed ?? 0}% used
                        </div>
                      </div>
                    </button>
                  );
                })}
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={5}>
          <Card>
            <Card.Body>
              <h2 className="section-title mb-3">{budget?.amount ? 'Update your budget' : 'Set your budget'}</h2>
              {message && (
                <Alert variant={message.type} className="d-flex align-items-center gap-2 py-2">
                  <i className={`bi bi-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} aria-hidden />
                  {message.text}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="budget-month">
                  <Form.Label>Month</Form.Label>
                  <Form.Control
                    type="month"
                    value={month}
                    onChange={(e) => {
                      if (e.target.value) setMonth(e.target.value);
                      setMessage(null);
                    }}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label htmlFor="budget-amount">Budget amount</Form.Label>
                  <div className="amount-field">
                    <span>₦</span>
                    <input
                      id="budget-amount"
                      type="number"
                      min="1"
                      step="0.01"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </Form.Group>
                <div className="d-flex flex-wrap gap-2 mb-4" aria-label="Quick amounts">
                  {QUICK_AMOUNTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={`choice-chip py-1 px-3 ${Number(amount) === q ? 'selected' : ''}`}
                      onClick={() => setAmount(String(q))}
                    >
                      {formatMoneyShort(q)}
                    </button>
                  ))}
                </div>
                <Button type="submit" className="w-100" disabled={saving || loading}>
                  {saving ? 'Saving...' : 'Save budget'}
                </Button>
              </Form>

              <div className="mt-4 pt-3 border-top">
                <div className="small fw-bold mb-2">What the colours mean</div>
                <ul className="list-unstyled small mb-0 d-grid gap-2">
                  <li className="d-flex align-items-center gap-2">
                    <StatusPill status="within" /> <span className="text-muted">under 80% used</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <StatusPill status="approaching" /> <span className="text-muted">80–100% used</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <StatusPill status="over" /> <span className="text-muted">spent more than the budget</span>
                  </li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </>
  );
}
