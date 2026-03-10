
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTeamPlayers } from "@/hooks/useTeamPlayers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PitchField from "@/components/lineups/PitchField";
import BenchSlots from "@/components/lineups/BenchSlots";
import { useAuth } from "@/contexts/AuthContext";

const TeamLineups = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { t } = useLanguage();
  const { manager } = useAuth();
  const { players, isLoading } = useTeamPlayers(teamId);
  const [isSaved, setIsSaved] = useState(false);
  const [isDefaultSaved, setIsDefaultSaved] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("alineacion_1");

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
                  {players.map((player) => (
                    <div
                      key={player.player_id}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-move border-2 border-gray-300 transition-all"
                      draggable
                      title={`${player.name} - ${player.position}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex-shrink-0 overflow-hidden">
                          {player.image_url ? (
                            <img src={player.image_url} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-white font-bold">
                              {player.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{player.name}</p>
                          <p className="text-xs text-gray-600">{player.position} • Val: {player.rating}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
              <PitchField onPositionClick={handlePositionClick} />
              <BenchSlots onSlotClick={handleBenchClick} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeamLineups;
