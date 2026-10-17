import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

interface Props {
  /** When set, only users with this role can see the nested routes. */
  role?: 'admin';
}

// Wraps routes that need a signed-in user (and optionally the admin role).
export default function ProtectedRoute({ role }: Props) {
  const { user, isLoading, signedOut } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader text="Checking your session..." />;
  // Remember where they were heading – unless they just signed out themselves.
  if (!user) return <Navigate to="/login" replace state={signedOut ? undefined : { from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to="/" replace state={{ denied: true }} />;

  return <Outlet />;
}

// Login / register pages: send signed-in users back where they were heading (or the dashboard).
export function GuestRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  if (isLoading) return <Loader />;
  return user ? <Navigate to={from} replace /> : <Outlet />;
}
