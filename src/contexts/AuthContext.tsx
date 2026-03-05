
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for stored manager data
      const storedManager = localStorage.getItem('manager');
      if (storedManager) {
        try {
          const parsedManager = JSON.parse(storedManager);
          console.log('Loaded manager from localStorage:', parsedManager);

          // Check if manager has sufficient admin level
          if (parsedManager.is_admin <= 3) {
            console.log('Manager does not have sufficient access level (admin > 3 required)');
            localStorage.removeItem('manager');
            setIsLoading(false);
            return;
          }

          // If the stored manager doesn't have status or premium info, fetch it from the database
          if (parsedManager && (!parsedManager.status || parsedManager.is_premium === undefined)) {
            console.log('Manager data incomplete, fetching from database...');
            const updatedData = await fetchManagerData(parsedManager.user_id);
            if (updatedData) {
              const updatedManager = { ...parsedManager, ...updatedData };

              // Double-check admin level after fetching updated data
              if (updatedManager.is_admin <= 3) {
                console.log('Manager does not have sufficient access level after data refresh');
                localStorage.removeItem('manager');
                setIsLoading(false);
                return;
              }

              setManager(updatedManager);
              localStorage.setItem('manager', JSON.stringify(updatedManager));
            } else {
              setManager(parsedManager);
            }
          } else {
            setManager(parsedManager);
          }

          // Check if this manager has a team
          if (parsedManager?.user_id) {
            await checkManagerTeam(parsedManager.user_id);
          }
        } catch (error) {
          console.error('Error parsing stored manager data:', error);
          localStorage.removeItem('manager');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchManagerData = async (managerId: number): Promise<Partial<Manager> | null> => {
    try {
      const response = await apiFetch<{ success: boolean; manager: Manager }>(`/managers/${managerId}`);
      console.log('Fetched manager data:', response.manager);
      return response.manager;
    } catch (error) {
      console.error('Error fetching manager data:', error);
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
      console.error('Error checking manager team:', error);
      setHasTeam(false);
    }
  };

  const signIn = (managerData: Manager) => {
    console.log('Attempting to sign in manager:', managerData);

    // Check if manager has sufficient admin level (> 3)
    if (managerData.is_admin <= 3) {
      console.log('Access denied: Manager does not have sufficient admin level');
      setManager(null);
      localStorage.removeItem('manager');
      setHasTeam(false);
      return;
    }
    setManager(managerData);
    localStorage.setItem('manager', JSON.stringify(managerData));
    if (managerData?.user_id) {
      checkManagerTeam(managerData.user_id);
    }
    //   throw new Error('Access denied: Insufficient privileges. The game is under development and access is not enabled at the moment.');
    // }
    // 
    // console.log('Manager has sufficient access level, proceeding with sign in');
    // setManager(managerData);
    // localStorage.setItem('manager', JSON.stringify(managerData));
    // 
    // // Check if this manager has a team
    // if (managerData?.user_id) {
    //   checkManagerTeam(managerData.user_id);
    // }
  };

  const signOut = async () => {
    if (manager?.user_id) {
      try {
        await apiFetch('/logout', {
          method: 'POST',
          body: JSON.stringify({ managerId: manager.user_id }),
        });
      } catch {
        // Ignorar errores de logout para no bloquear al usuario
      }
    }
    setManager(null);
    setHasTeam(false);
    localStorage.removeItem('manager');
    navigate('/login');
  };

  const isPremium = manager?.is_premium === 1 &&
    (!manager.premium_expires_at || new Date(manager.premium_expires_at) > new Date());

  // A manager is on waiting list if they have waiting_list status
  const isWaitingList = manager?.status === 'waiting_list';
  const isCarnetPending = manager?.status === 'carnet_pending' && (manager?.is_admin ?? 0) < 10;

  console.log('Auth context - manager status:', manager?.status, 'isWaitingList:', isWaitingList, 'isCarnetPending:', isCarnetPending, 'isPremium:', isPremium);

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
