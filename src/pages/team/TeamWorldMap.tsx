
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GlobeVisualization } from '@/components/globe/GlobeVisualization';
import { useFlagCollection } from '@/hooks/useFlagCollection';
import { useTeamData } from '@/hooks/useTeamData';
import { ChevronLeft } from 'lucide-react';

const TeamWorldMap = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { opponentCountries, playerCountries, followerCountries, isLoading } = useFlagCollection(teamId);
  const { team } = useTeamData(teamId);

  // Combine all countries for the visualization
  const allVisitedCountries = [
    ...opponentCountries,
    ...playerCountries,
    ...followerCountries
  ];
  
  // Remove duplicates
  const uniqueCountries = Array.from(
    new Map(allVisitedCountries.map(country => [country.region_id, country]))
  ).map(([, country]) => country);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-2 mb-4">
        <Link 
          to={`/team/${teamId}/flags`}
          className="flex items-center text-green-700 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Flag Collection</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-2">
        {team?.name || "Team"} World Map
      </h1>
      
      <p className="text-gray-600 mb-6">
        Interactive world map visualization of all countries connected to this team.
      </p>
      
      <div className="grid gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Global Presence</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[70vh] w-full relative">
              <GlobeVisualization 
                visitedCountries={uniqueCountries}
                className="h-full w-full" 
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Opponent Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{opponentCountries.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Player Nationalities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{playerCountries.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Follower Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{followerCountries.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TeamWorldMap;
