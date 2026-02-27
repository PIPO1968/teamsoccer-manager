
interface LeagueStatsProps {
  totalTeams: number;
  totalManagers: number;
  totalSeries: number;
}

const LeagueStats = ({ totalTeams, totalManagers, totalSeries }: LeagueStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="text-sm text-muted-foreground">Total Teams</div>
        <div className="text-2xl font-bold">{totalTeams}</div>
      </div>
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="text-sm text-muted-foreground">Total Managers</div>
        <div className="text-2xl font-bold">{totalManagers}</div>
      </div>
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <div className="text-sm text-muted-foreground">Total Series</div>
        <div className="text-2xl font-bold">{totalSeries}</div>
      </div>
    </div>
  );
};

export default LeagueStats;
