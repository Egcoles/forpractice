import React from "react";
import { Navigate, useOutlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ requiredPermission }) => {
  const { user, hasPermission } = useAuth();
  const isAuthenticated = !!user;
  const outlet = useOutlet();

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Redirect authenticated but unauthorized users to a forbidden page
    return <Navigate to="/403" replace />;
  }

  // If authenticated and authorized, render the child route
  return outlet;
};

export default ProtectedRoute;