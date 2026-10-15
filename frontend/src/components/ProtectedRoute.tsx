import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

interface Props {
  /** When set, only users with this role can see the nested routes. */
  role?: 'admin';
}

// Wraps routes that need a signed-in user (and optionally the admin role).
export default function ProtectedRoute({ role }: Props) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Loader text="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to="/" replace state={{ denied: true }} />;

  return <Outlet />;
}

// Login / register pages: send signed-in users to the dashboard.
export function GuestRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
