
import { Link } from "react-router-dom";
import { StadiumData } from "@/hooks/useStadiumData";
import { TeamLeague } from "@/hooks/useTeamLeague";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountryName } from "@/utils/countries";

interface StadiumHeaderProps {
  stadium: StadiumData;
  league: TeamLeague | null;
}

export const StadiumHeader = ({ stadium, league }: StadiumHeaderProps) => {
  const { language } = useLanguage();
  const localizedCountry = stadium.country
    ? localizeCountryName(stadium.country, language)
    : null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-700">
        {stadium.stadium_name}
      </h1>
      <p className="text-gray-500">
        <Link
          to={`/team/${stadium.team_id}`}
          className="text-blue-600 hover:underline"
        >
          {stadium.team_name}
        </Link>
        {localizedCountry && (
          <>
            {" • "}
            <span>{localizedCountry}</span>
          </>
        )}
      </p>
    </div>
  );
};
