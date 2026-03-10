
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Trophy } from "lucide-react";
import { useParams } from "react-router-dom";
import { useLeagueData } from "@/hooks/useLeagueData";
import { useSeriesFixtures } from "@/hooks/useSeriesFixtures";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountryName } from "@/utils/countries";

const SeriesFixtures = () => {
  const { seriesId } = useParams();
  const { league, isLoading } = useLeagueData(seriesId);
  const { fixtures, isLoading: isFixturesLoading, error: fixturesError } = useSeriesFixtures(seriesId);
  const { language } = useLanguage();

  if (isLoading || isFixturesLoading) {
    return <div>Loading...</div>;
  }

  if (!league) {
    return <div>Series not found</div>;
  }
  if (fixturesError) {
    return <div>Error cargando fixtures: {fixturesError}</div>;
  }

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <Home className="h-3.5 w-3.5" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/series/${seriesId}`}>{localizeCountryName(league.region_name, language)}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/series/${seriesId}/fixtures`}>Fixtures</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="teamsoccer-panel">
            <div className="teamsoccer-header flex items-center justify-between">
              <h2 className="text-white">Fixtures - {localizeCountryName(league.region_name, language)} Division {league.division} - Group {league.group_number}</h2>
              <span className="text-sm text-white/80">Season {league.season}</span>
            </div>
            <CardContent className="p-4">
              <div className="space-y-6">
                {fixtures.length === 0 && (
                  <div className="text-sm">No hay partidos programados.</div>
                )}
                {fixtures.map((block, idx) => (
                  <div key={idx} className="mb-6">
                    {block.type === 'league' ? (
                      <div className="mb-2 font-semibold text-primary">
                        Jornada {block.round} <span className="text-xs text-muted-foreground">({new Date(block.date).toLocaleDateString()})</span>
                      </div>
                    ) : (
                      <div className="mb-2 font-semibold text-yellow-600">
                        Amistoso <span className="text-xs text-muted-foreground">({new Date(block.date).toLocaleDateString()})</span>
                      </div>
                    )}
                    <div className="space-y-1">
                      {block.matches.map(match => (
                        <div key={match.match_id} className="flex items-center justify-between bg-muted rounded px-2 py-1">
                          <span>{match.home_team_name} <span className="text-xs text-muted-foreground">vs</span> {match.away_team_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {match.status === 'finished' ? (
                              <>{match.home_score} - {match.away_score}</>
                            ) : (
                              <>{new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-2">
                <Link to={`/series/${seriesId}`} className="block text-sm text-primary hover:underline">Current standings</Link>
                <Link to={`/series/${seriesId}/fixtures`} className="block text-sm text-primary hover:underline">Fixtures</Link>
              </nav>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeriesFixtures;
