
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TacticalOrdersDialogProps {
  open: boolean;
  onClose: () => void;
  step: 'zone' | 'action';
  playerName?: string;
  onZoneSelect: (zone: number) => void;
  onActionSelect: (action: string) => void;
}

const ZONES = [
  { id: 1, name: 'Zona Ultradefensiva', color: 'bg-blue-900' },
  { id: 2, name: 'Zona Defensiva', color: 'bg-blue-700' },
  { id: 3, name: 'Zona Media', color: 'bg-yellow-600' },
  { id: 4, name: 'Zona Ofensiva', color: 'bg-orange-600' },
  { id: 5, name: 'Zona Finalización', color: 'bg-red-600' },
];

const ACTIONS = [
  { id: 'despejar', name: 'Despejar', icon: '🦶' },
  { id: 'pasar', name: 'Pasar', icon: '⚽' },
  { id: 'regatear', name: 'Regatear', icon: '🏃' },
  { id: 'centrar', name: 'Centrar', icon: '📐' },
  { id: 'finalizar', name: 'Finalizar', icon: '🎯' },
];

const TacticalOrdersDialog = ({
  open,
  onClose,
  step,
  playerName,
  onZoneSelect,
  onActionSelect,
}: TacticalOrdersDialogProps) => {
  if (step === 'zone') {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Selecciona Zona - {playerName || 'Jugador'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 py-4">
            {ZONES.map((zone) => (
              <Button
                key={zone.id}
                onClick={() => onZoneSelect(zone.id)}
                className={`${zone.color} hover:opacity-80 text-white h-16 text-lg font-semibold`}
              >
                {zone.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Selecciona Acción - {playerName || 'Jugador'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {ACTIONS.map((action) => (
            <Button
              key={action.id}
              onClick={() => onActionSelect(action.id)}
              className="bg-green-600 hover:bg-green-700 text-white h-20 flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-semibold">{action.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TacticalOrdersDialog;
