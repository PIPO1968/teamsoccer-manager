
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const CARNET_ALLOWED_PATHS = [
  '/carnet',
  '/dashboard',
  '/team/',
  '/matches',
  '/transfer-market',
  '/training',
  '/finances/',
  '/stadium/',
  '/forums',
  '/community',
];

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { manager, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!manager) {
      console.log('RouteGuard: Redirecting to login - not authenticated');
      navigate('/login');
      return;
    }

    if (manager.status === 'carnet_pending') {
      const allowed = CARNET_ALLOWED_PATHS.some(p => location.pathname.startsWith(p));
      if (!allowed) {
        navigate('/carnet');
      }
    }
  }, [manager, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!manager) {
    return null;
  }

  return <>{children}</>;
};
