
import { Button } from "@/components/ui/button";

interface ThreadErrorProps {
  onRetry: () => void;
}

export default function ThreadError({ onRetry }: ThreadErrorProps) {
  return (
    <div className="p-6 text-center text-destructive">
      <p>Error loading thread</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onRetry}
      >
        Try Again
      </Button>
    </div>
  );
}
