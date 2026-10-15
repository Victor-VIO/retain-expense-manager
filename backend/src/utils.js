// Small shared helpers for routes.

export const PAYMENT_METHODS = ['cash', 'debit_card', 'credit_card', 'bank_transfer', 'mobile_money', 'other'];

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const isMonth = (value) => /^\d{4}-(0[1-9]|1[0-2])$/.test(value ?? '');
export const isDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') && !Number.isNaN(Date.parse(value));

export const currentMonth = () => new Date().toISOString().slice(0, 7);

// Under 80% used is "within", 80–100% is "approaching", above 100% is "over".
export function budgetStatus(spent, budget) {
  if (!budget) return 'no_budget';
  const ratio = spent / budget;
  if (ratio > 1) return 'over';
  if (ratio >= 0.8) return 'approaching';
  return 'within';
}

// Shape an expense row (joined with its category) for API responses.
export function toExpense(row) {
  return {
    id: Number(row.id),
    title: row.title,
    amount: Number(row.amount),
    date: row.date,
    paymentMethod: row.payment_method,
    notes: row.notes ?? '',
    category: { id: Number(row.category_id), name: row.category_name },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const round2 = (n) => Math.round(Number(n) * 100) / 100;
