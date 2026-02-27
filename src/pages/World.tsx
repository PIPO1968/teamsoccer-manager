
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag } from "@/components/ui/flag";
import { Link } from "react-router-dom";
import { useWorldStats } from "@/hooks/useWorldStats";

const World = () => {
  const { stats, isLoading, error } = useWorldStats();

  if (isLoading) return <div>Loading world statistics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No data available</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalManagers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeams}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>World Leagues</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Teams</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.leagues.map((league) => (
                <TableRow key={league.league_id}>
                  <TableCell>
                    <Link 
                      to={`/league/${league.league_id}`} 
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Flag countryId={league.region_id} />
                      {league.region_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{league.team_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default World;
