
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag } from "@/components/ui/flag";
import { ManagerStatusIndicators } from "@/components/manager/ManagerStatusIndicators";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WaitlistManager {
  user_id: number;
  username: string;
  email: string;
  country_id: number;
  country_name: string;
  team_name?: string;
  created_at: string;
  has_league_structure: boolean;
  is_admin: number;
  is_premium: number;
}

const WaitlistManagers = () => {
  const { manager } = useAuth();
  
  // Check if user has required admin level
  if (!manager?.is_admin || manager.is_admin <= 1) {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: waitlistManagers, isLoading, error } = useQuery({
    queryKey: ['waitlist-managers'],
    queryFn: async (): Promise<WaitlistManager[]> => {
      const { data, error } = await supabase
        .from('managers')
        .select(`
          user_id,
          username,
          email,
          country_id,
          created_at,
          is_admin,
          is_premium,
          leagues_regions!managers_country_id_fkey (name),
          teams (name)
        `)
        .eq('status', 'waiting_list')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching waitlist managers:', error);
        throw error;
      }

      // Check league structure for each manager's country
      const managersWithLeagueInfo = await Promise.all(
        data.map(async (manager) => {
          // Check if the country has a league structure
          const { data: leagueData, error: leagueError } = await supabase
            .from('leagues')
            .select('league_id')
            .eq('region_id', manager.country_id)
            .limit(1);

          if (leagueError) {
            console.error('Error checking league structure:', leagueError);
          }

          return {
            user_id: manager.user_id,
            username: manager.username,
            email: manager.email,
            country_id: manager.country_id,
            country_name: manager.leagues_regions?.name || 'Unknown',
            team_name: manager.teams?.[0]?.name,
            created_at: manager.created_at,
            has_league_structure: leagueData && leagueData.length > 0,
            is_admin: manager.is_admin || 0,
            is_premium: manager.is_premium || 0
          };
        })
      );

      return managersWithLeagueInfo;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/admin" className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/admin" className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-red-600">Error loading waitlist managers</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/admin" className="text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Users className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Waitlist Managers</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Managers in Waiting List ({waitlistManagers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {waitlistManagers && waitlistManagers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>League Structure</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitlistManagers.map((manager) => (
                  <TableRow key={manager.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Link to={`/manager/${manager.user_id}`}>{manager.username}</Link>
                        <ManagerStatusIndicators 
                          managerId={manager.user_id}
                          isPremium={manager.is_premium}
                          isAdmin={manager.is_admin}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Flag countryId={manager.country_id} className="max-w-[20px] max-h-[15px]" />
                        <span>{manager.country_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        manager.has_league_structure 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {manager.has_league_structure ? 'Available' : 'Missing'}
                      </span>
                    </TableCell>
                    <TableCell>{manager.team_name || 'No team'}</TableCell>
                    <TableCell>
                      {new Date(manager.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No managers in waitlist</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistManagers;
