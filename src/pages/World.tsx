
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag } from "@/components/ui/flag";
import { Link } from "react-router-dom";
import { useWorldStats } from "@/hooks/useWorldStats";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountryName } from "@/utils/countries";

const World = () => {
  const { stats, isLoading, error } = useWorldStats();
  const { t, language } = useLanguage();

  if (isLoading) return <div>{t('world.loading')}</div>;
  if (error) return <div>{t('world.error')}: {error}</div>;
  if (!stats) return <div>{t('world.noData')}</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('world.totalRegions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('world.totalManagers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalManagers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('world.totalTeams')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeams}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('world.leagues')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('world.colCountry')}</TableHead>
                <TableHead className="text-right">{t('world.colTeams')}</TableHead>
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
                      {localizeCountryName(league.region_name, language)}
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
