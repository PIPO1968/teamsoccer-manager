import { PlayerAvatar } from "@/components/avatar/PlayerAvatar";

interface PlayerInBench {
  player_id: number;
  first_name: string;
  last_name: string;
  rating: number;
  avatar_seed?: string;
  avatar_hair_style?: number;
  avatar_hair_color?: number;
  avatar_skin_tone?: number;
  avatar_eye_style?: number;
  avatar_mouth_style?: number;
  avatar_eyebrows?: number;
}

interface BenchSlotsProps {
  onSlotClick?: (slotIndex: number) => void;
  playersInBench?: { [key: number]: PlayerInBench };
  onPlayerDropped?: (benchIndex: number, playerId: number) => void;
  onRemovePlayer?: (benchIndex: number) => void;
}

const BenchSlots = ({ onSlotClick, playersInBench = {}, onPlayerDropped, onRemovePlayer }: BenchSlotsProps) => {
  const slots = [
    { label: '1º POR', subtitle: 'Portero' },
    { label: '2º DEF', subtitle: 'Defensa' },
    { label: '3º LAT', subtitle: 'Lateral' },
    { label: '4º MC', subtitle: 'Mediocampista' },
    { label: '5º EXT', subtitle: 'Mediolateral/Extremo' },
    { label: '6º DEL', subtitle: 'Delantero' },
  ];

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2 text-white">Banquillo</h3>
      <div className="grid grid-cols-6 gap-2">
        {slots.map((slot, idx) => {
          const playerInThisBench = playersInBench[idx];

          return (
            <div
              key={idx}
              onClick={() => onSlotClick?.(idx)}
              onDoubleClick={() => {
                if (playerInThisBench && onRemovePlayer) {
                  onRemovePlayer(idx);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const playerId = e.dataTransfer.getData('playerId');
                if (playerId && onPlayerDropped) {
                  onPlayerDropped(idx, parseInt(playerId, 10));
                }
              }}
              className="bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-lg p-2 cursor-pointer transition-all min-h-[60px] flex flex-col items-center justify-center"
              title={playerInThisBench ? `${playerInThisBench.first_name} ${playerInThisBench.last_name} - Doble click para quitar` : slot.subtitle}
            >
              {playerInThisBench ? (
                <PlayerAvatar player={playerInThisBench as any} size="sm" className="w-10 h-10" />
              ) : (
                <>
                  <span className="text-xs font-bold text-white">{slot.label}</span>
                  <span className="text-[10px] text-white/70 mt-1 text-center">{slot.subtitle}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BenchSlots;
