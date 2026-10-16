import { useCallback, useState, type ReactNode } from 'react';
import { Alert, Button, Card } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { expenseApi } from '../api';
import { getErrorMessage } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import Loader from '../components/Loader';
import { CategoryAvatar, EmptyState } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { paymentIcons } from '../utils/categories';
import { formatDate, formatMoney, paymentLabels } from '../utils/format';

function DetailItem({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
  return (
    <div className="mini-stat d-flex gap-3 align-items-start">
      <i className={`bi bi-${icon} text-muted fs-5`} aria-hidden />
      <div style={{ minWidth: 0 }}>
        <div className="label">{label}</div>
        <div className="value text-break">{children}</div>
      </div>
    </div>
  );
}

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
      <Card className="narrow-page">
        <Card.Body>
          <EmptyState
            icon="question-circle"
            title={error || 'Expense not found'}
            text="It may have been deleted, or it belongs to another account."
            action={
              <Link to="/expenses" className="btn btn-primary btn-sm">
                Back to expenses
              </Link>
            }
          />
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="narrow-page">
      <Link to="/expenses" className="small fw-semibold d-inline-block mb-3">
        <i className="bi bi-arrow-left me-1" aria-hidden /> Back to expenses
      </Link>
      <Card>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <div className="d-flex justify-content-center mb-3">
              <CategoryAvatar name={expense.category.name} size="lg" />
            </div>
            <h1 className="h4 mb-1">{expense.title}</h1>
            <div className="text-muted small mb-2">{expense.category.name}</div>
            <div className="hero-figure">{formatMoney(expense.amount)}</div>
          </div>

          <div className="detail-grid">
            <DetailItem icon="calendar3" label="Date">
              {formatDate(expense.date)}
            </DetailItem>
            <DetailItem icon={paymentIcons[expense.paymentMethod]} label="Paid with">
              {paymentLabels[expense.paymentMethod]}
            </DetailItem>
            <div style={{ gridColumn: '1 / -1' }}>
              <DetailItem icon="sticky" label="Notes">
                {expense.notes || <span className="text-muted fw-normal">No notes</span>}
              </DetailItem>
            </div>
          </div>
          <div className="small text-muted mt-3 text-center">Last updated {formatDate(expense.updatedAt)}</div>

          <div className="d-flex gap-2 mt-4">
            <Button variant="outline-danger" className="flex-fill" onClick={() => setConfirming(true)}>
              <i className="bi bi-trash3 me-1" aria-hidden /> Delete
            </Button>
            <Link to={`/expenses/${expense.id}/edit`} className="btn btn-primary flex-fill">
              <i className="bi bi-pencil me-1" aria-hidden /> Edit
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
        <strong>{expense.title}</strong> will be removed for good. This can't be undone.
      </ConfirmModal>
    </div>
  );
}
