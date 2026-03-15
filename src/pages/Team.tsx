import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formations } from '../data/initialData';
import { Player, Formation } from '../types';
import { Users, Shield } from 'lucide-react';

const positionColors: Record<string, string> = {
  GK: 'bg-yellow-500',
  CB: 'bg-blue-500',
  LB: 'bg-blue-400',
  RB: 'bg-blue-400',
  CDM: 'bg-green-600',
  CM: 'bg-green-500',
  CAM: 'bg-green-400',
  LW: 'bg-orange-500',
  RW: 'bg-orange-500',
  ST: 'bg-red-500',
  CF: 'bg-red-400',
};

function PlayerCard({ player, onSell }: { player: Player; onSell: () => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-sm">{player.name}</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-white text-xs px-1.5 py-0.5 rounded ${positionColors[player.position] || 'bg-gray-500'}`}>
                {player.position}
              </span>
              <span className="text-xs text-muted-foreground">Edad: {player.age}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{player.overall}</div>
            <div className="text-xs text-muted-foreground">OVR</div>
          </div>
        </div>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Vel {player.speed}</span>
            <span>Tir {player.shooting}</span>
            <span>Pas {player.passing}</span>
            <span>Def {player.defending}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">⚽ {player.goals} goles · 🅰️ {player.assists} asist.</span>
          <span className="text-blue-600 font-semibold">€{player.value}M</span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="w-full mt-2 h-7 text-xs"
          onClick={onSell}
        >
          Vender (€{Math.round(player.value * 0.85 * 10) / 10}M)
        </Button>
      </CardContent>
    </Card>
  );
}

function FootballPitch({ formation, players }: { formation: Formation; players: Player[] }) {
  return (
    <div className="relative bg-green-700 rounded-lg overflow-hidden" style={{ paddingBottom: '150%' }}>
      <div className="absolute inset-0">
        <div className="absolute inset-x-4 top-4 bottom-4 border-2 border-white/30 rounded" />
        <div className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/30" />
        <div className="absolute left-1/4 right-1/4 top-4 h-8 border-b-2 border-x-2 border-white/30" />
        <div className="absolute left-1/4 right-1/4 bottom-4 h-8 border-t-2 border-x-2 border-white/30" />
      </div>
      {formation.positions.map((pos, idx) => {
        const player = players[idx];
        if (!player) return null;
        return (
          <div
            key={idx}
            className="absolute flex flex-col items-center"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${positionColors[player.position] || 'bg-gray-500'}`}>
              {player.overall}
            </div>
            <div className="bg-black/70 text-white text-[9px] px-1 rounded mt-0.5 whitespace-nowrap max-w-16 overflow-hidden text-center">
              {player.name.split(' ')[0]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Team() {
  const { state, sellPlayer } = useGame();
  const [selectedFormation, setSelectedFormation] = useState(formations[0]);
  const [activeTab, setActiveTab] = useState<'squad' | 'formation'>('squad');
  const [serie, setSerie] = useState<{ name: string; id: string; region: string } | null>(null);
  const [loadingSerie, setLoadingSerie] = useState(false);

  const starters = state.players.slice(0, 11);
  const bench = state.players.slice(11);
  const avgOverall = starters.length > 0 ? Math.round(starters.reduce((sum, p) => sum + p.overall, 0) / starters.length) : 0;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between">
        <h1 className="text-3xl font-bold text-green-700">{state.teamName}</h1>
        {/* Bloque de serie debajo del nombre del club */}
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
        <div className="flex items-center gap-2 mt-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-semibold">Media: {avgOverall}</span>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        <button
          className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'squad' ? 'border-green-600 text-green-600' : 'border-transparent text-muted-foreground'}`}
          onClick={() => setActiveTab('squad')}
        >
          <Users className="inline h-4 w-4 mr-1" />
          Plantilla ({state.players.length})
        </button>
        <button
          className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'formation' ? 'border-green-600 text-green-600' : 'border-transparent text-muted-foreground'}`}
          onClick={() => setActiveTab('formation')}
        >
          <Shield className="inline h-4 w-4 mr-1" />
          Alineación
        </button>
      </div>

      {activeTab === 'squad' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Once Titular</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {starters.map(player => (
                <PlayerCard key={player.id} player={player} onSell={() => sellPlayer(player.id)} />
              ))}
            </div>
          </div>
          {bench.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Suplentes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {bench.map(player => (
                  <PlayerCard key={player.id} player={player} onSell={() => sellPlayer(player.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'formation' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {formations.map(f => (
              <Button
                key={f.name}
                variant={selectedFormation.name === f.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFormation(f)}
                className={selectedFormation.name === f.name ? 'bg-green-600' : ''}
              >
                {f.name}
              </Button>
            ))}
          </div>
          <div className="max-w-xs mx-auto">
            <FootballPitch formation={selectedFormation} players={starters} />
          </div>
        </div>
      )}
    </div>
  );
}
