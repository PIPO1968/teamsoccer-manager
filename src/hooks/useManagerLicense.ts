import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface LicenseTest {
  id: number;
  test_key: string;
  title: string;
  description: string;
  reward_amount: number;
  sort_order: number;
  is_active: boolean;
}

interface LicenseData {
  tests: LicenseTest[];
  completedKeys: string[];
  teamId: number | null;
  stadiumId: number | null;
}

export const useManagerLicense = () => {
  const { manager, isCarnetPending, isWaitingList, signIn } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<LicenseData>({
    tests: [],
    completedKeys: [],
    teamId: null,
    stadiumId: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchLicense = useCallback(async () => {
    if (!manager?.user_id) return;
    setIsLoading(true);
    try {
      const res = await apiFetch<LicenseData & { success: boolean }>(
        `/manager-license?managerId=${manager.user_id}`
      );
      setData({
        tests: res.tests || [],
        completedKeys: res.completedKeys || [],
        teamId: res.teamId ?? null,
        stadiumId: res.stadiumId ?? null,
      });
    } catch (err) {
      console.error('Error fetching manager license:', err);
    } finally {
      setIsLoading(false);
    }
  }, [manager?.user_id]);

  useEffect(() => {
    if (manager?.user_id) {
      fetchLicense();
    }
  }, [manager?.user_id, fetchLicense]);

  const completeTest = useCallback(async (testKey: string) => {
    if (!manager?.user_id || !isCarnetPending) return;
    try {
      const res = await apiFetch<{ success: boolean; reward?: number; alreadyCompleted?: boolean }>(
        `/manager-license/complete/${testKey}`,
        { method: 'POST', body: JSON.stringify({ managerId: manager.user_id }) }
      );
      if (res.success && !res.alreadyCompleted && res.reward) {
        toast({
          title: '¡Prueba completada!',
          description: `Has ganado €${res.reward.toLocaleString('es-ES')} por completar esta prueba.`,
        });
        setData(prev => ({
          ...prev,
          completedKeys: [...prev.completedKeys, testKey],
        }));
      }
    } catch (err) {
      console.error('Error completing test:', err);
    }
  }, [manager?.user_id, isCarnetPending, toast]);

  const claimCarnet = useCallback(async (): Promise<boolean> => {
    if (!manager?.user_id) return false;
    try {
      await apiFetch('/manager-license/claim', {
        method: 'POST',
        body: JSON.stringify({ managerId: manager.user_id }),
      });
      const updated = await apiFetch<{ success: boolean; manager: any }>(`/managers/${manager.user_id}`);
      if (updated?.manager) signIn(updated.manager);
      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo obtener el carnet',
        variant: 'destructive',
      });
      return false;
    }
  }, [manager?.user_id, signIn, toast]);

  const isAllCompleted =
    data.tests.length > 0 && data.completedKeys.length >= data.tests.length;

  return {
    ...data,
    isLoading,
    isAllCompleted,
    completeTest,
    claimCarnet,
    refetch: fetchLicense,
  };
};

/**
 * Lightweight hook to auto-complete a carnet test when a page is visited.
 * No-ops if the manager is not in carnet_pending status.
 * Usage: call at the top level of any target page component.
 */
export const useCompleteCarnetTest = (testKey: string, enabled = true) => {
  const { manager, isCarnetPending } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isCarnetPending || !manager?.user_id || !enabled) return;

    apiFetch<{ success: boolean; reward?: number; alreadyCompleted?: boolean }>(
      `/manager-license/complete/${testKey}`,
      { method: 'POST', body: JSON.stringify({ managerId: manager.user_id }) }
    ).then(res => {
      if (res.success && !res.alreadyCompleted && res.reward) {
        toast({
          title: '¡Prueba completada!',
          description: `Has ganado €${res.reward.toLocaleString('es-ES')} por explorar esta sección.`,
        });
      }
    }).catch(err => {
      console.error('Error completing carnet test:', err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Re-run when enabled changes (e.g., own team ID resolved)
};

