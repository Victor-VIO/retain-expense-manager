import type { BudgetStatus, PaymentMethod } from '../types';

// Amounts are Rwandan francs (RWF), which have no cents: "RWF 21,000".
export const CURRENCY = 'RWF';
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export const formatMoney = (value: number) => `${value < 0 ? '-' : ''}${CURRENCY} ${whole.format(Math.abs(value))}`;

// Short form for tight spots: "RWF 150K", "RWF 1.2M"
export const formatMoneyShort = (value: number) => `${CURRENCY} ${compact.format(value)}`;

export const formatDate = (value: string) =>
  new Date(value.length === 10 ? `${value}T00:00:00` : value.replace(' ', 'T')).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const formatMonth = (month: string) =>
  new Date(`${month}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

// Local date helpers (avoid toISOString, which shifts to UTC).
const pad = (n: number) => String(n).padStart(2, '0');
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const thisMonth = () => today().slice(0, 7);

export const paymentLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  debit_card: 'Debit card',
  credit_card: 'Credit card',
  bank_transfer: 'Bank transfer',
  mobile_money: 'Mobile money',
  other: 'Other',
};

export const budgetStatusInfo: Record<BudgetStatus, { label: string; variant: string }> = {
  within: { label: 'Within budget', variant: 'success' },
  approaching: { label: 'Approaching limit', variant: 'warning' },
  over: { label: 'Over budget', variant: 'danger' },
  no_budget: { label: 'No budget set', variant: 'secondary' },
};

// plural(1, 'expense') -> "1 expense", plural(3, 'expense') -> "3 expenses"
export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

// Day counts for a YYYY-MM month, used for "days left" and daily averages.
export function monthDays(month: string) {
  const [y, m] = month.split('-').map(Number);
  const total = new Date(y, m, 0).getDate();
  const current = thisMonth();
  const elapsed = month < current ? total : month > current ? 0 : new Date().getDate();
  return { total, elapsed, left: total - elapsed + (month === current ? 1 : 0), isCurrent: month === current };
}

