import { useGame } from '../context/GameContext';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Trophy, Users, TrendingUp, Calendar, DollarSign, Target } from 'lucide-react';

export default function Dashboard() {
  const { state, simulateMatch } = useGame();
  const [serie, setSerie] = useState<{ name: string; id: string; region: string } | null>(null);
  const [loadingSerie, setLoadingSerie] = useState(false);
  useEffect(() => {
    async function fetchSerie() {
      setLoadingSerie(true);
      try {
        // Suponiendo que el equipo tiene un id fijo (por ejemplo 1)
        const teamId = 1;
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/teams/${teamId}/serie`);
        if (!res.ok) throw new Error('No se pudo obtener la serie');
        const data = await res.json();
        setSerie({ name: data.name, id: data.id, region: data.region });
      } catch {
        setSerie(null);
      } finally {
        setLoadingSerie(false);
      }
    }
    fetchSerie();
  }, []);
  const myTeam = state.leagueTable.find(t => t.name === state.teamName);
  const nextMatch = state.matches.find(m => !m.played);
  const recentMatches = state.matches.filter(m => m.played).slice(-3).reverse();

  const topScorer = [...state.players].sort((a, b) => b.goals - a.goals)[0];
  const position = state.leagueTable.findIndex(t => t.name === state.teamName) + 1;

  const getResultBadge = (match: typeof state.matches[0]) => {
    const myGoals = match.isHome ? match.homeGoals : match.awayGoals;
    const theirGoals = match.isHome ? match.awayGoals : match.homeGoals;
    if (myGoals > theirGoals) return <Badge className="bg-green-500">V</Badge>;
    if (myGoals === theirGoals) return <Badge className="bg-yellow-500">E</Badge>;
    return <Badge className="bg-red-500">D</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-700">{state.teamName}</h1>
          {/* Serie debajo del nombre del club */}
          <div className="mt-1">
            {loadingSerie ? (
              <span className="text-sm text-muted-foreground">Cargando serie...</span>
            ) : serie ? (
              <a
                href={`/series/${serie.id}`}
                className="text-green-600 font-semibold text-sm hover:underline"
              >
                {serie.region} - {serie.name}
              </a>
            ) : (
              <span className="text-sm text-red-600">Serie no asignada</span>
            )}
          </div>
          <p className="text-muted-foreground">Semana {state.week} de la temporada</p>
        </div>
        {nextMatch && (
          <Button onClick={simulateMatch} size="lg" className="bg-green-600 hover:bg-green-700">
            <Calendar className="mr-2 h-4 w-4" />
            Jugar vs {nextMatch.opponent}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Posición</p>
                <p className="text-2xl font-bold">{position}º</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Puntos</p>
                <p className="text-2xl font-bold">{myTeam?.points ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Presupuesto</p>
                <p className="text-2xl font-bold">€{state.budget}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Plantilla</p>
                <p className="text-2xl font-bold">{state.players.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Liga</CardTitle>
          </CardHeader>
          <CardContent>
            {myTeam && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Partidos jugados</span>
                  <span className="font-semibold">{myTeam.played}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Victorias</span>
                  <span className="font-semibold text-green-600">{myTeam.won}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Empates</span>
                  <span className="font-semibold text-yellow-600">{myTeam.drawn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Derrotas</span>
                  <span className="font-semibold text-red-600">{myTeam.lost}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Goles a favor/contra</span>
                  <span className="font-semibold">{myTeam.gf} / {myTeam.ga}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMatches.length === 0 && (
                <p className="text-muted-foreground text-sm">No hay partidos jugados aún</p>
              )}
              {recentMatches.map(match => (
                <div key={match.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getResultBadge(match)}
                    <span className="text-sm">{match.isHome ? 'vs' : 'en'} {match.opponent}</span>
                  </div>
                  <span className="font-mono font-semibold">
                    {match.isHome ? `${match.homeGoals}-${match.awayGoals}` : `${match.awayGoals}-${match.homeGoals}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {topScorer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              Máximo Goleador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{topScorer.name}</p>
                <p className="text-sm text-muted-foreground">{topScorer.position} · Overall: {topScorer.overall}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-500">{topScorer.goals}</p>
                <p className="text-sm text-muted-foreground">goles · {topScorer.assists} asist.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Próximos Partidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {state.matches.filter(m => !m.played).slice(0, 5).map(match => (
              <div key={match.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{match.date}</Badge>
                  <span>{match.isHome ? 'vs' : 'en'} {match.opponent}</span>
                </div>
                <Badge variant="secondary">{match.isHome ? 'Local' : 'Visitante'}</Badge>
              </div>
            ))}
            {state.matches.filter(m => !m.played).length === 0 && (
              <p className="text-muted-foreground text-sm">¡Temporada completada!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
