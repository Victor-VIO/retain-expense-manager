import { Router } from 'express';
import db from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, budgetStatus, isMonth, round2 } from '../utils.js';

const router = Router();
router.use(requireAuth);

// Budget for a month plus how much has been spent against it.
export async function getBudgetSummary(userId, month) {
  const [budget, spent] = await Promise.all([
    db.execute({ sql: 'SELECT amount FROM budgets WHERE user_id = ? AND month = ?', args: [userId, month] }),
    db.execute({
      sql: `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = ? AND substr(date, 1, 7) = ?`,
      args: [userId, month],
    }),
  ]);
  const amount = budget.rows.length ? Number(budget.rows[0].amount) : null;
  const totalSpent = round2(spent.rows[0].total);
  return {
    month,
    amount,
    spent: totalSpent,
    remaining: amount === null ? null : round2(amount - totalSpent),
    percentUsed: amount ? Math.round((totalSpent / amount) * 100) : null,
    status: budgetStatus(totalSpent, amount),
  };
}

// GET /api/budgets – all budgets the user has set, newest month first
router.get('/', async (req, res) => {
  const result = await db.execute({
    sql: 'SELECT month FROM budgets WHERE user_id = ? ORDER BY month DESC LIMIT 12',
    args: [req.user.id],
  });
  const summaries = await Promise.all(result.rows.map((r) => getBudgetSummary(req.user.id, r.month)));
  res.json(summaries);
});

// GET /api/budgets/:month (YYYY-MM)
router.get('/:month', async (req, res) => {
  if (!isMonth(req.params.month)) throw new HttpError(400, 'Month must be in YYYY-MM format');
  res.json(await getBudgetSummary(req.user.id, req.params.month));
});

// PUT /api/budgets/:month – create or update the budget for that month
router.put('/:month', async (req, res) => {
  const { month } = req.params;
  const amount = Number(req.body?.amount);
  if (!isMonth(month)) throw new HttpError(400, 'Month must be in YYYY-MM format');
  if (!Number.isFinite(amount) || amount <= 0) throw new HttpError(400, 'Budget must be a number greater than 0');

  await db.execute({
    sql: `INSERT INTO budgets (user_id, month, amount) VALUES (?, ?, ?)
          ON CONFLICT (user_id, month) DO UPDATE SET amount = excluded.amount, updated_at = datetime('now')`,
    args: [req.user.id, month, round2(amount)],
  });
  res.json(await getBudgetSummary(req.user.id, month));
});

export default router;
