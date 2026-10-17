import { expenseApi } from '../api';
import { toQueryString, type FiltersState } from '../store/filtersSlice';
import type { Expense } from '../types';
import { paymentLabels, today } from './format';

// Wrap a value for CSV: quotes around everything, inner quotes doubled.
const cell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

// Downloads every expense matching the current filters (all pages) as a CSV file.
export async function exportExpensesCsv(filters: FiltersState) {
  const rows: Expense[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await expenseApi.list(toQueryString({ ...filters, page, limit: 50 }));
    rows.push(...res.data);
    totalPages = res.pagination.totalPages;
    page++;
  } while (page <= totalPages);

  const header = ['Date', 'Title', 'Category', 'Paid with', 'Amount (RWF)', 'Notes'];
  const lines = rows.map((e) =>
    [e.date, e.title, e.category.name, paymentLabels[e.paymentMethod], e.amount, e.notes].map(cell).join(','),
  );
  // BOM so Excel opens it as UTF-8
  const blob = new Blob(['﻿' + [header.map(cell).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `retain-expenses-${today()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return rows.length;
}
