
import { Button } from "@/components/ui/button";

interface JoinRoomButtonProps {
  onClick: () => void;
}

export function JoinRoomButton({ onClick }: JoinRoomButtonProps) {
  return (
    <Button onClick={onClick} className="w-full">
      Request to Join Room
    </Button>
  );
}
