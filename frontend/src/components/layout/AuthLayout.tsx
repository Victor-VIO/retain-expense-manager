import type { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Brand from './Brand';

const FEATURES = [
  { icon: 'receipt', short: 'Quick logging', title: 'Log spending in seconds', text: 'Amount, category, done. Find anything later with search and filters.' },
  { icon: 'wallet2', short: 'Monthly budget', title: 'Set a monthly budget', text: 'See what you have left and how much is safe to spend each day.' },
  { icon: 'pie-chart', short: 'Spending insights', title: 'See where it goes', text: 'Spending by category, your biggest costs and recent activity at a glance.' },
];

// Two-column layout for sign in / sign up: brand story on the left (desktop), form on the right.
export default function AuthLayout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-page">
      <section className="auth-brand" aria-hidden>
        <div className="brand" style={{ color: '#fff' }}>
          <span className="brand-mark">
            <i className="bi bi-piggy-bank-fill" />
          </span>
          Retain
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="mb-4">Know where every naira goes.</h2>
          {FEATURES.map((f) => (
            <div className="auth-feature" key={f.title}>
              <span className="icon-chip">
                <i className={`bi bi-${f.icon}`} />
              </span>
              <div>
                <div className="fw-bold">{f.title}</div>
                <div className="small" style={{ opacity: 0.8 }}>
                  {f.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="auth-preview">
          <div className="d-flex justify-content-between small mb-1" style={{ opacity: 0.85 }}>
            <span>October budget</span>
            <span>62% used</span>
          </div>
          <div className="fs-3 fw-bold mb-2">₦114,000 left</div>
          <div className="bar">
            <span />
          </div>
          <div className="small mt-2" style={{ opacity: 0.8 }}>
            <i className="bi bi-check-circle-fill me-1" />
            On track · ₦8,140 safe to spend per day
          </div>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form">
          <div className="auth-topline">
            <Brand />
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
              <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon-stars'}`} aria-hidden />
            </button>
          </div>

          {/* Phones / tablets: short version of the brand panel */}
          <div className="auth-mobile-hero d-lg-none">
            <div className="fw-bold fs-5 mb-2">Know where every naira goes.</div>
            <div className="d-flex flex-wrap gap-2 small">
              {FEATURES.map((f) => (
                <span key={f.title} className="d-inline-flex align-items-center gap-1">
                  <i className={`bi bi-${f.icon}`} aria-hidden />
                  {f.short}
                </span>
              ))}
            </div>
          </div>

          {children}
        </div>
      </section>
    </div>
  );
}
