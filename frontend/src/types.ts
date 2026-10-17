// Shapes of the data the API sends and receives.

export type Role = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const PAYMENT_METHODS = [
  'cash',
  'debit_card',
  'credit_card',
  'bank_transfer',
  'mobile_money',
  'other',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Category {
  id: number;
  name: string;
  isDefault: boolean;
  expenseCount?: number; // only sent to admins
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes: string;
  category: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  categoryId: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExpenseListResponse {
  data: Expense[];
  pagination: Pagination;
  totalAmount: number;
}

export type BudgetStatus = 'within' | 'approaching' | 'over' | 'no_budget';

export interface BudgetSummary {
  month: string; // YYYY-MM
  amount: number | null;
  spent: number;
  remaining: number | null;
  percentUsed: number | null;
  status: BudgetStatus;
}

export interface CategoryTotal {
  categoryId: number;
  name: string;
  total: number;
  count: number;
}

export interface DashboardData {
  month: string;
  totalSpent: number;
  expenseCount: number;
  budget: BudgetSummary;
  highestExpense: Expense | null;
  spendingByCategory: CategoryTotal[];
  recentExpenses: Expense[];
  dailySpending: { date: string; total: number }[];
  previousMonth: { month: string; totalSpent: number };
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  expensesThisMonth: number;
  spendingPerCategory: CategoryTotal[];
  topCategories: CategoryTotal[];
  bottomCategories: CategoryTotal[];
  recentExpenses: {
    id: number;
    title: string;
    amount: number;
    date: string;
    categoryName: string;
    userName: string;
    createdAt: string;
  }[];
  recentUsers: User[];
}
