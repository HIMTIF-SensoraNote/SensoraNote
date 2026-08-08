import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat data pengguna...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated user back to Landing Page
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Force email verification
  if (!user.email_verified_at && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }

  // Force incomplete profile users to complete it (skip if on verify-email)
  if (user.profile_completed === false && location.pathname !== '/complete-profile' && location.pathname !== '/verify-email') {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
}
