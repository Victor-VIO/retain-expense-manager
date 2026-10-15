import { Router } from 'express';
import db from '../db/client.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { currentMonth, round2 } from '../utils.js';

const router = Router();
router.use(requireAuth, requireAdmin);

// GET /api/admin/insights – platform-wide numbers for the admin dashboard
router.get('/insights', async (req, res) => {
  const month = currentMonth();

  const [users, totals, thisMonth, perCategory, recentExpenses, recentUsers] = await Promise.all([
    db.execute('SELECT COUNT(*) AS n FROM users'),
    db.execute('SELECT COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total FROM expenses'),
    db.execute({ sql: 'SELECT COUNT(*) AS n FROM expenses WHERE substr(date, 1, 7) = ?', args: [month] }),
    // Includes categories with no expenses so "least used" is meaningful.
    db.execute(`
      SELECT c.id, c.name, COUNT(e.id) AS count, COALESCE(SUM(e.amount), 0) AS total
      FROM categories c LEFT JOIN expenses e ON e.category_id = c.id
      GROUP BY c.id`),
    db.execute(`
      SELECT e.id, e.title, e.amount, e.date, e.created_at, c.name AS category_name, u.name AS user_name
      FROM expenses e
      JOIN categories c ON c.id = e.category_id
      JOIN users u ON u.id = e.user_id
      ORDER BY e.created_at DESC, e.id DESC LIMIT 5`),
    db.execute('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC, id DESC LIMIT 5'),
  ]);

  const categories = perCategory.rows.map((r) => ({
    categoryId: Number(r.id),
    name: r.name,
    count: Number(r.count),
    total: round2(r.total),
  }));
  const byUsage = [...categories].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  res.json({
    totalUsers: Number(users.rows[0].n),
    totalExpenses: Number(totals.rows[0].n),
    totalExpenseValue: round2(totals.rows[0].total),
    expensesThisMonth: Number(thisMonth.rows[0].n),
    spendingPerCategory: [...categories].sort((a, b) => b.total - a.total),
    topCategories: byUsage.slice(0, 5),
    bottomCategories: [...byUsage].reverse().slice(0, 5),
    recentExpenses: recentExpenses.rows.map((r) => ({
      id: Number(r.id),
      title: r.title,
      amount: Number(r.amount),
      date: r.date,
      categoryName: r.category_name,
      userName: r.user_name,
      createdAt: r.created_at,
    })),
    recentUsers: recentUsers.rows.map((r) => ({
      id: Number(r.id),
      name: r.name,
      email: r.email,
      role: r.role,
      createdAt: r.created_at,
    })),
  });
});

export default router;
