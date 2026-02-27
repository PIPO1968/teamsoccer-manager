
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MatchesErrorProps {
  error: string;
}

export const MatchesError = ({ error }: MatchesErrorProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
        <p className="text-red-500">Error loading matches: {error}</p>
      </div>
      <Button onClick={() => navigate(-1)} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Go Back
      </Button>
    </div>
  );
};
