import { useState, type FormEvent } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { getErrorMessage } from '../../api/client';
import { PAYMENT_METHODS, type Category, type ExpenseInput, type PaymentMethod } from '../../types';
import { paymentLabels, today } from '../../utils/format';

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
  if (!v.title.trim()) errors.title = 'Give the expense a title';
  else if (v.title.length > 120) errors.title = 'Keep the title under 120 characters';
  if (!v.amount || Number(v.amount) <= 0) errors.amount = 'Enter an amount greater than 0';
  if (!v.categoryId) errors.categoryId = 'Pick a category';
  if (!v.date) errors.date = 'Pick a date';
  return errors;
}

// Used for both creating and editing an expense.
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
      <Row className="g-3">
        <Col xs={12}>
          <Form.Group controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={values.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Groceries at Shoprite"
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12} sm={6}>
          <Form.Group controlId="amount">
            <Form.Label>Amount (₦)</Form.Label>
            <Form.Control
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={values.amount}
              onChange={(e) => set('amount', e.target.value)}
              isInvalid={!!errors.amount}
            />
            <Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12} sm={6}>
          <Form.Group controlId="date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={values.date}
              onChange={(e) => set('date', e.target.value)}
              isInvalid={!!errors.date}
            />
            <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12} sm={6}>
          <Form.Group controlId="category">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={values.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              isInvalid={!!errors.categoryId}
            >
              <option value="">Choose...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.categoryId}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12} sm={6}>
          <Form.Group controlId="paymentMethod">
            <Form.Label>Payment method</Form.Label>
            <Form.Select
              value={values.paymentMethod}
              onChange={(e) => set('paymentMethod', e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {paymentLabels[m]}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Form.Group controlId="notes">
            <Form.Label>
              Notes <span className="text-muted small">(optional)</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={values.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>
      <div className="d-flex gap-2 justify-content-end mt-4">
        <Button variant="outline-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </Form>
  );
}
