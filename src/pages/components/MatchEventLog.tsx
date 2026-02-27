
import React from "react";
import { Info, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MatchEvent {
  minute: number;
  type: string;
  team: "home" | "away";
  player?: string;
  description: string;
}

interface MatchEventLogProps {
  matchEvents: MatchEvent[];
  currentHighlight: number | null;
  isFullTime: boolean;
  playerPerformances: { [key: string]: number };
  matchRating: number;
  setShowTacticsDialog: (v: boolean) => void;
  setCurrentHighlight: (idx: number | null) => void;
}

const MatchEventLog: React.FC<MatchEventLogProps> = ({
  matchEvents,
  currentHighlight,
  isFullTime,
  playerPerformances,
  matchRating,
  setShowTacticsDialog,
  setCurrentHighlight,
}) => (
  <>
    <CardTitle>Match Events</CardTitle>
    <div id="match-events" className="h-[400px] overflow-y-auto space-y-4">
      {matchEvents.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <Info className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No match events yet.</p>
          <p className="text-sm">Press play to start the match.</p>
        </div>
      ) : (
        matchEvents.map((event, index) => (
          <div
            key={index}
            className={cn(
              "p-2 rounded-md border-l-4",
              event.type === "goal"
                ? "border-green-500 bg-green-500/10"
                : event.type === "foul" || event.type === "card"
                ? "border-yellow-500 bg-yellow-500/10"
                : event.type === "injury"
                ? "border-red-500 bg-red-500/10"
                : event.type === "substitution"
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-300 bg-gray-100/50",
              currentHighlight === index ? "ring-2 ring-offset-1 ring-primary" : ""
            )}
            onClick={() => setCurrentHighlight(index)}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold">{event.minute}'</span>
              <span
                className={cn(
                  "text-xs px-1 py-0.5 rounded",
                  event.team === "home"
                    ? "bg-primary text-primary-foreground"
                    : "bg-team-primary text-white"
                )}
              >
                {event.team === "home" ? "SF" : "OPP"}
              </span>
            </div>
            <p className="text-sm mt-1">{event.description}</p>
          </div>
        ))
      )}
    </div>
    {/* Team tactics button */}
    {!isFullTime && (
      <Button
        variant="outline"
        className="w-full mt-4"
        onClick={() => setShowTacticsDialog(true)}
      >
        Team Tactics
      </Button>
    )}
    {isFullTime && (
      <div className="mt-4 p-4 border rounded-md">
        <h4 className="font-bold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Match Rating
        </h4>
        <div className="mt-2">
          <div className="flex justify-between">
            <span className="text-sm">Rating:</span>
            <span className="font-bold">{matchRating.toFixed(1)}/10</span>
          </div>
          <Progress className="h-2 mt-1" value={matchRating * 10} />
        </div>
        <h4 className="font-bold flex items-center gap-2 mt-4">
          <Users className="h-4 w-4 text-blue-500" />
          Player Performances
        </h4>
        <div className="mt-2 space-y-2 max-h-[100px] overflow-y-auto">
          {Object.entries(playerPerformances)
            .sort(([, a], [, b]) => b - a)
            .map(([player, goals], i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{player}</span>
                <span>
                  {goals} {goals === 1 ? "goal" : "goals"}
                </span>
              </div>
            ))}
          {Object.keys(playerPerformances).length === 0 && (
            <p className="text-sm text-muted-foreground">No goals scored</p>
          )}
        </div>
      </div>
    )}
  </>
);

export default MatchEventLog;
