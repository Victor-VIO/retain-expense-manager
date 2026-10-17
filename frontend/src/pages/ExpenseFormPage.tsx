import { useCallback } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { expenseApi } from '../api';
import ExpenseForm from '../components/expenses/ExpenseForm';
import Loader from '../components/Loader';
import { useApi } from '../hooks/useApi';
import { useCategories } from '../hooks/useCategories';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';
import type { Expense, ExpenseInput } from '../types';

// Handles both /expenses/new and /expenses/:id/edit.
export default function ExpenseFormPage() {
  const params = useParams();
  const editId = params.id ? Number(params.id) : null;
  const navigate = useNavigate();
  usePageTitle(editId ? 'Edit expense' : 'Add expense');
  const notify = useToast();
  const { categories, loading: loadingCategories, error: categoryError } = useCategories();

  const load = useCallback(
    () => (editId ? expenseApi.get(editId) : Promise.resolve<Expense | null>(null)),
    [editId],
  );
  const { data: expense, loading, error } = useApi(load);

  const handleSubmit = async (input: ExpenseInput) => {
    const saved = editId ? await expenseApi.update(editId, input) : await expenseApi.create(input);
    notify(editId ? 'Changes saved' : `Added "${saved.title}"`);
    navigate(`/expenses/${saved.id}`, { replace: true });
  };

  const initial: ExpenseInput | undefined = expense
    ? {
        title: expense.title,
        amount: expense.amount,
        categoryId: expense.category.id,
        date: expense.date,
        paymentMethod: expense.paymentMethod,
        notes: expense.notes,
      }
    : undefined;

  return (
    <div className="narrow-page">
      <Link to={editId ? `/expenses/${editId}` : '/expenses'} className="small fw-semibold d-inline-block mb-3">
        <i className="bi bi-arrow-left me-1" aria-hidden /> Back
      </Link>
      <Card>
        <Card.Body className="p-4">
          <h1 className="h4 mb-1">{editId ? 'Edit expense' : 'Add an expense'}</h1>
          <p className="text-muted small mb-4">
            {editId ? 'Change anything and save.' : 'Record something you spent money on.'}
          </p>
          {(error || categoryError) && <Alert variant="danger">{error || categoryError}</Alert>}
          {loading || loadingCategories ? (
            <Loader />
          ) : (
            !error && (
              <ExpenseForm
                categories={categories}
                initial={initial}
                submitLabel={editId ? 'Save changes' : 'Add expense'}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
              />
            )
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
