import { Router } from 'express';
import db from '../db/client.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { HttpError } from '../utils.js';

const router = Router();
router.use(requireAuth);

const toCategory = (row) => ({
  id: Number(row.id),
  name: row.name,
  isDefault: Boolean(row.is_default),
  expenseCount: Number(row.expense_count ?? 0),
});

async function findCategory(id) {
  const result = await db.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [Number(id)] });
  if (!result.rows.length) throw new HttpError(404, 'Category not found');
  return result.rows[0];
}

function readName(body) {
  const name = body?.name?.trim();
  if (!name) throw new HttpError(400, 'Category name is required');
  if (name.length > 40) throw new HttpError(400, 'Category name must be 40 characters or less');
  return name;
}

async function assertNameFree(name, exceptId = 0) {
  const result = await db.execute({
    sql: 'SELECT id FROM categories WHERE name = ? COLLATE NOCASE AND id != ?',
    args: [name, exceptId],
  });
  if (result.rows.length) throw new HttpError(409, 'A category with this name already exists');
}

// GET /api/categories – any signed-in user (needed for the expense form and filters)
router.get('/', async (req, res) => {
  const result = await db.execute(`
    SELECT c.*, COUNT(e.id) AS expense_count
    FROM categories c LEFT JOIN expenses e ON e.category_id = c.id
    GROUP BY c.id ORDER BY c.is_default DESC, c.name`);
  const isAdmin = req.user.role === 'admin';
  // Usage counts are platform-wide, so only admins get them.
  res.json(result.rows.map((row) => (isAdmin ? toCategory(row) : { ...toCategory(row), expenseCount: undefined })));
});

// POST /api/categories – admin only
router.post('/', requireAdmin, async (req, res) => {
  const name = readName(req.body);
  await assertNameFree(name);
  const result = await db.execute({ sql: 'INSERT INTO categories (name) VALUES (?) RETURNING *', args: [name] });
  res.status(201).json(toCategory(result.rows[0]));
});

// PUT /api/categories/:id – admin only
router.put('/:id', requireAdmin, async (req, res) => {
  const category = await findCategory(req.params.id);
  if (category.is_default) throw new HttpError(400, 'The default category cannot be renamed');
  const name = readName(req.body);
  await assertNameFree(name, Number(category.id));
  const result = await db.execute({
    sql: 'UPDATE categories SET name = ? WHERE id = ? RETURNING *',
    args: [name, Number(category.id)],
  });
  res.json(toCategory(result.rows[0]));
});

// DELETE /api/categories/:id – admin only.
// Expenses in the deleted category are moved to the default "Uncategorized" category.
router.delete('/:id', requireAdmin, async (req, res) => {
  const category = await findCategory(req.params.id);
  if (category.is_default) throw new HttpError(400, 'The default category cannot be deleted');

  const fallback = await db.execute('SELECT id FROM categories WHERE is_default = 1 LIMIT 1');
  if (!fallback.rows.length) throw new HttpError(500, 'Default category is missing');

  const results = await db.batch(
    [
      {
        sql: 'UPDATE expenses SET category_id = ?, updated_at = datetime(\'now\') WHERE category_id = ?',
        args: [Number(fallback.rows[0].id), Number(category.id)],
      },
      { sql: 'DELETE FROM categories WHERE id = ?', args: [Number(category.id)] },
    ],
    'write',
  );
  res.json({ message: 'Category deleted', movedExpenses: results[0].rowsAffected });
});

export default router;
