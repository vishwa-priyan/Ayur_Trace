import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wrap protected routes with:
 * <ProtectedRoute><MyPage /></ProtectedRoute>
 */
export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While auth state is resolving, you can show a spinner or null
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Simple placeholder - replace with your spinner component if you have one */}
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login and preserve the attempted location in state
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // User is authenticated, render children
  return children;
}