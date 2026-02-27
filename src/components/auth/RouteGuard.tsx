
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { manager, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!manager || manager.is_admin <= 3)) {
      console.log('RouteGuard: Redirecting to login - insufficient access level');
      navigate('/login');
    }
  }, [manager, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!manager || manager.is_admin <= 3) {
    return null;
  }

  return <>{children}</>;
};
