
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MatchViewHeaderProps {
  homeTeamName: string;
  awayTeamName: string;
}

const MatchViewHeader = ({ homeTeamName, awayTeamName }: MatchViewHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/matches">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Matches
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">
        {homeTeamName} vs {awayTeamName}
      </h1>
    </div>
  );
};

export default MatchViewHeader;
