import { useState, type FormEvent } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { getErrorMessage } from '../../api/client';
import { PAYMENT_METHODS, type Category, type ExpenseInput, type PaymentMethod } from '../../types';
import { paymentIcons } from '../../utils/categories';
import { paymentLabels, today } from '../../utils/format';
import { CategoryAvatar } from '../ui';

interface Props {
  categories: Category[];
  initial?: ExpenseInput;
  submitLabel: string;
  onSubmit: (input: ExpenseInput) => Promise<void>;
  onCancel: () => void;
}

interface FormValues {
  title: string;
  amount: string;
  categoryId: string;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;

function validate(v: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!v.amount || Number(v.amount) <= 0) errors.amount = 'Enter how much you spent';
  else if (!Number.isInteger(Number(v.amount))) errors.amount = 'Use whole francs – no decimals';
  if (!v.title.trim()) errors.title = 'Give the expense a short name';
  else if (v.title.length > 120) errors.title = 'Keep the name under 120 characters';
  if (!v.categoryId) errors.categoryId = 'Pick a category';
  if (!v.date) errors.date = 'Pick a date';
  return errors;
}

// Used for both creating and editing an expense.
// Amount first (what people think of first), then tap-to-pick category and payment.
export default function ExpenseForm({ categories, initial, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<FormValues>({
    title: initial?.title ?? '',
    amount: initial ? String(initial.amount) : '',
    categoryId: initial ? String(initial.categoryId) : '',
    date: initial?.date ?? today(),
    paymentMethod: initial?.paymentMethod ?? 'cash',
    notes: initial?.notes ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  // "Uncategorized" is the fallback, so list it last.
  const sortedCategories = [...categories].sort((a, b) => Number(a.isDefault) - Number(b.isDefault));
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setServerError('');
    try {
      await onSubmit({
        title: values.title.trim(),
        amount: Number(values.amount),
        categoryId: Number(values.categoryId),
        date: values.date,
        paymentMethod: values.paymentMethod,
        notes: values.notes.trim(),
      });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      {serverError && <Alert variant="danger">{serverError}</Alert>}

      <Form.Group className="mb-4" controlId="amount">
        <Form.Label>How much?</Form.Label>
        <div className={`amount-field ${errors.amount ? 'is-invalid' : ''}`}>
          <span>RWF</span>
          <input
            id="amount"
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="0"
            value={values.amount}
            onChange={(e) => set('amount', e.target.value)}
            aria-invalid={!!errors.amount}
          />
        </div>
        {errors.amount && <div className="invalid-feedback d-block">{errors.amount}</div>}
      </Form.Group>

      <Row className="g-3 mb-4">
        <Col xs={12} sm={7}>
          <Form.Group controlId="title">
            <Form.Label>What was it for?</Form.Label>
            <Form.Control
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Groceries at Simba Supermarket"
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12} sm={5}>
          <Form.Group controlId="date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={values.date}
              max={today()}
              onChange={(e) => set('date', e.target.value)}
              isInvalid={!!errors.date}
            />
            <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <fieldset className="mb-4">
        <legend className="form-label">Category</legend>
        <div className="choice-grid with-icons" role="radiogroup" aria-label="Category">
          {sortedCategories.map((c) => {
            const selected = values.categoryId === String(c.id);
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`choice-chip ${selected ? 'selected' : ''} ${errors.categoryId ? 'is-invalid' : ''}`}
                onClick={() => set('categoryId', String(c.id))}
              >
                <CategoryAvatar name={c.name} size="sm" />
                <span className="chip-text">{c.name}</span>
              </button>
            );
          })}
        </div>
        {errors.categoryId && <div className="invalid-feedback d-block">{errors.categoryId}</div>}
      </fieldset>

      <fieldset className="mb-4">
        <legend className="form-label">Paid with</legend>
        <div className="choice-grid" role="radiogroup" aria-label="Payment method">
          {PAYMENT_METHODS.map((m) => {
            const selected = values.paymentMethod === m;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`choice-chip ${selected ? 'selected' : ''}`}
                onClick={() => set('paymentMethod', m)}
              >
                <i className={`bi bi-${paymentIcons[m]} text-muted`} aria-hidden />
                {paymentLabels[m]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Form.Group controlId="notes">
        <Form.Label>
          Notes <span className="text-muted fw-normal">(optional)</span>
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={values.notes}
          placeholder="Anything you want to remember about this"
          onChange={(e) => set('notes', e.target.value)}
        />
      </Form.Group>

      <div className="d-flex gap-2 justify-content-end mt-4">
        <Button variant="light" className="btn-light-soft" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="px-4">
          {saving ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
}
