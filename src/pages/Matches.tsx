
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTeamMatches } from "@/hooks/useTeamMatches";
import { useUserTeam } from "@/hooks/useUserTeam";
import { MatchesSection } from "./components/match/MatchesSection";
import { MatchesSkeleton } from "./components/match/MatchesSkeleton";
import { MatchesError } from "./components/match/MatchesError";
import { MatchFeatureBlocks } from "./components/match/MatchFeatureBlocks";
import { useCompleteCarnetTest } from '@/hooks/useManagerLicense';
import { useLanguage } from "@/contexts/LanguageContext";

const Matches = () => {
  useCompleteCarnetTest('visit_matches');
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // If no teamId is provided, we fetch the user's team
  const { team } = useUserTeam();

  // Use either the route param or the user's team ID, or fallback to "1"
  const effectiveTeamId = teamId || (team?.team_id?.toString());

  const { matches, isLoading, error } = useTeamMatches(effectiveTeamId);

  console.log("Current team ID:", effectiveTeamId);
  console.log("Matches data:", { matches, isLoading, error });

  if (isLoading) {
    return <MatchesSkeleton />;
  }

  if (error) {
    return <MatchesError error={error} />;
  }

  if (!effectiveTeamId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('matches.title')}</h1>
          <p className="text-muted-foreground">{t('matches.loading')}</p>
        </div>
      </div>
    );
  }

  const upcomingMatches = matches.filter(match => match.status === 'scheduled').slice().reverse();
  const pastMatches = matches.filter(match => match.status === 'completed');

  // Get the latest finished match (most recent)
  const latestMatch = pastMatches.length > 0 ? pastMatches[0] : null;

  // Get the earliest upcoming match (next match)
  const earliestUpcomingMatch = upcomingMatches.length > 0 ? upcomingMatches[upcomingMatches.length - 1] : null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('matches.currentMatches')}</h1>
          <p className="text-muted-foreground">
            {team && team.name
              ? `${team.name}`
              : t('matches.teamSchedule')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={() => navigate(`/team/${effectiveTeamId}/lineups`)}
          >
            ⚽ Alineaciones
          </Button>
          {teamId && team && teamId !== team.team_id.toString() && (
            <Button
              variant="outline"
              onClick={() => navigate(`/matches/${team.team_id}`)}
            >
              {t('matches.viewMyTeam')}
            </Button>
          )}
        </div>
      </div>

      {/* Feature blocks for latest and upcoming matches */}
      <MatchFeatureBlocks
        latestMatch={latestMatch}
        upcomingMatch={earliestUpcomingMatch}
      />

      {/* Upcoming Matches Section */}
      <MatchesSection
        title={t('matches.upcoming')}
        matches={upcomingMatches}
        emptyMessage={t('matches.noUpcoming')}
      />

      {/* Past Matches Section */}
      <MatchesSection
        title={t('matches.played')}
        matches={pastMatches}
        emptyMessage={t('matches.noPast')}
      />
    </div>
  );
};

export default Matches;
