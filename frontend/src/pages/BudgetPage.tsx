import { useCallback, useState, type FormEvent } from 'react';
import { Alert, Badge, Button, Card, Col, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { budgetApi } from '../api';
import { getErrorMessage } from '../api/client';
import BudgetCard from '../components/BudgetCard';
import Loader from '../components/Loader';
import { useApi } from '../hooks/useApi';
import type { BudgetSummary } from '../types';
import { budgetStatusInfo, formatMoney, formatMonth, thisMonth } from '../utils/format';

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
      <div className="page-header">
        <div>
          <h1 className="h3 mb-0">Monthly budget</h1>
          <p className="text-muted mb-0">Set a spending limit and see how close you are to it.</p>
        </div>
      </div>

      <Row className="g-3">
        <Col lg={5}>
          <Card>
            <Card.Body>
              <Card.Title className="h6 mb-3">{budget?.amount ? 'Update budget' : 'Set budget'}</Card.Title>
              {message && <Alert variant={message.type}>{message.text}</Alert>}
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
                <Form.Group className="mb-3" controlId="budget-amount">
                  <Form.Label>Budget amount</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>₦</InputGroup.Text>
                    <Form.Control
                      type="number"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 150000"
                    />
                  </InputGroup>
                </Form.Group>
                <Button type="submit" className="w-100" disabled={saving || loading}>
                  {saving ? 'Saving...' : 'Save budget'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && !budget ? <Loader /> : budget && <BudgetCard budget={budget} />}

          {history && history.length > 0 && (
            <Card className="mt-3">
              <Card.Body>
                <Card.Title className="h6 mb-2">Your budgets</Card.Title>
                <Table size="sm" responsive className="mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th className="text-end">Budget</th>
                      <th className="text-end">Spent</th>
                      <th className="text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((b) => (
                      <tr key={b.month} role="button" onClick={() => setMonth(b.month)}>
                        <td>{formatMonth(b.month)}</td>
                        <td className="text-end">{formatMoney(b.amount ?? 0)}</td>
                        <td className="text-end">{formatMoney(b.spent)}</td>
                        <td className="text-end">
                          <Badge bg={budgetStatusInfo[b.status].variant}>{budgetStatusInfo[b.status].label}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
}
