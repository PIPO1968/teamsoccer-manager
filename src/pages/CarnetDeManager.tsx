import { useNavigate, Link } from 'react-router-dom';
import { useManagerLicense, LicenseTest } from '@/hooks/useManagerLicense';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, ExternalLink, Award } from 'lucide-react';

const getTestRoute = (
  testKey: string,
  teamId: number | null,
  stadiumId: number | null
): string => {
  switch (testKey) {
    case 'visit_dashboard': return '/dashboard';
    case 'visit_team': return teamId ? `/team/${teamId}` : '/dashboard';
    case 'visit_players': return teamId ? `/team/${teamId}/players` : '/dashboard';
    case 'visit_transfer_market': return '/transfer-market';
    case 'visit_matches': return teamId ? `/matches/${teamId}` : '/matches';
    case 'visit_finances': return teamId ? `/finances/${teamId}` : '/dashboard';
    case 'visit_stadium': return stadiumId ? `/stadium/${stadiumId}` : '/dashboard';
    case 'visit_training': return '/training';
    case 'visit_forums': return '/forums';
    case 'visit_community': return '/community';
    default: return '/dashboard';
  }
};

interface TestCardProps {
  test: LicenseTest;
  isCompleted: boolean;
  teamId: number | null;
  stadiumId: number | null;
}

const TestCard = ({ test, isCompleted, teamId, stadiumId }: TestCardProps) => {
  const route = getTestRoute(test.test_key, teamId, stadiumId);

  return (
    <Card className={`transition-all border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              )}
              <h3 className="font-semibold text-gray-900">{test.title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">{test.description}</p>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isCompleted ? 'text-green-700' : 'text-gray-500'}`}>
                {isCompleted ? '✓ Recompensa recibida:' : 'Recompensa:'}{' '}
                <span className="font-bold">€{test.reward_amount.toLocaleString('es-ES')}</span>
              </span>
              {!isCompleted && (
                <Link to={route}>
                  <Button size="sm" variant="outline" className="gap-1 text-xs border-yellow-400 text-yellow-700 hover:bg-yellow-50">
                    Ir a la sección <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CarnetDeManager = () => {
  const { manager } = useAuth();
  const navigate = useNavigate();
  const {
    tests,
    completedKeys,
    teamId,
    stadiumId,
    isLoading,
    isAllCompleted,
    claimCarnet,
  } = useManagerLicense();

  const completed = completedKeys.length;
  const total = tests.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const totalReward = tests.reduce((sum, t) => sum + t.reward_amount, 0);

  const handleClaim = async () => {
    const ok = await claimCarnet();
    if (ok) {
      // Refresh manager data in localStorage to reflect 'active' status
      const stored = localStorage.getItem('manager');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('manager', JSON.stringify({ ...parsed, status: 'active' }));
      }
      navigate('/dashboard');
      // Force page reload so AuthContext re-reads localStorage
      window.location.href = '/dashboard';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Cargando pruebas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="bg-yellow-100 text-yellow-700 p-3 rounded-full">
            <Award className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Carnet de Manager</h1>
        <p className="text-gray-600">
          ¡Bienvenido, {manager?.username}! Completa todas las pruebas para obtener tu carnet y acceder al juego.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Recompensa total: <span className="font-semibold text-green-700">€{totalReward.toLocaleString('es-ES')}</span>
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso</span>
            <span className="text-sm font-bold text-gray-900">{completed} / {total} pruebas</span>
          </div>
          <Progress value={progressPct} className="h-3" />
          {isAllCompleted && (
            <p className="text-sm text-green-700 font-medium mt-2 text-center">
              ¡Has completado todas las pruebas! Ya puedes obtener tu Carnet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Test cards */}
      <div className="grid gap-4 mb-8">
        {tests.map(test => (
          <TestCard
            key={test.test_key}
            test={test}
            isCompleted={completedKeys.includes(test.test_key)}
            teamId={teamId}
            stadiumId={stadiumId}
          />
        ))}
      </div>

      {/* Claim button */}
      <div className="text-center">
        <Button
          size="lg"
          disabled={!isAllCompleted}
          onClick={handleClaim}
          className="px-10 bg-yellow-500 hover:bg-yellow-600 text-white font-bold disabled:opacity-40"
        >
          <Award className="h-5 w-5 mr-2" />
          Obtener Carnet de Manager
        </Button>
        {!isAllCompleted && (
          <p className="text-xs text-gray-500 mt-2">
            Completa las {total - completed} pruebas restantes para desbloquear el botón.
          </p>
        )}
      </div>
    </div>
  );
};

export default CarnetDeManager;
