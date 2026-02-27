
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MarketPlayer } from "../../types";

interface PlayerAttributesCardProps {
  player: MarketPlayer;
}

export const PlayerAttributesCard = ({ player }: PlayerAttributesCardProps) => {
  const toPercentage = (value: number) => (value / 20) * 100;
  
  const getStatColor = (value: number) => {
    if (value >= 15) return "bg-green-500";
    if (value >= 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Player Attributes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {player?.stats && Object.entries(player.stats).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium capitalize">{key}</span>
                <span className="text-sm text-muted-foreground">{value}/20</span>
              </div>
              <Progress value={toPercentage(value)} className="h-2" 
                style={{backgroundColor: 'rgba(0,0,0,0.1)'}}
              />
              <div className="h-2 -mt-2 z-10 bg-transparent overflow-hidden rounded-full">
                <div 
                  className={`h-full ${getStatColor(value)}`} 
                  style={{width: `${toPercentage(value)}%`}} 
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
