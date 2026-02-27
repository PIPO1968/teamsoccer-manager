
import { Loader2 } from "lucide-react";

export const LoadingBidsState = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Loading your bids...</span>
    </div>
  );
};
