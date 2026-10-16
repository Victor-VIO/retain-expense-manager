import { useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Brand from './Brand';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'grid-1x2', end: true },
  { to: '/expenses', label: 'Expenses', icon: 'receipt' },
  { to: '/expenses/new', label: 'Add expense', icon: 'plus-circle', end: true },
  { to: '/budget', label: 'Budget', icon: 'wallet2' },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Sidebar contents – shown fixed on desktop and inside the slide-out menu on phones/tablets.
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // "Expenses" stays highlighted on an expense's detail/edit page, but not on "Add expense".
  const isActive = (to: string, end?: boolean) =>
    to === '/expenses' ? pathname.startsWith('/expenses') && pathname !== '/expenses/new' : end ? pathname === to : pathname.startsWith(to);

  const handleLogout = () => {
    onNavigate?.();
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar-panel">
      <div className="px-2 mb-2">
        <Brand onClick={onNavigate} />
      </div>

      <div className="sidebar-section">Menu</div>
      <nav>
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`sidebar-link ${isActive(item.to, item.end) ? 'active' : ''}`}
            aria-current={isActive(item.to, item.end) ? 'page' : undefined}
            onClick={onNavigate}
          >
            <i className={`bi bi-${item.icon}`} aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>

      {isAdmin && (
        <>
          <div className="sidebar-section">Admin</div>
          <NavLink to="/admin" className="sidebar-link" onClick={onNavigate}>
            <i className="bi bi-shield-check" aria-hidden />
            Admin dashboard
          </NavLink>
        </>
      )}

      <div className="sidebar-user mt-auto">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="avatar">{initials(user?.name ?? '?')}</div>
          <div className="text-truncate">
            <div className="fw-semibold text-truncate">{user?.name}</div>
            <div className="small text-truncate" style={{ color: 'var(--sidebar-text)' }}>
              {isAdmin ? 'Administrator' : user?.email}
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button type="button" className="sidebar-btn flex-fill" onClick={toggleTheme}>
            <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon-stars'} me-1`} aria-hidden />
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <button type="button" className="sidebar-btn flex-fill" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1" aria-hidden />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// Fixed bar at the bottom of the screen on phones and tablets.
function BottomNav({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation();
  const onExpenses = pathname.startsWith('/expenses') && pathname !== '/expenses/new';
  return (
    <nav className="bottom-nav d-lg-none" aria-label="Main">
      <NavLink to="/" end>
        <i className="bi bi-grid-1x2" aria-hidden />
        Home
      </NavLink>
      <Link to="/expenses" className={onExpenses ? 'active' : ''} aria-current={onExpenses ? 'page' : undefined}>
        <i className="bi bi-receipt" aria-hidden />
        Expenses
      </Link>
      <Link to="/expenses/new" aria-label="Add expense">
        <span className="fab">
          <i className="bi bi-plus-lg" aria-hidden />
        </span>
      </Link>
      <NavLink to="/budget">
        <i className="bi bi-wallet2" aria-hidden />
        Budget
      </NavLink>
      <button type="button" onClick={onMenu}>
        <i className="bi bi-list" aria-hidden />
        More
      </button>
    </nav>
  );
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const close = () => setMenuOpen(false);

  return (
    <>
      <aside className="app-sidebar d-none d-lg-block">
        <SidebarContent />
      </aside>

      <header className="mobile-topbar d-lg-none">
        <button type="button" className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <i className="bi bi-list" aria-hidden />
        </button>
        <Brand />
        <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
          <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon-stars'}`} aria-hidden />
        </button>
      </header>

      <Offcanvas show={menuOpen} onHide={close} className="sidebar-offcanvas d-lg-none" aria-label="Menu">
        <Offcanvas.Body>
          <SidebarContent onNavigate={close} />
        </Offcanvas.Body>
      </Offcanvas>

      <main className="app-main">
        <div className="app-content">
          <Outlet />
        </div>
      </main>

      <BottomNav onMenu={() => setMenuOpen(true)} />
    </>
  );
}
