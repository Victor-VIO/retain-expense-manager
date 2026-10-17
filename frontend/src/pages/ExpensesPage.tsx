import { useEffect, useState } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { expenseApi } from '../api';
import { getErrorMessage } from '../api/client';
import ConfirmModal from '../components/ConfirmModal';
import ExpenseFilters from '../components/expenses/ExpenseFilters';
import ExpenseList from '../components/expenses/ExpenseList';
import { ListSkeleton } from '../components/Skeleton';
import PaginationBar from '../components/PaginationBar';
import { EmptyState, PageHeader } from '../components/ui';
import { useCategories } from '../hooks/useCategories';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../context/ToastContext';
import { exportExpensesCsv } from '../utils/exportCsv';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchExpenses } from '../store/expensesSlice';
import { hasActiveFilters, resetFilters, setPage } from '../store/filtersSlice';
import type { Expense } from '../types';
import { formatMoney, plural } from '../utils/format';

export default function ExpensesPage() {
  usePageTitle('Expenses');
  const notify = useToast();
  const [exporting, setExporting] = useState(false);
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
      notify(`"${toDelete.title}" deleted`);
      setToDelete(null);
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = hasActiveFilters(filters);

  const handleExport = async () => {
    setExporting(true);
    try {
      const count = await exportExpensesCsv(filters);
      notify(`Downloaded ${plural(count, 'expense')} as CSV`);
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={
          <>
            {plural(pagination.total, filtered ? 'matching expense' : 'expense')} ·{' '}
            <span className="fw-semibold text-body">{formatMoney(totalAmount)}</span> total
          </>
        }
        actions={
          <Link to="/expenses/new" className="btn btn-primary d-none d-lg-inline-block">
            <i className="bi bi-plus-lg me-1" aria-hidden /> Add expense
          </Link>
        }
      />

      <ExpenseFilters
        categories={categories}
        extra={
          <button
            type="button"
            className="btn btn-light btn-light-soft text-nowrap"
            onClick={handleExport}
            disabled={exporting || pagination.total === 0}
            title="Download the expenses shown as a CSV file (opens in Excel)"
            aria-label="Export to CSV"
          >
            <i className={`bi bi-${exporting ? 'hourglass-split' : 'download'} me-md-1`} aria-hidden />
            <span className="d-none d-md-inline">{exporting ? 'Exporting...' : 'Export'}</span>
          </button>
        }
      />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {status === 'loading' && !items.length ? (
            <ListSkeleton rows={6} />
          ) : items.length ? (
            <div className={status === 'loading' ? 'opacity-50' : ''}>
              <ExpenseList expenses={items} onDelete={setToDelete} groupByDate={filters.sortBy === 'date'} />
            </div>
          ) : filtered ? (
            <EmptyState
              icon="search"
              title="Nothing matches these filters"
              text="Try a different search or clear the filters."
              action={
                <button type="button" className="btn btn-light btn-light-soft btn-sm" onClick={() => dispatch(resetFilters())}>
                  Clear filters
                </button>
              }
            />
          ) : (
            <EmptyState
              icon="receipt"
              title="No expenses yet"
              text="Every time you spend money, add it here to see where it goes."
              action={
                <Link to="/expenses/new" className="btn btn-primary btn-sm">
                  Add your first expense
                </Link>
              }
            />
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
