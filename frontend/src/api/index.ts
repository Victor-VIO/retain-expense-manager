import { request } from './client';
import type {
  AdminInsights,
  AuthResponse,
  BudgetSummary,
  Category,
  DashboardData,
  Expense,
  ExpenseInput,
  ExpenseListResponse,
  User,
} from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('POST', '/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('POST', '/auth/register', { name, email, password }),
  me: () => request<{ user: User }>('GET', '/auth/me'),
};

export const expenseApi = {
  list: (query: string) => request<ExpenseListResponse>('GET', `/expenses?${query}`),
  get: (id: number) => request<Expense>('GET', `/expenses/${id}`),
  create: (input: ExpenseInput) => request<Expense>('POST', '/expenses', input),
  update: (id: number, input: ExpenseInput) => request<Expense>('PUT', `/expenses/${id}`, input),
  remove: (id: number) => request<void>('DELETE', `/expenses/${id}`),
};

export const budgetApi = {
  list: () => request<BudgetSummary[]>('GET', '/budgets'),
  get: (month: string) => request<BudgetSummary>('GET', `/budgets/${month}`),
  save: (month: string, amount: number) => request<BudgetSummary>('PUT', `/budgets/${month}`, { amount }),
};

export const categoryApi = {
  list: () => request<Category[]>('GET', '/categories'),
  create: (name: string) => request<Category>('POST', '/categories', { name }),
  update: (id: number, name: string) => request<Category>('PUT', `/categories/${id}`, { name }),
  remove: (id: number) => request<{ message: string; movedExpenses: number }>('DELETE', `/categories/${id}`),
};

export const dashboardApi = {
  get: (month: string) => request<DashboardData>('GET', `/dashboard?month=${month}`),
};

export const adminApi = {
  insights: () => request<AdminInsights>('GET', '/admin/insights'),
};
