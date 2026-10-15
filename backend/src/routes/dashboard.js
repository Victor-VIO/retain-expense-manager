import { Router } from 'express';
import db from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, currentMonth, isMonth, round2, toExpense } from '../utils.js';
import { getBudgetSummary } from './budgets.js';

const router = Router();
router.use(requireAuth);

// GET /api/dashboard?month=YYYY-MM – summary of the signed-in user's spending for a month
router.get('/', async (req, res) => {
  const month = req.query.month || currentMonth();
  if (!isMonth(month)) throw new HttpError(400, 'Month must be in YYYY-MM format');
  const userId = req.user.id;
  const inMonth = 'e.user_id = ? AND substr(e.date, 1, 7) = ?';

  const [budget, highest, byCategory, recent, count] = await Promise.all([
    getBudgetSummary(userId, month),
    db.execute({
      sql: `SELECT e.*, c.name AS category_name FROM expenses e JOIN categories c ON c.id = e.category_id
            WHERE ${inMonth} ORDER BY e.amount DESC LIMIT 1`,
      args: [userId, month],
    }),
    db.execute({
      sql: `SELECT c.id, c.name, SUM(e.amount) AS total, COUNT(e.id) AS count
            FROM expenses e JOIN categories c ON c.id = e.category_id
            WHERE ${inMonth} GROUP BY c.id ORDER BY total DESC`,
      args: [userId, month],
    }),
    db.execute({
      sql: `SELECT e.*, c.name AS category_name FROM expenses e JOIN categories c ON c.id = e.category_id
            WHERE e.user_id = ? ORDER BY e.date DESC, e.id DESC LIMIT 5`,
      args: [userId],
    }),
    db.execute({ sql: `SELECT COUNT(*) AS n FROM expenses e WHERE ${inMonth}`, args: [userId, month] }),
  ]);

  res.json({
    month,
    totalSpent: budget.spent,
    expenseCount: Number(count.rows[0].n),
    budget,
    highestExpense: highest.rows.length ? toExpense(highest.rows[0]) : null,
    spendingByCategory: byCategory.rows.map((r) => ({
      categoryId: Number(r.id),
      name: r.name,
      total: round2(r.total),
      count: Number(r.count),
    })),
    recentExpenses: recent.rows.map(toExpense),
  });
});

export default router;
