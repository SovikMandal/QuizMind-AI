import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Redirects authenticated users away from auth pages (login/signup). */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}
