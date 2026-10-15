import { useCallback, useState } from 'react';
import { Alert, Badge, Button, Card } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { expenseApi } from '../api';
import { getErrorMessage } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';
import { useApi } from '../hooks/useApi';
import { formatDate, formatMoney, paymentLabels } from '../utils/format';

export default function ExpenseDetailPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const load = useCallback(() => expenseApi.get(id), [id]);
  const { data: expense, loading, error } = useApi(load);

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await expenseApi.remove(id);
      navigate('/expenses', { replace: true });
    } catch (err) {
      setDeleteError(getErrorMessage(err));
      setDeleting(false);
    }
  };

  if (loading) return <Loader />;
  if (error || !expense) {
    return (
      <Alert variant="danger">
        {error || 'Expense not found'} – <Link to="/expenses">back to expenses</Link>
      </Alert>
    );
  }

  return (
    <div className="narrow-page">
      <Link to="/expenses" className="small d-inline-block mb-3">
        ← Back to expenses
      </Link>
      <Card>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
            <div>
              <h1 className="h4 mb-1">{expense.title}</h1>
              <Badge bg="light" text="dark" className="border">
                {expense.category.name}
              </Badge>
            </div>
            <div className="display-6 fw-semibold">{formatMoney(expense.amount)}</div>
          </div>

          <dl className="row mt-4 mb-0 detail-list">
            <dt className="col-sm-4">Date</dt>
            <dd className="col-sm-8">{formatDate(expense.date)}</dd>
            <dt className="col-sm-4">Payment method</dt>
            <dd className="col-sm-8">{paymentLabels[expense.paymentMethod]}</dd>
            <dt className="col-sm-4">Notes</dt>
            <dd className="col-sm-8">{expense.notes || <span className="text-muted">No notes</span>}</dd>
            <dt className="col-sm-4">Last updated</dt>
            <dd className="col-sm-8 small text-muted">{formatDate(expense.updatedAt)}</dd>
          </dl>

          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button variant="outline-danger" onClick={() => setConfirming(true)}>
              Delete
            </Button>
            <Link to={`/expenses/${expense.id}/edit`} className="btn btn-primary">
              Edit
            </Link>
          </div>
        </Card.Body>
      </Card>

      <ConfirmModal
        show={confirming}
        title="Delete expense?"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirming(false)}
      >
        {deleteError && <Alert variant="danger">{deleteError}</Alert>}
        This can't be undone.
      </ConfirmModal>
    </div>
  );
}
