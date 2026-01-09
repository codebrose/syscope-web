import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/authContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/"); // redirect to login
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    // Optionally show a spinner while checking auth
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
