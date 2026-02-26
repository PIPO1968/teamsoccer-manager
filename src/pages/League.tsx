import { useGame } from '../context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trophy } from 'lucide-react';

export default function League() {
  const { state } = useGame();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-700">Liga</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Clasificación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 w-8">#</th>
                  <th className="text-left py-2">Equipo</th>
                  <th className="text-center py-2 w-10">PJ</th>
                  <th className="text-center py-2 w-10">G</th>
                  <th className="text-center py-2 w-10">E</th>
                  <th className="text-center py-2 w-10">P</th>
                  <th className="text-center py-2 w-10">GF</th>
                  <th className="text-center py-2 w-10">GC</th>
                  <th className="text-center py-2 w-12">DG</th>
                  <th className="text-center py-2 w-12 font-bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {state.leagueTable.map((team, idx) => (
                  <tr
                    key={team.name}
                    className={`border-b last:border-0 ${team.name === state.teamName ? 'bg-green-50 font-semibold' : ''}`}
                  >
                    <td className="py-2 text-muted-foreground">
                      {idx + 1 <= 4 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-xs">{idx + 1}</span>
                      ) : idx + 1 >= state.leagueTable.length - 2 ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs">{idx + 1}</span>
                      ) : (
                        <span className="pl-1">{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-2">
                      {team.name}
                      {team.name === state.teamName && <span className="ml-1 text-xs text-green-600">(tú)</span>}
                    </td>
                    <td className="text-center py-2">{team.played}</td>
                    <td className="text-center py-2 text-green-600">{team.won}</td>
                    <td className="text-center py-2 text-yellow-600">{team.drawn}</td>
                    <td className="text-center py-2 text-red-600">{team.lost}</td>
                    <td className="text-center py-2">{team.gf}</td>
                    <td className="text-center py-2">{team.ga}</td>
                    <td className="text-center py-2">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                    <td className="text-center py-2 font-bold text-green-700">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Champions League</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Descenso</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {state.matches.filter(m => m.played).map(match => {
              const myGoals = match.isHome ? match.homeGoals : match.awayGoals;
              const theirGoals = match.isHome ? match.awayGoals : match.homeGoals;
              const result = myGoals > theirGoals ? 'V' : myGoals === theirGoals ? 'E' : 'D';
              const resultColor = result === 'V' ? 'text-green-600' : result === 'E' ? 'text-yellow-600' : 'text-red-600';
              return (
                <div key={match.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground w-24">{match.date}</span>
                  <div className="flex items-center gap-2 flex-1">
                    {match.isHome ? (
                      <>
                        <span className="font-semibold text-sm">{state.teamName}</span>
                        <span className="font-mono font-bold">{match.homeGoals} - {match.awayGoals}</span>
                        <span className="text-sm text-muted-foreground">{match.opponent}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-muted-foreground">{match.opponent}</span>
                        <span className="font-mono font-bold">{match.homeGoals} - {match.awayGoals}</span>
                        <span className="font-semibold text-sm">{state.teamName}</span>
                      </>
                    )}
                  </div>
                  <span className={`font-bold text-sm w-4 ${resultColor}`}>{result}</span>
                </div>
              );
            })}
            {state.matches.filter(m => m.played).length === 0 && (
              <p className="text-muted-foreground text-sm">No hay resultados aún</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
