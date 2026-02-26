import { useGame } from '../context/GameContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Player } from '../types';
import { ShoppingCart, DollarSign } from 'lucide-react';

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

function MarketPlayerCard({ player, canAfford, onBuy }: { player: Player; canAfford: boolean; onBuy: () => void }) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${!canAfford ? 'opacity-60' : ''}`}>
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
        <div className="grid grid-cols-2 gap-1 text-xs mb-3">
          <div className="flex justify-between bg-gray-50 rounded px-2 py-1">
            <span className="text-muted-foreground">Velocidad</span>
            <span className="font-semibold">{player.speed}</span>
          </div>
          <div className="flex justify-between bg-gray-50 rounded px-2 py-1">
            <span className="text-muted-foreground">Tiro</span>
            <span className="font-semibold">{player.shooting}</span>
          </div>
          <div className="flex justify-between bg-gray-50 rounded px-2 py-1">
            <span className="text-muted-foreground">Pase</span>
            <span className="font-semibold">{player.passing}</span>
          </div>
          <div className="flex justify-between bg-gray-50 rounded px-2 py-1">
            <span className="text-muted-foreground">Defensa</span>
            <span className="font-semibold">{player.defending}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="text-muted-foreground">Salario: €{player.salary}K/sem</span>
          <span className="font-bold text-blue-600 text-sm">€{player.value}M</span>
        </div>
        <Button
          size="sm"
          className="w-full h-7 text-xs bg-green-600 hover:bg-green-700"
          disabled={!canAfford}
          onClick={onBuy}
        >
          {canAfford ? (
            <><ShoppingCart className="h-3 w-3 mr-1" />Fichar</>
          ) : 'Sin presupuesto'}
        </Button>
      </CardContent>
    </Card>
  );
}

const positionGroupLabel: Record<string, string> = {
  GK: 'Porteros',
  CB: 'Defensas', LB: 'Defensas', RB: 'Defensas',
  CM: 'Centrocampistas', CDM: 'Centrocampistas', CAM: 'Centrocampistas',
  LW: 'Delanteros', RW: 'Delanteros', ST: 'Delanteros', CF: 'Delanteros',
};

export default function Transfers() {
  const { state, marketPlayers, buyPlayer } = useGame();

  const byPosition = marketPlayers.reduce<Record<string, Player[]>>((acc, p) => {
    if (!acc[p.position]) acc[p.position] = [];
    acc[p.position].push(p);
    return acc;
  }, {});

  const positions = Object.keys(byPosition).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-green-700">Mercado de Fichajes</h1>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-blue-700">Presupuesto: €{state.budget}M</span>
        </div>
      </div>

      {marketPlayers.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No hay jugadores disponibles en el mercado actualmente.
          </CardContent>
        </Card>
      )}

      {positions.map(pos => (
        <div key={pos}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className={`text-white text-xs px-2 py-1 rounded ${positionColors[pos] || 'bg-gray-500'}`}>{pos}</span>
            {positionGroupLabel[pos] ?? 'Jugadores'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {byPosition[pos].map(player => (
              <MarketPlayerCard
                key={player.id}
                player={player}
                canAfford={state.budget >= player.value}
                onBuy={() => buyPlayer(player)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
