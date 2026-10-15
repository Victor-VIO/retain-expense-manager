import { Router } from 'express';
import db from '../db/client.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError, PAYMENT_METHODS, isDate, toExpense } from '../utils.js';

const router = Router();
router.use(requireAuth);

const SELECT_EXPENSE = `
  SELECT e.*, c.name AS category_name
  FROM expenses e JOIN categories c ON c.id = e.category_id`;

// Validates the body for create/update and returns clean values.
async function readExpenseBody(body = {}) {
  const title = body.title?.trim();
  const amount = Number(body.amount);
  const categoryId = Number(body.categoryId);
  const { date, paymentMethod } = body;
  const notes = body.notes?.trim() || null;

  if (!title) throw new HttpError(400, 'Title is required');
  if (title.length > 120) throw new HttpError(400, 'Title must be 120 characters or less');
  if (!Number.isFinite(amount) || amount <= 0) throw new HttpError(400, 'Amount must be a number greater than 0');
  if (!isDate(date)) throw new HttpError(400, 'Date must be in YYYY-MM-DD format');
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw new HttpError(400, 'Invalid payment method');

  const category = await db.execute({ sql: 'SELECT id FROM categories WHERE id = ?', args: [categoryId] });
  if (!category.rows.length) throw new HttpError(400, 'Selected category does not exist');

  return { title, amount: Math.round(amount * 100) / 100, categoryId, date, paymentMethod, notes };
}

// Loads an expense only if it belongs to the signed-in user.
async function findOwnExpense(id, userId) {
  const result = await db.execute({
    sql: `${SELECT_EXPENSE} WHERE e.id = ? AND e.user_id = ?`,
    args: [Number(id), userId],
  });
  if (!result.rows.length) throw new HttpError(404, 'Expense not found');
  return result.rows[0];
}

// GET /api/expenses
// Query: search, categoryId, paymentMethod, startDate, endDate, minAmount, maxAmount,
//        sortBy (date|amount), order (asc|desc), page, limit
router.get('/', async (req, res) => {
  const q = req.query;
  const where = ['e.user_id = ?'];
  const args = [req.user.id];

  if (q.search) {
    where.push('(e.title LIKE ? OR e.notes LIKE ?)');
    args.push(`%${q.search}%`, `%${q.search}%`);
  }
  if (q.categoryId) {
    where.push('e.category_id = ?');
    args.push(Number(q.categoryId));
  }
  if (q.paymentMethod) {
    where.push('e.payment_method = ?');
    args.push(q.paymentMethod);
  }
  if (isDate(q.startDate)) {
    where.push('e.date >= ?');
    args.push(q.startDate);
  }
  if (isDate(q.endDate)) {
    where.push('e.date <= ?');
    args.push(q.endDate);
  }
  if (q.minAmount && Number.isFinite(Number(q.minAmount))) {
    where.push('e.amount >= ?');
    args.push(Number(q.minAmount));
  }
  if (q.maxAmount && Number.isFinite(Number(q.maxAmount))) {
    where.push('e.amount <= ?');
    args.push(Number(q.maxAmount));
  }

  const sortColumn = q.sortBy === 'amount' ? 'e.amount' : 'e.date';
  const order = q.order === 'asc' ? 'ASC' : 'DESC';
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 10, 1), 50);
  const page = Math.max(parseInt(q.page, 10) || 1, 1);
  const whereSql = where.join(' AND ');

  const [rows, count] = await Promise.all([
    db.execute({
      sql: `${SELECT_EXPENSE} WHERE ${whereSql} ORDER BY ${sortColumn} ${order}, e.id ${order} LIMIT ? OFFSET ?`,
      args: [...args, limit, (page - 1) * limit],
    }),
    db.execute({
      sql: `SELECT COUNT(*) AS total, COALESCE(SUM(e.amount), 0) AS sum FROM expenses e WHERE ${whereSql}`,
      args,
    }),
  ]);

  const total = Number(count.rows[0].total);
  res.json({
    data: rows.rows.map(toExpense),
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    totalAmount: Number(count.rows[0].sum),
  });
});

// GET /api/expenses/:id
router.get('/:id', async (req, res) => {
  const row = await findOwnExpense(req.params.id, req.user.id);
  res.json(toExpense(row));
});

// POST /api/expenses
router.post('/', async (req, res) => {
  const e = await readExpenseBody(req.body);
  const result = await db.execute({
    sql: `INSERT INTO expenses (user_id, category_id, title, amount, date, payment_method, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    args: [req.user.id, e.categoryId, e.title, e.amount, e.date, e.paymentMethod, e.notes],
  });
  const row = await findOwnExpense(result.rows[0].id, req.user.id);
  res.status(201).json(toExpense(row));
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  await findOwnExpense(req.params.id, req.user.id);
  const e = await readExpenseBody(req.body);
  await db.execute({
    sql: `UPDATE expenses SET category_id = ?, title = ?, amount = ?, date = ?, payment_method = ?,
          notes = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
    args: [e.categoryId, e.title, e.amount, e.date, e.paymentMethod, e.notes, Number(req.params.id), req.user.id],
  });
  const row = await findOwnExpense(req.params.id, req.user.id);
  res.json(toExpense(row));
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  await findOwnExpense(req.params.id, req.user.id);
  await db.execute({
    sql: 'DELETE FROM expenses WHERE id = ? AND user_id = ?',
    args: [Number(req.params.id), req.user.id],
  });
  res.status(204).end();
});

export default router;
