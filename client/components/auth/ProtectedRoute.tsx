import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="min-h-[50vh] grid place-items-center text-muted-foreground">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <Outlet />;
}
