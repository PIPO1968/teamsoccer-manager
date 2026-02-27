
import { Button } from "@/components/ui/button";
import { Lock, LockOpen, Pin, PinOff } from "lucide-react";

interface ThreadHeaderProps {
  title: string;
  isAdmin: number;
  isLocked: boolean;
  isSticky: boolean;
  onToggleLock: (isLocked: boolean) => void;
  onToggleSticky: (threadId: number, isSticky: boolean) => void;
  threadId: number;
  toggleLockLoading: boolean;
}

export default function ThreadHeader({
  title,
  isAdmin,
  isLocked,
  isSticky,
  onToggleLock,
  onToggleSticky,
  threadId,
  toggleLockLoading
}: ThreadHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      
      {isAdmin > 0 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={toggleLockLoading}
            onClick={() => onToggleLock(!isLocked)}
            className="flex items-center gap-1"
          >
            {isLocked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {isLocked ? 'Unlock' : 'Lock'}
          </Button>
          
          <Button
            variant={isSticky ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleSticky(threadId, !isSticky)}
            className="flex items-center gap-1"
          >
            {isSticky ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            {isSticky ? 'Unstick' : 'Stick'}
          </Button>
        </div>
      )}
    </div>
  );
}
