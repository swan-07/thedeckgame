import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../lib/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="spinner" />;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="spinner" />;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (user?.role !== "admin")
    return (
      <main className="narrow center">
        <p className="notice">Admin access required.</p>
      </main>
    );
  return <>{children}</>;
}
