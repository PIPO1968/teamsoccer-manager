
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamLeague } from "@/hooks/useTeamLeague";
import { toRomanNumeral } from "@/utils/romanNumerals";
import type { TeamData } from "@/hooks/useTeamData";

interface TeamInfoProps {
  team: TeamData | null;
  isLoading: boolean;
}

export default function TeamInfo({ team, isLoading }: TeamInfoProps) {
  const { league, isLoading: leagueLoading } = useTeamLeague(team?.team_id?.toString());

  if (isLoading) {
    return (
      <div className="flex flex-col items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5 mt-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center">
        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-300">
          <span className="text-white text-base font-bold">TM</span>
        </div>
        <div className="text-center mt-1">
          <span className="font-bold text-xs">No Team Found</span>
          <span className="block text-[10px] text-muted-foreground mt-0.5">Please create a team</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="aspect-square w-10 h-10 bg-white rounded-full border-2 flex items-center justify-center overflow-hidden">
        {team.club_logo ? (
          <img 
            src={team.club_logo} 
            alt={`${team.name} logo`} 
            className="max-w-full max-h-full object-contain" 
          />
        ) : (
          <div 
            className="rounded-full w-10 h-10 flex items-center justify-center bg-emerald-600"
          >
            <Shield className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      <div className="text-center mt-1">
        <Link to={`/team/${team.team_id}`} className="font-bold text-xs hover:underline">
          {team.name}
        </Link>
        {leagueLoading ? (
          <Skeleton className="h-3 w-24 mt-1" />
        ) : league ? (
          <Link 
            to={`/series/${league.series_id}`} 
            className="block text-[10px] text-muted-foreground mt-0.5 hover:underline"
          >
            {league.region_name} {toRomanNumeral(league.division)}.{league.group_number}
          </Link>
        ) : (
          <span className="block text-[10px] text-muted-foreground mt-0.5">
            No League Assigned
          </span>
        )}
      </div>
    </div>
  );
}
