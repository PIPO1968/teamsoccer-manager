
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Trophy } from "lucide-react";
import { useParams } from "react-router-dom";
import { useLeagueData } from "@/hooks/useLeagueData";

const LeagueFixtures = () => {
  const { leagueId } = useParams();
  const { league, isLoading } = useLeagueData(leagueId);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!league) {
    return <div>Series not found</div>;
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
            <BreadcrumbLink href={`/league/${leagueId}`}>{league.region_name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/league/${leagueId}/fixtures`}>Fixtures</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="teamsoccer-panel">
            <div className="teamsoccer-header flex items-center justify-between">
              <h2 className="text-white">Fixtures - {league.region_name} Division {league.division} - Group {league.group_number}</h2>
              <span className="text-sm text-white/80">Season {league.season}</span>
            </div>
            <CardContent className="p-4">
              <div className="text-sm">
                Coming soon: League fixtures will be displayed here
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
                <Link to={`/league/${leagueId}`} className="block text-sm text-primary hover:underline">Current standings</Link>
                <Link to={`/league/${leagueId}/fixtures`} className="block text-sm text-primary hover:underline">Fixtures</Link>
              </nav>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeagueFixtures;
