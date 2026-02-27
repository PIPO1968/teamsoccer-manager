
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
  requiredLevel?: number;
}

export const AdminGuard = ({ children, requiredLevel = 3 }: AdminGuardProps) => {
  const { manager } = useAuth();
  
  if (!manager?.is_admin || manager.is_admin < requiredLevel) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
