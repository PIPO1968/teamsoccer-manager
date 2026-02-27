
import { CircleSlash } from "lucide-react";

interface EmptyBidsStateProps {
  message?: string;
}

export const EmptyBidsState = ({ message = "You haven't placed any bids yet." }: EmptyBidsStateProps) => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <div className="flex justify-center mb-3">
        <CircleSlash className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <p>{message}</p>
      <p className="mt-2">Browse the transfer market to find players to bid on.</p>
    </div>
  );
};
