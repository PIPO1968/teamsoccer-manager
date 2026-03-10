
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import PitchField from "@/components/lineups/PitchField";
import BenchSlots from "@/components/lineups/BenchSlots";
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

  const handleSave = () => {
    // TODO: Implementar guardado
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveAsDefault = () => {
    // TODO: Implementar guardado como predeterminada
    setIsDefaultSaved(true);
    setTimeout(() => setIsDefaultSaved(false), 2000);
  };

  const handlePositionClick = (zone: number, positionIndex: number) => {
    console.log(`Click en Zona ${zone}, Posición ${positionIndex}`);
    // TODO: Abrir pop-up para asignar jugador
  };

  const handleBenchClick = (slotIndex: number) => {
    console.log(`Click en banquillo slot ${slotIndex}`);
    // TODO: Abrir selector de jugador para banquillo
  };

  const handlePlayerDropped = (positionIndex: number, playerId: number) => {
    const player = players?.find(p => p.player_id === playerId);
    if (player) {
      setPlayersInPositions(prev => {
        // Buscar si el jugador ya está en otra posición y liberarla
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
    }
  };

  const handleRemovePlayer = (positionIndex: number) => {
    setPlayersInPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[positionIndex];
      return newPositions;
    });
  };

  const isPremium = manager?.is_premium === 1;
  const maxSlots = isPremium ? 5 : 3;

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
                    return (
                    <HoverCard key={player.player_id} openDelay={200}>
                      <HoverCardTrigger asChild>
                        <div className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-gray-300 transition-all cursor-pointer">
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
                  )})}
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
              <BenchSlots onSlotClick={handleBenchClick} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamLineups;
