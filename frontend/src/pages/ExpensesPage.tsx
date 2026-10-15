import { useEffect, useState } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { expenseApi } from '../api';
import { getErrorMessage } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseTable from '../components/expenses/ExpenseTable';
import Loader from '../components/Loader';
import PaginationBar from '../components/PaginationBar';
import { useCategories } from '../hooks/useCategories';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchExpenses } from '../store/expensesSlice';
import { hasActiveFilters, setPage } from '../store/filtersSlice';
import type { Expense } from '../types';
import { formatMoney } from '../utils/format';

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const { items, pagination, totalAmount, status, error } = useAppSelector((state) => state.expenses);
  const { categories } = useCategories();

  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Refetch whenever any filter, sort or page changes.
  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch, filters]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await expenseApi.remove(toDelete.id);
      // Step back a page if we just removed the last row on this one.
      if (items.length === 1 && filters.page > 1) dispatch(setPage(filters.page - 1));
      else dispatch(fetchExpenses());
      setToDelete(null);
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = hasActiveFilters(filters);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="h3 mb-0">Expenses</h1>
          <p className="text-muted mb-0">
            {pagination.total} {filtered ? 'matching' : 'total'} · {formatMoney(totalAmount)}
          </p>
        </div>
        <Link to="/expenses/new" className="btn btn-primary">
          + Add expense
        </Link>
      </div>

      <ExpenseFilters categories={categories} />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {status === 'loading' && !items.length ? (
            <Loader text="Loading expenses..." />
          ) : items.length ? (
            <div className={status === 'loading' ? 'opacity-50' : ''}>
              <ExpenseTable expenses={items} onDelete={setToDelete} />
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              {filtered ? 'No expenses match these filters.' : "You haven't recorded any expenses yet."}
              {!filtered && (
                <div className="mt-2">
                  <Link to="/expenses/new">Add your first expense</Link>
                </div>
              )}
            </div>
          )}
          <PaginationBar pagination={pagination} onChange={(page) => dispatch(setPage(page))} />
        </Card.Body>
      </Card>

      <ConfirmModal
        show={!!toDelete}
        title="Delete expense?"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setToDelete(null);
          setDeleteError('');
        }}
      >
        {deleteError && <Alert variant="danger">{deleteError}</Alert>}
        <strong>{toDelete?.title}</strong> ({toDelete && formatMoney(toDelete.amount)}) will be removed for good.
      </ConfirmModal>
    </>
  );
}
