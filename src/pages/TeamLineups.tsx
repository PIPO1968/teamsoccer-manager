
import { useState, useEffect } from "react";
import { apiPost } from "@/services/apiClient";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import PitchField from "@/components/lineups/PitchField";
import BenchSlots from "@/components/lineups/BenchSlots";
import TacticalOrdersDialog from "@/components/lineups/TacticalOrdersDialog";
import { useAuth } from "@/contexts/AuthContext";
import { PlayerAvatar } from "@/components/avatar/PlayerAvatar";

const TeamLineups = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { t } = useLanguage();
  const { manager } = useAuth();
  const { players, isLoading } = useTeamPlayers(teamId);
  const [isSaved, setIsSaved] = useState(false);
  const [isDefaultSaved, setIsDefaultSaved] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("alineacion_1");
  const [playersInPositions, setPlayersInPositions] = useState<{ [key: number]: any }>({});
  const [playersInBench, setPlayersInBench] = useState<{ [key: number]: any }>({});
  const [tacticalOrders, setTacticalOrders] = useState<{ [key: number]: { zone: number; action: string } }>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<'zone' | 'action'>('zone');
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  const handleSave = async () => {
    console.log('handleSave ejecutado', { teamId, selectedSlot });
    if (!teamId) return;

    // Convertir playersInPositions al formato del backend
    const positions = Object.entries(playersInPositions).map(([positionIndex, player]) => ({
      player_id: player.player_id,
      position_index: parseInt(positionIndex, 10),
      zone_orders: tacticalOrders[parseInt(positionIndex, 10)] || {}
    }));

    // Convertir playersInBench al formato del backend
    const substitutes = Object.entries(playersInBench).map(([benchIndex, player]) => ({
      player_id: player.player_id,
      bench_index: parseInt(benchIndex, 10)
    }));

    console.log('Guardando alineación:', { positions, substitutes });

    try {
      const data = await apiPost(`/teams/${teamId}/lineup`, {
        slotName: selectedSlot,
        formationName: '1-4-4-2',
        positions,
        substitutes,
        isDefault: false
      });
      console.log('Respuesta del servidor:', data);
      if (data.success) {
        setIsSaved(true);
        console.log('Alineación guardada exitosamente');
      } else {
        console.error('Error en respuesta:', data);
      }
    } catch (error) {
      console.error('Error guardando alineación:', error);
    }
  };

  const handleSaveAsDefault = async () => {
    console.log('handleSaveAsDefault ejecutado', { teamId, selectedSlot });
    if (!teamId) return;

    // Convertir playersInPositions al formato del backend
    const positions = Object.entries(playersInPositions).map(([positionIndex, player]) => ({
      player_id: player.player_id,
      position_index: parseInt(positionIndex, 10),
      zone_orders: tacticalOrders[parseInt(positionIndex, 10)] || {}
    }));

    // Convertir playersInBench al formato del backend
    const substitutes = Object.entries(playersInBench).map(([benchIndex, player]) => ({
      player_id: player.player_id,
      bench_index: parseInt(benchIndex, 10)
    }));

    console.log('Guardando como predeterminada:', { positions, substitutes });

    try {
      const data = await apiPost(`/teams/${teamId}/lineup`, {
        slotName: selectedSlot,
        formationName: '1-4-4-2',
        positions,
        substitutes,
        isDefault: true
      });
      console.log('Respuesta del servidor (predeterminada):', data);
      if (data.success) {
        setIsSaved(true);
        setIsDefaultSaved(true);
        console.log('Alineación predeterminada guardada exitosamente');
      } else {
        console.error('Error en respuesta:', data);
      }
    } catch (error) {
      console.error('Error guardando alineación predeterminada:', error);
    }
  };

  const handlePositionClick = (zone: number, positionIndex: number) => {
    // Si hay un jugador en esta posición, abrir diálogo de órdenes tácticas
    if (playersInPositions[positionIndex]) {
      setSelectedPosition(positionIndex);
      setDialogStep('zone');
      setDialogOpen(true);
    }
  };

  const handleZoneSelect = (zone: number) => {
    setSelectedZone(zone);
    setDialogStep('action');
  };

  const handleActionSelect = (action: string) => {
    if (selectedPosition !== null && selectedZone !== null) {
      setTacticalOrders(prev => ({
        ...prev,
        [selectedPosition]: { zone: selectedZone, action }
      }));
    }
    // Cerrar diálogo y resetear
    setDialogOpen(false);
    setSelectedPosition(null);
    setSelectedZone(null);
    setDialogStep('zone');
  };

  const handleBenchClick = (slotIndex: number) => {
    console.log(`Click en banquillo slot ${slotIndex}`);
    // TODO: Abrir selector de jugador para banquillo
  };

  const handlePlayerDropped = (positionIndex: number, playerId: number) => {
    const player = players?.find(p => p.player_id === playerId);
    if (player) {
      setPlayersInPositions(prev => {
        // Buscar si el jugador ya está en otra posición del campo y liberarla
        const newPositions = { ...prev };
        Object.keys(newPositions).forEach(key => {
          const posIdx = parseInt(key, 10);
          if (newPositions[posIdx]?.player_id === playerId) {
            delete newPositions[posIdx];
          }
        });

        // Asignar el jugador a la nueva posición
        newPositions[positionIndex] = player;
        return newPositions;
      });

      // También quitar del banquillo si estaba ahí
      setPlayersInBench(prev => {
        const newBench = { ...prev };
        Object.keys(newBench).forEach(key => {
          const benchIdx = parseInt(key, 10);
          if (newBench[benchIdx]?.player_id === playerId) {
            delete newBench[benchIdx];
          }
        });
        return newBench;
      });
    }
  };

  const handleRemovePlayer = (positionIndex: number) => {
    setPlayersInPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[positionIndex];
      return newPositions;
    });
  };

  const handleBenchPlayerDropped = (benchIndex: number, playerId: number) => {
    const player = players?.find(p => p.player_id === playerId);
    if (player) {
      setPlayersInBench(prev => {
        // Buscar si el jugador ya está en otro slot del banquillo y liberarlo
        const newBench = { ...prev };
        Object.keys(newBench).forEach(key => {
          const benchIdx = parseInt(key, 10);
          if (newBench[benchIdx]?.player_id === playerId) {
            delete newBench[benchIdx];
          }
        });

        // Asignar el jugador al nuevo slot
        newBench[benchIndex] = player;
        return newBench;
      });

      // También quitar del campo si estaba ahí
      setPlayersInPositions(prev => {
        const newPositions = { ...prev };
        Object.keys(newPositions).forEach(key => {
          const posIdx = parseInt(key, 10);
          if (newPositions[posIdx]?.player_id === playerId) {
            delete newPositions[posIdx];
          }
        });
        return newPositions;
      });
    }
  };

  const handleRemoveBenchPlayer = (benchIndex: number) => {
    setPlayersInBench(prev => {
      const newBench = { ...prev };
      delete newBench[benchIndex];
      return newBench;
    });
  };

  const isPremium = manager?.is_premium === 1;
  const maxSlots = isPremium ? 5 : 3;

  // Cargar alineación al montar o cambiar de slot
  useEffect(() => {
    let cancelled = false;
    const loadLineup = async () => {
      if (!teamId || !players || players.length === 0) return;
      try {
        const response = await fetch(`/teams/${teamId}/lineup/${selectedSlot}`);
        const data = await response.json();
        if (!cancelled) {
          // LOGS para depuración
          console.log('teamId:', teamId);
          console.log('player_id de players:', players.map(p => p.player_id));
          if (data.lineup) {
            console.log('player_id de alineación (positions):', data.lineup.positions?.map((p: any) => p.player_id));
            console.log('player_id de alineación (substitutes):', data.lineup.substitutes?.map((s: any) => s.player_id));
          }
          if (data.success && data.lineup) {
            // Mapear posiciones
            const newPositions: { [key: number]: any } = {};
            if (data.lineup.positions && Array.isArray(data.lineup.positions)) {
              for (const pos of data.lineup.positions) {
                const player = players.find(p => p.player_id === pos.player_id);
                if (player) {
                  newPositions[pos.position_index] = player;
                } else {
                  console.warn(`Jugador con id ${pos.player_id} no encontrado en players`);
                }
              }
            }
            setPlayersInPositions(newPositions);
            // Mapear banquillo
            const newBench: { [key: number]: any } = {};
            if (data.lineup.substitutes && Array.isArray(data.lineup.substitutes)) {
              for (const sub of data.lineup.substitutes) {
                const player = players.find(p => p.player_id === sub.player_id);
                if (player) {
                  newBench[sub.bench_index] = player;
                } else {
                  console.warn(`Jugador suplente con id ${sub.player_id} no encontrado en players`);
                }
              }
            }
            setPlayersInBench(newBench);
            // Mapear órdenes tácticas
            const newOrders: { [key: number]: { zone: number; action: string } } = {};
            if (data.lineup.positions && Array.isArray(data.lineup.positions)) {
              for (const pos of data.lineup.positions) {
                if (pos.zone_orders && pos.zone_orders.zone && pos.zone_orders.action) {
                  newOrders[pos.position_index] = {
                    zone: pos.zone_orders.zone,
                    action: pos.zone_orders.action
                  };
                }
              }
            }
            setTacticalOrders(newOrders);
            setIsSaved(true);
            setIsDefaultSaved(data.lineup.is_default || false);
          } else {
            setPlayersInPositions({});
            setPlayersInBench({});
            setTacticalOrders({});
            setIsSaved(false);
            setIsDefaultSaved(false);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error cargando alineación:', error);
        }
      }
    };
    loadLineup();
    return () => { cancelled = true; };
  }, [selectedSlot, teamId, players]);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Alineaciones del Equipo</h1>
        <p className="text-muted-foreground">
          Configura tus alineaciones y órdenes tácticas
        </p>
      </div>

      {/* Botones de guardado + selector de alineación */}
      <div className="mb-6 flex gap-4 flex-wrap items-center">
        <Button
          onClick={handleSave}
          className={isSaved ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
        >
          {isSaved ? "Alineación Guardada" : "Guardar Alineación"}
        </Button>
        <Button
          onClick={handleSaveAsDefault}
          className={isDefaultSaved ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
        >
          {isDefaultSaved ? "Predeterminada Guardada" : "Guardar como Predeterminada"}
        </Button>

        <Select value={selectedSlot} onValueChange={setSelectedSlot}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar alineación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alineacion_1">Alineación 1</SelectItem>
            <SelectItem value="alineacion_2">Alineación 2</SelectItem>
            <SelectItem value="alineacion_3">Alineación 3</SelectItem>
            {isPremium && <SelectItem value="alineacion_4">Alineación 4 (Premium)</SelectItem>}
            {isPremium && <SelectItem value="alineacion_5">Alineación 5 (Premium)</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de jugadores - Izquierda */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Jugadores Disponibles ({players?.length || 0}/24)</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <p className="text-muted-foreground text-sm">Cargando jugadores...</p>
              ) : players && players.length > 0 ? (
                <div className="space-y-2">
                  {players.map((player) => {
                    const fullName = `${player.first_name || ''} ${player.last_name || ''}`.trim() || 'Sin nombre';

                    // Verificar si el jugador está en campo o banquillo
                    const isInField = Object.values(playersInPositions).some(p => p?.player_id === player.player_id);
                    const isInBench = Object.values(playersInBench).some(p => p?.player_id === player.player_id);
                    const isPlaced = isInField || isInBench;

                    return (
                      <HoverCard key={player.player_id} openDelay={200}>
                        <HoverCardTrigger asChild>
                          <div className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${isPlaced
                            ? 'bg-green-100 hover:bg-green-200 border-green-400'
                            : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                            }`}>
                            <div className="flex items-center gap-2">
                              <div
                                className="cursor-move hover:ring-2 hover:ring-blue-500 transition-all"
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('playerId', String(player.player_id));
                                  e.dataTransfer.setData('playerName', fullName);
                                  e.dataTransfer.effectAllowed = 'move';
                                }}
                                title={`Arrastrar ${fullName}`}
                              >
                                <PlayerAvatar player={player} size="sm" className="w-10 h-10" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{fullName}</p>
                                <p className="text-xs text-gray-600">Val: {player.rating || 0}</p>
                              </div>
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80" side="right">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">{fullName}</h4>
                            <div className="text-xs space-y-1">
                              <div className="font-semibold text-blue-600">Técnicas:</div>
                              <div className="grid grid-cols-2 gap-1">
                                <span>Definición: {player.finishing || 0}</span>
                                <span>Pase: {player.passing || 0}</span>
                                <span>Defensa: {player.defense || 0}</span>
                                <span>Regate: {player.dribbling || 0}</span>
                                <span>Cabeceo: {player.heading || 0}</span>
                                <span>Centros: {(player as any).crosses || 0}</span>
                                <span>Control balón: {(player as any).ball_control || 0}</span>
                                <span>Portería: {(player as any).goalkeeper || 0}</span>
                              </div>
                              <div className="font-semibold text-green-600 mt-2">Físicas:</div>
                              <div className="grid grid-cols-2 gap-1">
                                <span>Resistencia: {player.stamina || 0}</span>
                                <span>Velocidad: {player.pace || 0}</span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No hay jugadores disponibles</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Campo + Banquillo - Derecha */}
        <div className="lg:col-span-2">
          <Card className="bg-green-700">
            <CardHeader>
              <CardTitle className="text-white">Campo de Juego - Formación 1-4-4-2</CardTitle>
            </CardHeader>
            <CardContent>
              <PitchField
                onPositionClick={handlePositionClick}
                playersInPositions={playersInPositions}
                onPlayerDropped={handlePlayerDropped}
                onRemovePlayer={handleRemovePlayer}
              />
              <BenchSlots
                onSlotClick={handleBenchClick}
                playersInBench={playersInBench}
                onPlayerDropped={handleBenchPlayerDropped}
                onRemovePlayer={handleRemoveBenchPlayer}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo de órdenes tácticas */}
      <TacticalOrdersDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedPosition(null);
          setSelectedZone(null);
          setDialogStep('zone');
        }}
        step={dialogStep}
        playerName={
          selectedPosition !== null && playersInPositions[selectedPosition]
            ? `${playersInPositions[selectedPosition].first_name} ${playersInPositions[selectedPosition].last_name}`
            : undefined
        }
        onZoneSelect={handleZoneSelect}
        onActionSelect={handleActionSelect}
      />
    </div>
  );
};

export default TeamLineups;
