
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface MatchViewErrorProps {
  error?: string;
}

const MatchViewError = ({ error }: MatchViewErrorProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Match Details</h1>
        <p className="text-red-500">Error loading match details: {error || "Match not found"}</p>
      </div>
      <Button onClick={() => navigate("/matches")} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Matches
      </Button>
    </div>
  );
};

export default MatchViewError;
