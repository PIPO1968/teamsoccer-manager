
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { TeamMatch } from "@/hooks/useTeamMatches";
import { CompactMatchCard } from "./CompactMatchCard";

interface MatchesSectionProps {
  title: string;
  matches: TeamMatch[];
  emptyMessage: string;
}

export const MatchesSection = ({ title, matches, emptyMessage }: MatchesSectionProps) => {
  const [showScores, setShowScores] = useState(false);
  
  // Only show the toggle for completed matches (played matches)
  const isPlayedMatches = title.toLowerCase().includes("played");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {isPlayedMatches && matches.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScores(!showScores)}
            className="flex items-center gap-2"
          >
            {showScores ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Scores
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Scores
              </>
            )}
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="p-0">
          {matches.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{emptyMessage}</p>
          ) : (
            <div>
              {matches.map(match => (
                <CompactMatchCard 
                  key={match.match_id} 
                  match={match} 
                  hideScores={isPlayedMatches && !showScores}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
