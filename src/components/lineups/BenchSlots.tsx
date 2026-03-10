
interface BenchSlotsProps {
  onSlotClick?: (slotIndex: number) => void;
}

const BenchSlots = ({ onSlotClick }: BenchSlotsProps) => {
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
        {slots.map((slot, idx) => (
          <div
            key={idx}
            onClick={() => onSlotClick?.(idx)}
            className="bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-lg p-2 cursor-pointer transition-all min-h-[60px] flex flex-col items-center justify-center"
          >
            <span className="text-xs font-bold text-white">{slot.label}</span>
            <span className="text-[10px] text-white/70 mt-1 text-center">{slot.subtitle}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenchSlots;
