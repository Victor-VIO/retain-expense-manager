import { useEffect } from 'react';

// Sets the browser tab title, e.g. "Expenses · Retain".
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Retain` : 'Retain – Expense & Budget Manager';
  }, [title]);
}
