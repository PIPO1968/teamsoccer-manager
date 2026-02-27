
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MarketPlayer } from "../../types";

interface DialogActionsProps {
  player: MarketPlayer;
  onClose: () => void;
}

export const DialogActions = ({ player, onClose }: DialogActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between gap-4 mt-4">
      <Button 
        variant="outline"
        className="flex-1" 
        onClick={onClose}
      >
        Close
      </Button>
      <Button 
        className="flex-1" 
        onClick={() => {
          if (player?.id) {
            navigate(`/players/${player.id}`);
            onClose();
          }
        }}
      >
        <Tag className="h-4 w-4 mr-2" />
        View Full Profile
      </Button>
    </div>
  );
};
