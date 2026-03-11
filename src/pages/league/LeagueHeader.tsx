
import { FlagWithTooltip } from "@/components/ui/flag";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountryName } from "@/utils/countries";

interface LeagueHeaderProps {
  regionName: string;
  regionId: number;
}

const LeagueHeader = ({ regionName, regionId }: LeagueHeaderProps) => {
  const { t, language } = useLanguage();
  return (
    <div className="flex items-center gap-2 mb-6">
      <FlagWithTooltip countryId={regionId} country={regionName} />
      <h1 className="text-2xl font-bold">{localizeCountryName(regionName, language)} {t('league.nationalLeague')}</h1>
    </div>
  );
};

export default LeagueHeader;
