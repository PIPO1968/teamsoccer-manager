
import React from "react";
import { Progress } from "@/components/ui/progress";

interface MatchStatsProps {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
}

const MatchStats: React.FC<MatchStatsProps> = ({
  possession,
  shots,
  shotsOnTarget,
}) => (
  <div className="mt-6 grid grid-cols-3 gap-6">
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium">{possession.home}%</span>
        <span className="text-muted-foreground">Possession</span>
        <span className="font-medium">{possession.away}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${possession.home}%` }}
        ></div>
      </div>
    </div>
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium">{shots.home}</span>
        <span className="text-muted-foreground">Shots</span>
        <span className="font-medium">{shots.away}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{
            width: `${
              shots.home > 0
                ? (shots.home / (shots.home + shots.away)) * 100
                : 50
            }%`,
          }}
        ></div>
      </div>
    </div>
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium">{shotsOnTarget.home}</span>
        <span className="text-muted-foreground">On Target</span>
        <span className="font-medium">{shotsOnTarget.away}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{
            width: `${
              shotsOnTarget.home > 0
                ? (shotsOnTarget.home /
                    (shotsOnTarget.home + shotsOnTarget.away)) *
                  100
                : 50
            }%`,
          }}
        ></div>
      </div>
    </div>
  </div>
);

export default MatchStats;
