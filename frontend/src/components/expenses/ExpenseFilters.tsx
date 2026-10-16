import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  resetFilters,
  setAmountRange,
  setCategory,
  setDateRange,
  setPaymentMethod,
  setSearch,
  setSort,
  type FiltersState,
} from '../../store/filtersSlice';
import { PAYMENT_METHODS, type Category, type PaymentMethod } from '../../types';
import { paymentLabels } from '../../utils/format';

// Keeps a text box responsive while only updating Redux after the user pauses typing.
function useDebouncedField(storeValue: string, commit: (value: string) => void, delay = 400) {
  const [value, setValue] = useState(storeValue);
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  });

  // Follow outside changes to the store value, e.g. "Clear filters".
  const [lastStoreValue, setLastStoreValue] = useState(storeValue);
  if (storeValue !== lastStoreValue) {
    setLastStoreValue(storeValue);
    setValue(storeValue);
  }

  useEffect(() => {
    if (value === storeValue) return;
    const id = setTimeout(() => commitRef.current(value), delay);
    return () => clearTimeout(id);
  }, [value, storeValue, delay]);

  return [value, setValue] as const;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'date-desc', label: 'Newest first' },
  { value: 'date-asc', label: 'Oldest first' },
  { value: 'amount-desc', label: 'Highest amount' },
  { value: 'amount-asc', label: 'Lowest amount' },
];

// Number of filters in use (search is visible, so it isn't counted).
const countActive = (f: FiltersState) =>
  [f.categoryId, f.paymentMethod, f.startDate || f.endDate, f.minAmount || f.maxAmount].filter(Boolean).length;

export default function ExpenseFilters({ categories }: { categories: Category[] }) {
  const filters = useAppSelector((state) => state.filters);
  const dispatch = useAppDispatch();
  // Start open if filters are already applied (e.g. coming back to this page).
  const [open, setOpen] = useState(() => countActive(filters) > 0);

  const [search, setSearchText] = useDebouncedField(filters.search, (v) => dispatch(setSearch(v)));
  const [minAmount, setMin] = useDebouncedField(filters.minAmount, (v) => dispatch(setAmountRange({ minAmount: v })));
  const [maxAmount, setMax] = useDebouncedField(filters.maxAmount, (v) => dispatch(setAmountRange({ maxAmount: v })));

  const active = countActive(filters);
  const anything = active > 0 || Boolean(filters.search);

  const handleSort = (value: string) => {
    const [sortBy, order] = value.split('-') as [FiltersState['sortBy'], FiltersState['order']];
    dispatch(setSort({ sortBy, order }));
  };

  return (
    <Card className="filter-bar mb-3">
      <Card.Body>
        <div className="d-flex gap-2">
          <div className="search-input">
            <i className="bi bi-search" aria-hidden />
            <Form.Control
              type="search"
              placeholder="Search expenses..."
              aria-label="Search expenses"
              value={search}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Form.Select
            aria-label="Sort expenses"
            className="d-none d-md-block"
            style={{ maxWidth: 190 }}
            value={`${filters.sortBy}-${filters.order}`}
            onChange={(e) => handleSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Form.Select>
          <Button
            variant="light"
            className="btn-light-soft text-nowrap"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="more-filters"
          >
            <i className="bi bi-sliders me-md-1" aria-hidden />
            <span className="d-none d-md-inline">Filters</span>
            {active > 0 && (
              <Badge bg="primary" pill className="ms-1">
                {active}
              </Badge>
            )}
          </Button>
        </div>

        {open && (
          <Row className="g-2 mt-1" id="more-filters">
            <Col xs={12} className="d-md-none">
              <Form.Label className="small text-muted mb-1" htmlFor="filter-sort">
                Sort by
              </Form.Label>
              <Form.Select id="filter-sort" value={`${filters.sortBy}-${filters.order}`} onChange={(e) => handleSort(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small text-muted mb-1" htmlFor="filter-category">
                Category
              </Form.Label>
              <Form.Select
                id="filter-category"
                value={filters.categoryId ?? ''}
                onChange={(e) => dispatch(setCategory(e.target.value ? Number(e.target.value) : null))}
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small text-muted mb-1" htmlFor="filter-payment">
                Paid with
              </Form.Label>
              <Form.Select
                id="filter-payment"
                value={filters.paymentMethod ?? ''}
                onChange={(e) => dispatch(setPaymentMethod((e.target.value || null) as PaymentMethod | null))}
              >
                <option value="">All</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {paymentLabels[m]}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small text-muted mb-1" htmlFor="filter-from">
                From date
              </Form.Label>
              <Form.Control
                id="filter-from"
                type="date"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={(e) => dispatch(setDateRange({ startDate: e.target.value }))}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small text-muted mb-1" htmlFor="filter-to">
                To date
              </Form.Label>
              <Form.Control
                id="filter-to"
                type="date"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={(e) => dispatch(setDateRange({ endDate: e.target.value }))}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small text-muted mb-1" htmlFor="filter-min">
                Min amount (₦)
              </Form.Label>
              <Form.Control
                id="filter-min"
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMin(e.target.value)}
              />
            </Col>
            <Col xs={6} md={3}>
              <Form.Label className="small text-muted mb-1" htmlFor="filter-max">
                Max amount (₦)
              </Form.Label>
              <Form.Control
                id="filter-max"
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="Any"
                value={maxAmount}
                onChange={(e) => setMax(e.target.value)}
              />
            </Col>
          </Row>
        )}

        {anything && (
          <div className="d-flex justify-content-end mt-2">
            <Button variant="link" size="sm" className="px-0" onClick={() => dispatch(resetFilters())}>
              <i className="bi bi-x-circle me-1" aria-hidden />
              Clear all filters
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
