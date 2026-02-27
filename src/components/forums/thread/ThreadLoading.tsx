
import { Skeleton } from "@/components/ui/skeleton";

export default function ThreadLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-48 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
