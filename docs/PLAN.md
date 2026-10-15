# Retain – build plan & checklist

Working notes for building the project. Each step ends with a commit.

## Stack

| Part      | Choice                                                                |
|-----------|-----------------------------------------------------------------------|
| Frontend  | React + TypeScript + Vite, React Router, Redux Toolkit, React-Bootstrap |
| Auth (FE) | React Context (`AuthContext`) + `ProtectedRoute` / `AdminRoute`        |
| Filters   | Redux slice (`filtersSlice`) + thunk that fetches expenses             |
| Backend   | Node.js + Express (JavaScript)                                         |
| Database  | Turso (libSQL / SQLite) via `@libsql/client`; local `file:` DB for dev |
| Auth (BE) | bcrypt password hashes + JWT, `requireAuth` / `requireAdmin` middleware |
| Deploy    | Backend on Render, frontend on Vercel (last step, done with Victor)    |

## Data model

- `users` – id, name, email (unique), password_hash, role (`user`/`admin`), created_at
- `categories` – id, name (unique), is_default (the "Uncategorized" row), created_at
- `expenses` – id, user_id, category_id, title, amount, date, payment_method, notes, created_at, updated_at
- `budgets` – id, user_id, month (`YYYY-MM`), amount — unique per user + month

Deleting a category moves its expenses to "Uncategorized". The default category can't be deleted or renamed.

Budget status: **within** (< 80% used), **approaching** (80–100%), **over** (> 100%).

## Steps

1. [x] Plan + checklist (this file)
2. [ ] Backend setup: Express app, DB connection, schema, seed (admin + categories)
3. [ ] Backend auth: register, login, me, JWT middleware, admin middleware
4. [ ] Backend expenses: CRUD + search/filter/sort/pagination, owner checks
5. [ ] Backend budgets, categories (admin CRUD), dashboard + admin insights
6. [ ] Backend tested end-to-end with a script (incl. auth/ownership failures)
7. [ ] Frontend setup: Vite TS, Bootstrap, router, shared types, API client
8. [ ] AuthContext, login/register pages, protected + admin routes, navbar
9. [ ] Redux store: filters slice + expenses thunk
10. [ ] Expenses: list, filters bar, pagination, detail, create/edit form, delete
11. [ ] Budget page + user dashboard
12. [ ] Admin dashboard: category management + platform insights
13. [ ] Connect backend to Turso, run schema + seed there
14. [ ] Full manual test in the browser (desktop + mobile width)
15. [ ] README: features, setup, tech, API reference, live URL placeholder
16. [ ] **STOP – deployment** (Render + Vercel, with Victor)

## Requirement checklist (cross-check before deploy)

### Frontend
- [ ] Components: expense list, expense detail, expense form, budget info, filters
- [ ] Expense fields: title, amount, category, date, payment method, optional notes
- [ ] Create / view / update / delete own expenses
- [ ] Set/update monthly budget; shows total spent, remaining, within/approaching/over
- [ ] Search, category filter, payment method filter, date filter, amount filter
- [ ] Sort by date or amount (asc/desc)
- [ ] Pagination on the expense list
- [ ] User dashboard: month total, remaining budget, highest expense, spending by category, recent expenses
- [ ] Auth with React Context only: sign up, sign in, sign out, roles, protected routes
- [ ] Filtering/search/sort state lives in Redux only
- [ ] Admin dashboard only for admins, guarded through Context
- [ ] Admin: create/update/delete categories (deleted category → Uncategorized)
- [ ] Admin insights: total users, total expenses, total value, expenses this month, spend per category, top 5 / bottom 5 categories, recent expenses, recent users
- [ ] TypeScript types for API data, props, Redux state, context – no `any`
- [ ] Responsive layout (checked at phone width)
- [ ] UI library used (React-Bootstrap)
- [ ] Loading + error states, form validation

### Backend
- [ ] RESTful Express API with CRUD
- [ ] Database stores users, expenses, budgets, categories (Turso)
- [ ] Endpoints: expenses, budgets, categories, filtering, dashboard, admin insights
- [ ] Passwords hashed, JWT auth
- [ ] Users can only read/change their own expenses and budgets
- [ ] Admin-only endpoints return 403 for normal users
- [ ] Validation + sensible status codes / error messages

### Project
- [ ] Incremental, descriptive git commits
- [ ] README: live URL, setup, technologies, features, API info
- [ ] Deployed and publicly reachable (final step)
