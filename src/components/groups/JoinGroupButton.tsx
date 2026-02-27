
import { Button } from "@/components/ui/button";

interface JoinGroupButtonProps {
  onClick: () => void;
}

export function JoinGroupButton({ onClick }: JoinGroupButtonProps) {
  return (
    <Button onClick={onClick} className="w-full">
      Request to Join Group
    </Button>
  );
}
