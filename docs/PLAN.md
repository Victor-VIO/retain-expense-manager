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
2. [x] Backend setup: Express app, DB connection, schema, seed (admin + categories)
3. [x] Backend auth: register, login, me, JWT middleware, admin middleware
4. [x] Backend expenses: CRUD + search/filter/sort/pagination, owner checks
5. [x] Backend budgets, categories (admin CRUD), dashboard + admin insights
6. [x] Backend tested end-to-end with a script (incl. auth/ownership failures)
7. [x] Frontend setup: Vite TS, Bootstrap, router, shared types, API client
8. [x] AuthContext, login/register pages, protected + admin routes, navbar
9. [x] Redux store: filters slice + expenses thunk
10. [x] Expenses: list, filters bar, pagination, detail, create/edit form, delete
11. [x] Budget page + user dashboard
12. [x] Admin dashboard: category management + platform insights
13. [ ] Connect backend to Turso, run schema + seed there (DB `retain` + token created; waiting on token in `backend/.env`)
14. [x] Full manual test in the browser (desktop + mobile width)
15. [x] README: features, setup, tech, API reference, live URL placeholder
16. [ ] **STOP – deployment** (Render + Vercel, with Victor)

## Requirement checklist (cross-check before deploy)

### Frontend
- [x] Components: expense list, expense detail, expense form, budget info, filters
- [x] Expense fields: title, amount, category, date, payment method, optional notes
- [x] Create / view / update / delete own expenses
- [x] Set/update monthly budget; shows total spent, remaining, within/approaching/over
- [x] Search, category filter, payment method filter, date filter, amount filter
- [x] Sort by date or amount (asc/desc)
- [x] Pagination on the expense list
- [x] User dashboard: month total, remaining budget, highest expense, spending by category, recent expenses
- [x] Auth with React Context only: sign up, sign in, sign out, roles, protected routes
- [x] Filtering/search/sort state lives in Redux only
- [x] Admin dashboard only for admins, guarded through Context
- [x] Admin: create/update/delete categories (deleted category → Uncategorized)
- [x] Admin insights: total users, total expenses, total value, expenses this month, spend per category, top 5 / bottom 5 categories, recent expenses, recent users
- [x] TypeScript types for API data, props, Redux state, context – no `any`
- [x] Responsive layout (checked at phone width)
- [x] UI library used (React-Bootstrap)
- [x] Loading + error states, form validation

### Backend
- [x] RESTful Express API with CRUD
- [x] Database stores users, expenses, budgets, categories (Turso)
- [x] Endpoints: expenses, budgets, categories, filtering, dashboard, admin insights
- [x] Passwords hashed, JWT auth
- [x] Users can only read/change their own expenses and budgets
- [x] Admin-only endpoints return 403 for normal users
- [x] Validation + sensible status codes / error messages

### Project
- [x] Incremental, descriptive git commits
- [x] README: setup, technologies, features, API info
- [ ] README: live URL (after deploy)
- [ ] Deployed and publicly reachable (final step)

## Test log

- Backend: 51/51 scripted API checks pass – auth errors, ownership (user B gets 404 on user A's expense), admin 403s, every filter, sort, pagination, budget status thresholds, category delete → Uncategorized.
- Browser (localhost): sign up, form validation, create/edit/delete expense, budget set (94% → "approaching"), dashboard figures, search, category/payment/amount filters, sort, page 2, clear filters, non-admin redirected from /admin, wrong password error, sign out, admin login, category add/rename/delete, all admin insight panels.
- Phone width (390px): admin, expense form and dashboard – no horizontal scroll, navbar collapses.
- `tsc -b` strict build and `vite build` pass; no console errors.
