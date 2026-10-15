import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { expenseApi } from '../api';
import { getErrorMessage } from '../api/client';
import type { Expense, Pagination } from '../types';
import { toQueryString } from './filtersSlice';
import type { RootState } from './index';

interface ExpensesState {
  items: Expense[];
  pagination: Pagination;
  totalAmount: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ExpensesState = {
  items: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  totalAmount: 0,
  status: 'idle',
  error: null,
};

// Loads the current page of expenses using whatever filters are in the store.
export const fetchExpenses = createAsyncThunk<
  Awaited<ReturnType<typeof expenseApi.list>>,
  void,
  { state: RootState; rejectValue: string }
>('expenses/fetch', async (_, { getState, rejectWithValue }) => {
  try {
    return await expenseApi.list(toQueryString(getState().filters));
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearExpenses() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Could not load expenses';
      });
  },
});

export const { clearExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;
