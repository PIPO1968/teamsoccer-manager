import { Trophy, Award, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type TeamTrophy = {
  trophy_id: number;
  name: string;
  description: string;
  season: number;
  earned_at: string;
  trophy_color: string;
  icon: number;
};

interface TeamAwardsProps {
  teamId?: string;
}

export function TeamAwards({ teamId }: TeamAwardsProps) {
  const [trophies, setTrophies] = useState<TeamTrophy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    async function fetchTeamTrophies() {
      if (!teamId) return;
      try {
        const response = await fetch(`/api/teams/${teamId}/trophies`);
        if (!response.ok) throw new Error('No se pudo obtener trofeos');
        const data = await response.json();
        const formattedTrophies = (data.trophies || []).map(trophy => ({
          trophy_id: trophy.trophy_id,
          name: trophy.name,
          description: trophy.description,
          season: trophy.season,
          earned_at: trophy.earned_at,
          trophy_color: trophy.trophy_color || '#FEF7CD',
          icon: trophy.icon || 0,
        }));
        setTrophies(formattedTrophies);
      } catch (error) {
        setTrophies([]);
      }
      setIsLoading(false);
    }
    fetchTeamTrophies();
  }, [teamId]);

  if (isLoading) {
    return null;
  }

  const renderIcon = (iconValue: number): LucideIcon => {
    switch (iconValue) {
      case 1:
        return Award;
      case 0:
      default:
        return Trophy;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-3">{t('team.awards')}</h2>
        {trophies.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('team.noAwards')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {trophies.map((trophy) => {
              const TrophyIcon = renderIcon(trophy.icon);
              return (
                <HoverCard key={`${trophy.trophy_id}-${trophy.season}`}>
                  <HoverCardTrigger asChild>
                    <button className="hover:text-yellow-500 transition-colors">
                      <TrophyIcon
                        className="h-6 w-6"
                        color={trophy.trophy_color}
                        fill={trophy.trophy_color}
                        strokeWidth={2}
                        stroke="#000000e6"  // Add a black outline
                      />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <div>
                        <h4 className="text-sm font-semibold">{trophy.name}</h4>
                        <p className="text-sm text-muted-foreground">{trophy.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Season {trophy.season}</p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
