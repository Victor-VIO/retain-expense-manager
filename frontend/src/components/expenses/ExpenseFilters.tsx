import { useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  hasActiveFilters,
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

export default function ExpenseFilters({ categories }: { categories: Category[] }) {
  const filters = useAppSelector((state) => state.filters);
  const dispatch = useAppDispatch();

  const [search, setSearchText] = useDebouncedField(filters.search, (v) => dispatch(setSearch(v)));
  const [minAmount, setMin] = useDebouncedField(filters.minAmount, (v) => dispatch(setAmountRange({ minAmount: v })));
  const [maxAmount, setMax] = useDebouncedField(filters.maxAmount, (v) => dispatch(setAmountRange({ maxAmount: v })));

  const handleSort = (value: string) => {
    const [sortBy, order] = value.split('-') as [FiltersState['sortBy'], FiltersState['order']];
    dispatch(setSort({ sortBy, order }));
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Row className="g-2">
          <Col xs={12} lg={4}>
            <Form.Control
              type="search"
              placeholder="Search title or notes..."
              aria-label="Search expenses"
              value={search}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={6} lg={3}>
            <Form.Select
              aria-label="Filter by category"
              value={filters.categoryId ?? ''}
              onChange={(e) => dispatch(setCategory(e.target.value ? Number(e.target.value) : null))}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={6} lg={2}>
            <Form.Select
              aria-label="Filter by payment method"
              value={filters.paymentMethod ?? ''}
              onChange={(e) => dispatch(setPaymentMethod((e.target.value || null) as PaymentMethod | null))}
            >
              <option value="">All payments</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {paymentLabels[m]}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} lg={3}>
            <Form.Select
              aria-label="Sort expenses"
              value={`${filters.sortBy}-${filters.order}`}
              onChange={(e) => handleSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Sort: {o.label}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={6} md={3}>
            <Form.Label className="small text-muted mb-1" htmlFor="filter-from">
              From
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
              To
            </Form.Label>
            <Form.Control
              id="filter-to"
              type="date"
              value={filters.endDate}
              min={filters.startDate || undefined}
              onChange={(e) => dispatch(setDateRange({ endDate: e.target.value }))}
            />
          </Col>
          <Col xs={6} md={2}>
            <Form.Label className="small text-muted mb-1" htmlFor="filter-min">
              Min amount
            </Form.Label>
            <Form.Control
              id="filter-min"
              type="number"
              min={0}
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMin(e.target.value)}
            />
          </Col>
          <Col xs={6} md={2}>
            <Form.Label className="small text-muted mb-1" htmlFor="filter-max">
              Max amount
            </Form.Label>
            <Form.Control
              id="filter-max"
              type="number"
              min={0}
              placeholder="Any"
              value={maxAmount}
              onChange={(e) => setMax(e.target.value)}
            />
          </Col>
          <Col xs={12} md={2} className="d-flex align-items-end">
            <Button
              variant="outline-secondary"
              className="w-100"
              disabled={!hasActiveFilters(filters)}
              onClick={() => dispatch(resetFilters())}
            >
              Clear filters
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
