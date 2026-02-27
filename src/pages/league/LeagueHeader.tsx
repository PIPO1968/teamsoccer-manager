
import { FlagWithTooltip } from "@/components/ui/flag";

interface LeagueHeaderProps {
  regionName: string;
  regionId: number;
}

const LeagueHeader = ({ regionName, regionId }: LeagueHeaderProps) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      <FlagWithTooltip countryId={regionId} country={regionName} />
      <h1 className="text-2xl font-bold">{regionName} National League</h1>
    </div>
  );
};

export default LeagueHeader;
