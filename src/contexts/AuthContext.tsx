
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '@/services/apiClient';

interface Manager {
  user_id: number;
  username: string;
  email: string;
  is_admin: number;
  is_premium?: number;
  premium_expires_at?: string;
  team_id?: number;
  status?: string;
  country_id?: number;
  country_name?: string;
}

interface AuthContextType {
  manager: Manager | null;
  signIn: (managerData: Manager) => void;
  signOut: () => void;
  isLoading: boolean;
  isPremium: boolean;
  isWaitingList: boolean;
  isCarnetPending: boolean;
  hasTeam: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [manager, setManager] = useState<Manager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTeam, setHasTeam] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Nueva lógica: obtener el usuario autenticado desde el backend usando la cookie de sesión
    const initializeAuth = async () => {
      try {
        const response = await apiFetch<{ success: boolean; manager: Manager | null }>(
          '/auth/me'
        );
        if (response.manager && response.manager.user_id) {
          setManager(response.manager);
          await checkManagerTeam(response.manager.user_id);
        } else {
          setManager(null);
        }
      } catch {
        setManager(null);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const fetchManagerData = async (managerId: number): Promise<Partial<Manager> | null> => {
    try {
      const response = await apiFetch<{ success: boolean; manager: Manager }>(`/managers/${managerId}`);
      // Eliminado log de depuración
      return response.manager;
    } catch (error) {
      // Eliminado log de depuración
      return null;
    }
  };

  const checkManagerTeam = async (managerId: number) => {
    try {
      const response = await apiFetch<{ success: boolean; team: { team_id: number } | null }>(
        `/teams/by-manager/${managerId}`
      );
      setHasTeam(!!response.team);
    } catch (error) {
      // Eliminado log de depuración
      setHasTeam(false);
    }
  };

  // signIn ahora solo actualiza el estado local tras login exitoso (el backend debe establecer la cookie de sesión)
  const signIn = (managerData: Manager) => {
    setManager(managerData);
    if (managerData?.user_id) {
      checkManagerTeam(managerData.user_id);
    }
  };

  // Heartbeat: actualiza last_seen y current_url cada 2 minutos
  useEffect(() => {
    if (!manager?.user_id) return;
    const sendHeartbeat = () => {
      apiFetch('/heartbeat', {
        method: 'POST',
        body: JSON.stringify({ managerId: manager.user_id, currentUrl: location.pathname }),
      }).catch(() => { });
    };
    sendHeartbeat(); // inmediato al montar
    const interval = setInterval(sendHeartbeat, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [manager?.user_id, location.pathname]);

  const signOut = async () => {
    try {
      await apiFetch('/logout', {
        method: 'POST',
      });
    } catch {
      // Ignorar errores de logout para no bloquear al usuario
    }
    setManager(null);
    setHasTeam(false);
    navigate('/login');
  };

  const isPremium = manager?.is_premium === 1 &&
    (!manager.premium_expires_at || new Date(manager.premium_expires_at) > new Date());

  // A manager is on waiting list if they have waiting_list status
  const isWaitingList = manager?.status === 'waiting_list';
  const isCarnetPending = manager?.status === 'carnet_pending' && (manager?.is_admin ?? 0) < 10;

  // Eliminado log de depuración

  return (
    <AuthContext.Provider value={{
      manager,
      signIn,
      signOut,
      isLoading,
      isPremium,
      isWaitingList,
      isCarnetPending,
      hasTeam
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
