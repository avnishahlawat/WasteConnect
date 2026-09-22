import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';
import { AppLayout } from '../layouts/AppLayout';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-text-muted">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    const roleRoutes: Record<string, string> = {
      CITIZEN: '/citizen/dashboard',
      COLLECTOR: '/collector/dashboard',
      AUTHORITY: '/authority/dashboard',
      ADMIN: '/admin/dashboard',
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  return (
    <AppLayout role={user.role}>
      <Outlet />
    </AppLayout>
  );
};
