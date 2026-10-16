# Retain – Personal Expense & Budget Manager

Retain is a web app for recording day-to-day expenses, setting a monthly budget and seeing where the money actually goes. Admins can manage expense categories and see platform-wide numbers.

**Live app:** _coming soon – added after deployment_
**API:** _coming soon_

> Demo admin (created by the seed script): `admin@retain.app` / `Admin123!`. Anyone can sign up as a normal user.

---

## Features

**For every user**
- Sign up, sign in and sign out (JWT, session restored on refresh)
- Add, view, edit and delete expenses – title, amount, category, date, payment method and optional notes
- Expense list with search, category / payment method / date range / amount range filters, sorting by date or amount, and pagination
- Monthly budget: set or update a budget for any month and see total spent, what's left, and whether you're **within** (< 80%), **approaching** (80–100%) or **over** budget
- Dashboard for any month: total spent, remaining budget, highest expense, spending by category and recent expenses

**For admins**
- Create, rename and delete categories. Deleting a category moves its expenses to the built-in **Uncategorized** category, so no expense is lost (Uncategorized itself can't be renamed or deleted)
- Platform insights: registered users, expenses recorded, total value, expenses this month, spending per category, top 5 / bottom 5 categories by usage, recently added expenses and recently registered users

**Design & usability**
- Light and dark mode (follows your device setting, with a toggle; remembered per browser)
- Desktop sidebar; on phones and tablets a slide-out menu plus a bottom bar with a big **+** button for adding expenses
- Dashboard budget ring with "left to spend", days left, daily average and a **safe to spend per day** figure
- Spending by category as a split bar with a labelled row per category (each category keeps one colour and icon everywhere; colours checked for colour-blind safety in both themes)
- Expense form built for touch: amount first, tap-to-pick category and payment chips
- Expense list grouped by day (Today / Yesterday / date) when sorted by date
- Password show/hide and a strength meter on sign-up
- Tested at 320px, 360px, 375px, 390px, tablet (768–800px) and desktop widths
- Loading, empty and error states; form validation on both client and server

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, TypeScript, Vite, React Router, Redux Toolkit, React-Bootstrap, Bootstrap Icons |
| Backend | Node.js, Express 5 |
| Database | [Turso](https://turso.tech) (hosted libSQL / SQLite) via `@libsql/client` |
| Auth | bcrypt password hashing, JSON Web Tokens |

### How state is split

- **Authentication → React Context.** `src/context/AuthContext.tsx` holds the signed-in user and exposes `login`, `register`, `logout` and `isAdmin`. `ProtectedRoute` uses it to guard pages, and `<ProtectedRoute role="admin" />` guards the admin dashboard.
- **Light / dark theme → React Context** (`src/context/ThemeContext.tsx`), applied through Bootstrap's `data-bs-theme`.
- **Expense search / filter / sort / pagination → Redux.** `src/store/filtersSlice.ts` owns every filter value; `src/store/expensesSlice.ts` has a `fetchExpenses` thunk that reads the filters from the store and calls the API. Changing a filter resets the page to 1.

## Project structure

```
retain-expense-manager/
├── backend/
│   └── src/
│       ├── db/          # libSQL client + schema/seed script
│       ├── middleware/  # requireAuth, requireAdmin
│       ├── routes/      # auth, expenses, budgets, categories, dashboard, admin
│       ├── app.js       # Express app (CORS, routes, error handler)
│       └── server.js
└── frontend/
    └── src/
        ├── api/         # fetch client + typed endpoint functions
        ├── components/  # shared UI, layout/ (sidebar, bottom nav, auth layout), expenses/, admin/
        ├── context/     # AuthContext, ThemeContext
        ├── hooks/       # useApi, useCategories
        ├── pages/       # one file per route
        ├── store/       # Redux store, filters + expenses slices
        └── types.ts     # API data types
```

## Running it locally

You need Node.js 18+.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | What it is |
|----------|------------|
| `DATABASE_URL` | Turso URL (`libsql://...turso.io`). For quick local work, `file:local.db` also works |
| `DATABASE_AUTH_TOKEN` | Turso database token (leave empty for a local file) |
| `JWT_SECRET` | Any long random string |
| `CLIENT_URL` | Frontend origin(s) allowed by CORS, comma separated |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin account the seed script creates |
| `PORT` | Defaults to 5000 |

Then create the tables, seed categories + the admin, and start the API:

```bash
npm run db:setup
npm run dev        # or: npm start
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm run dev
```

Open http://localhost:5173.

## API reference

Base URL: `/api`. Everything except register, login and health needs an `Authorization: Bearer <token>` header. Errors come back as `{ "message": "..." }` with a matching status code (400 validation, 401 not signed in, 403 not admin, 404 not found / not yours, 409 duplicate).

### Auth
| Method | Endpoint | Body | Notes |
|--------|----------|------|-------|
| POST | `/auth/register` | `name, email, password` | Always creates a `user` role. Returns `{ token, user }` |
| POST | `/auth/login` | `email, password` | Returns `{ token, user }` |
| GET | `/auth/me` | – | Current user |

### Expenses (own data only)
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/expenses` | Query: `search`, `categoryId`, `paymentMethod`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `sortBy` (`date`\|`amount`), `order` (`asc`\|`desc`), `page`, `limit` (max 50). Returns `{ data, pagination, totalAmount }` |
| GET | `/expenses/:id` | |
| POST | `/expenses` | `title, amount, categoryId, date (YYYY-MM-DD), paymentMethod, notes?` |
| PUT | `/expenses/:id` | Same body as POST |
| DELETE | `/expenses/:id` | 204 on success |

Payment methods: `cash`, `debit_card`, `credit_card`, `bank_transfer`, `mobile_money`, `other`.

Another user's expense returns 404, so the API doesn't reveal that it exists.

### Budgets (own data only)
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/budgets` | Last 12 budgets with spending summaries |
| GET | `/budgets/:month` | `month` = `YYYY-MM`. Returns `{ month, amount, spent, remaining, percentUsed, status }` |
| PUT | `/budgets/:month` | `{ amount }` – creates or updates |

### Categories
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/categories` | Any signed-in user (admins also get usage counts) |
| POST | `/categories` | Admin – `{ name }` |
| PUT | `/categories/:id` | Admin – `{ name }` |
| DELETE | `/categories/:id` | Admin – moves expenses to Uncategorized, returns `{ movedExpenses }` |

### Dashboard & insights
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/dashboard?month=YYYY-MM` | Signed-in user – totals, budget, highest expense, spending by category, recent expenses |
| GET | `/admin/insights` | Admin only – platform-wide numbers listed under Features |

## Deployment

- **Database:** Turso (`retain` database)
- **Backend:** Render web service – root `backend`, build `npm install`, start `npm start`, env vars from the table above (`CLIENT_URL` = the Vercel URL). Run `npm run db:setup` once against the Turso database.
- **Frontend:** Vercel – root `frontend`, framework Vite, env `VITE_API_URL=https://<render-service>.onrender.com/api`. `vercel.json` rewrites all paths to `index.html` so refreshing a page like `/expenses/3` works.
