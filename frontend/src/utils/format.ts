import type { BudgetStatus, PaymentMethod } from '../types';

const currency = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' });

export const formatMoney = (value: number) => currency.format(value);

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
