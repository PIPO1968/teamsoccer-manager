
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const MatchViewLoading = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/matches">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matches
          </Link>
        </Button>
        <Skeleton className="h-8 w-48" />
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            <Skeleton className="h-40 w-full max-w-md" />
            <div className="grid grid-cols-2 gap-8 w-full max-w-md">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchViewLoading;
