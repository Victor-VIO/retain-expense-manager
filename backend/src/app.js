import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import budgetRoutes from './routes/budgets.js';
import categoryRoutes from './routes/categories.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Express 5 forwards errors from async handlers here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

export default app;
