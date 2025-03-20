import type React from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router";
// import { useAuth } from "../hooks/useAuth"

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
//   const { isAuthenticated } = useAuth();

  if (localStorage.getItem("user")) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
