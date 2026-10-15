import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PaymentMethod } from '../types';

// All search / filter / sort / page state for the expense list lives here.
export interface FiltersState {
  search: string;
  categoryId: number | null;
  paymentMethod: PaymentMethod | null;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: 'date' | 'amount';
  order: 'asc' | 'desc';
  page: number;
  limit: number;
}

export const initialFilters: FiltersState = {
  search: '',
  categoryId: null,
  paymentMethod: null,
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'date',
  order: 'desc',
  page: 1,
  limit: 10,
};

// Changing any filter takes the user back to page 1.
const filtersSlice = createSlice({
  name: 'filters',
  initialState: initialFilters,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setCategory(state, action: PayloadAction<number | null>) {
      state.categoryId = action.payload;
      state.page = 1;
    },
    setPaymentMethod(state, action: PayloadAction<PaymentMethod | null>) {
      state.paymentMethod = action.payload;
      state.page = 1;
    },
    setDateRange(state, action: PayloadAction<{ startDate?: string; endDate?: string }>) {
      if (action.payload.startDate !== undefined) state.startDate = action.payload.startDate;
      if (action.payload.endDate !== undefined) state.endDate = action.payload.endDate;
      state.page = 1;
    },
    setAmountRange(state, action: PayloadAction<{ minAmount?: string; maxAmount?: string }>) {
      if (action.payload.minAmount !== undefined) state.minAmount = action.payload.minAmount;
      if (action.payload.maxAmount !== undefined) state.maxAmount = action.payload.maxAmount;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<{ sortBy: FiltersState['sortBy']; order: FiltersState['order'] }>) {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    resetFilters() {
      return initialFilters;
    },
  },
});

export const {
  setSearch,
  setCategory,
  setPaymentMethod,
  setDateRange,
  setAmountRange,
  setSort,
  setPage,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

// Turns the filter state into the API query string.
export function toQueryString(f: FiltersState): string {
  const params = new URLSearchParams();
  if (f.search.trim()) params.set('search', f.search.trim());
  if (f.categoryId) params.set('categoryId', String(f.categoryId));
  if (f.paymentMethod) params.set('paymentMethod', f.paymentMethod);
  if (f.startDate) params.set('startDate', f.startDate);
  if (f.endDate) params.set('endDate', f.endDate);
  if (f.minAmount) params.set('minAmount', f.minAmount);
  if (f.maxAmount) params.set('maxAmount', f.maxAmount);
  params.set('sortBy', f.sortBy);
  params.set('order', f.order);
  params.set('page', String(f.page));
  params.set('limit', String(f.limit));
  return params.toString();
}

// True when the user has narrowed the list in any way.
export const hasActiveFilters = (f: FiltersState) =>
  Boolean(f.search || f.categoryId || f.paymentMethod || f.startDate || f.endDate || f.minAmount || f.maxAmount);
