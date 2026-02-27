
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Flag, FlagWithTooltip } from "@/components/ui/flag";
import { useFlagCollection } from "@/hooks/useFlagCollection";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamData } from "@/hooks/useTeamData";
import { Map } from "lucide-react";

const FlagCollection = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { allCountries, opponentCountries, playerCountries, followerCountries, isLoading } = useFlagCollection(teamId);
  const { team } = useTeamData(teamId);

  // Regular flag grid for players and followers
  const FlagGrid = ({ countries, title, description }: { 
    countries: { region_id: number; name: string }[]; 
    title: string;
    description: string;
  }) => (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-green-800 border-b border-green-200 pb-2 mb-4">{title}</h2>
      <p className="mb-4 text-gray-700">{description}</p>
      
      <div className="grid grid-cols-12 sm:grid-cols-16 md:grid-cols-24 gap-1">
        {countries.length > 0 ? (
          countries.map((country) => (
            <div 
              key={country.region_id}
              className="border border-gray-300 rounded flex items-center justify-center"
              style={{ width: '28px', height: '20px' }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <FlagWithTooltip countryId={country.region_id} country={country.name} />
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-gray-500 italic">No countries found</p>
        )}
      </div>
    </div>
  );

  // Compact flag grid for all countries, with visited ones highlighted
  const AllCountriesFlagGrid = ({ 
    allCountries, 
    visitedCountries, 
    title, 
    description 
  }: {
    allCountries: { region_id: number; name: string }[];
    visitedCountries: { region_id: number; name: string }[];
    title: string;
    description: string;
  }) => {
    const visitedIds = new Set(visitedCountries.map(c => c.region_id));
    const visitedCount = visitedIds.size;
    
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-green-800 border-b border-green-200 pb-2 mb-4">{title}</h2>
        <p className="mb-4 text-gray-700">{description}</p>
        
        <div className="grid grid-cols-16 sm:grid-cols-20 md:grid-cols-24 lg:grid-cols-30 gap-1">
          {allCountries.map((country) => {
            const isVisited = visitedIds.has(country.region_id);
            return (
              <Link 
                key={country.region_id}
                to={`/league/${country.region_id}`} 
                className={`border ${isVisited ? 'border-gray-300' : 'border-gray-200'} flex items-center justify-center`}
                title={`${country.name}${isVisited ? ' (visited)' : ''}`}
                style={{ width: '28px', height: '20px' }}
              >
                {isVisited ? (
                  <Flag countryId={country.region_id} country={country.name} />
                ) : (
                  <div className="grayscale opacity-40">
                    <Flag countryId={country.region_id} country={country.name} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <span className="text-lg font-medium">{visitedCount} of {allCountries.length} flags</span>
          <Link to={`/team/${teamId}/world-map`} className="text-green-700 hover:underline flex items-center gap-1">
            <Map className="h-4 w-4" />
            <span>Show on map</span>
          </Link>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-full" />
        <div className="grid grid-cols-12 gap-2">
          {[...Array(24)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Flag Collection</h1>
      <p className="text-lg text-gray-700 mb-4">
        View the international profile of {team ? (
          <Link to={`/team/${teamId}`} className="text-green-700 hover:underline font-medium">
            {team.name}
          </Link>
        ) : "this team"} through flags representing countries they've played against, player nationalities, and countries where followers are from.
      </p>

      <AllCountriesFlagGrid
        allCountries={allCountries}
        visitedCountries={opponentCountries}
        title="International Matches"
        description="This team has been visited by teams from the following countries for international friendly matches:"
      />

      <FlagGrid 
        countries={playerCountries}
        title="International Players"
        description="This team has players originating from the following countries:"
      />

      <FlagGrid 
        countries={followerCountries}
        title="Followers"
        description="This team is followed by users from the following countries:"
      />
    </div>
  );
};

export default FlagCollection;
