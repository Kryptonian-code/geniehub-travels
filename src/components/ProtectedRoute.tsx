import { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessAdminPath, getDefaultAdminPath } from "@/lib/adminAccess";

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user, loading, mustChangePassword } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-deep text-muted-green">Loading your workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (mustChangePassword && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  return children;
}

export function AdminRoute({ children }: { children: ReactElement }) {
  const { user, loading, isAdmin, mustChangePassword } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-deep text-muted-green">Loading admin tools...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (mustChangePassword) {
    return <Navigate to="/reset-password" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  if (!canAccessAdminPath(user, location.pathname)) {
    return <Navigate to={getDefaultAdminPath(user)} replace />;
  }

  return children;
}
