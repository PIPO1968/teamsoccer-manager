
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"

interface PlayerStatsProps {
  stats: {
    finishing: number;
    pace: number;
    passing: number;
    defense: number;
    dribbling: number;
    heading: number;
    stamina: number;
    goalkeeper?: number;
    crosses?: number;
  }
}

const PlayerStats = ({ stats }: PlayerStatsProps) => {
  const { t } = useLanguage();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t('player.statsTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(stats).map(([stat, value]) => (
          <div key={stat}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{t(`player.skill.${stat}`)}</span>
              <span className="text-sm text-muted-foreground">{value}</span>
            </div>
            <Progress
              value={value}
              className="h-2"
              indicatorClassName={value >= 70 ? "bg-green-500" : value >= 45 ? "bg-yellow-500" : "bg-red-500"}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
