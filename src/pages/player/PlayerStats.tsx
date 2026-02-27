
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PlayerStatsProps {
  stats: {
    finishing: number;
    pace: number;
    passing: number;
    defense: number;
    dribbling: number;
    heading: number;
    stamina: number;
  }
}

const PlayerStats = ({ stats }: PlayerStatsProps) => {
  // Convert stats to percentage (assuming max value is 20)
  const toPercentage = (value: number) => (value / 20) * 100;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Player Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(stats).map(([stat, value]) => (
          <div key={stat}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium capitalize">{stat}</span>
              <span className="text-sm text-muted-foreground">{value}/20</span>
            </div>
            <Progress 
              value={toPercentage(value)}
              className="h-2"
              indicatorClassName={value >= 15 ? "bg-green-500" : value >= 10 ? "bg-yellow-500" : "bg-red-500"}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
