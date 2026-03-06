import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface LicenseTest {
  test_key: string;
  title: string;
  description: string;
  reward_amount: number;
}

// Las 10 pruebas del Carnet de Manager — definidas en el frontend para
// que siempre aparezcan independientemente del estado de la base de datos.
export const CARNET_TESTS: LicenseTest[] = [
  { test_key: 'visit_dashboard',       title: 'Explora tu Panel',        description: 'Visita la página Resumen de tu club',          reward_amount: 50000 },
  { test_key: 'visit_team',            title: 'Conoce tu Equipo',        description: 'Visita la página de tu equipo',                reward_amount: 50000 },
  { test_key: 'visit_players',         title: 'Gestiona tus Jugadores',  description: 'Visita la lista de jugadores',                 reward_amount: 50000 },
  { test_key: 'visit_transfer_market', title: 'Mercado de Fichajes',     description: 'Visita el Mercado de Transferencias',          reward_amount: 75000 },
  { test_key: 'visit_matches',         title: 'Los Partidos',            description: 'Visita la sección de Partidos',                reward_amount: 50000 },
  { test_key: 'visit_finances',        title: 'Las Finanzas',            description: 'Revisa las finanzas de tu equipo',             reward_amount: 50000 },
  { test_key: 'visit_stadium',         title: 'Tu Estadio',              description: 'Visita tu estadio',                            reward_amount: 50000 },
  { test_key: 'visit_training',        title: 'Entrenamiento',           description: 'Visita la sección de Entrenamiento',           reward_amount: 50000 },
  { test_key: 'visit_forums',          title: 'Los Foros',               description: 'Visita los Foros de la comunidad',             reward_amount: 50000 },
  { test_key: 'visit_community',       title: 'La Comunidad',            description: 'Visita la página de Comunidad',                reward_amount: 50000 },
];

interface ProgressData {
  completedKeys: string[];
  teamId: number | null;
  stadiumId: number | null;
}

export const useManagerLicense = () => {
  const { manager, isCarnetPending, signIn } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<ProgressData>({
    completedKeys: [],
    teamId: null,
    stadiumId: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!manager?.user_id) return;
    setIsLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; completedKeys: string[]; teamId: number | null; stadiumId: number | null }>(
        `/manager-license?managerId=${manager.user_id}`
      );
      setProgress({
        completedKeys: res.completedKeys || [],
        teamId: res.teamId ?? null,
        stadiumId: res.stadiumId ?? null,
      });
    } catch (err) {
      console.error('Error fetching manager license progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, [manager?.user_id]);

  useEffect(() => {
    if (manager?.user_id) {
      fetchProgress();
    }
  }, [manager?.user_id, fetchProgress]);

  const completeTest = useCallback(async (testKey: string) => {
    if (!manager?.user_id || !isCarnetPending) return;
    // Optimistic update: marca como completada en UI inmediatamente
    setProgress(prev => {
      if (prev.completedKeys.includes(testKey)) return prev;
      return { ...prev, completedKeys: [...prev.completedKeys, testKey] };
    });
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
    progress.completedKeys.length >= CARNET_TESTS.length;

  return {
    tests: CARNET_TESTS,
    completedKeys: progress.completedKeys,
    teamId: progress.teamId,
    stadiumId: progress.stadiumId,
    isLoading,
    isAllCompleted,
    completeTest,
    claimCarnet,
    refetch: fetchProgress,
  };
};

/**
 * Lightweight hook to auto-complete a carnet test when a page is visited.
 * No-ops if the manager is not in carnet_pending status.
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
  }, [enabled]);
};
