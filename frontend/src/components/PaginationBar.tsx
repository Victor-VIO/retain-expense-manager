import { Pagination as BsPagination } from 'react-bootstrap';
import type { Pagination } from '../types';

interface Props {
  pagination: Pagination;
  onChange: (page: number) => void;
}

// Page numbers with prev/next. Shows at most 5 numbers around the current page.
export default function PaginationBar({ pagination, onChange }: Props) {
  const { page, totalPages, total, limit } = pagination;
  if (total === 0) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-3 pt-3 border-top">
      <span className="small text-muted">
        Showing {from}–{to} of {total}
      </span>
      {totalPages > 1 && (
        <BsPagination size="sm" className="mb-0">
          <BsPagination.Prev disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page" />
          {pages.map((p) => (
            <BsPagination.Item key={p} active={p === page} onClick={() => onChange(p)}>
              {p}
            </BsPagination.Item>
          ))}
          <BsPagination.Next disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Next page" />
        </BsPagination>
      )}
    </div>
  );
}
