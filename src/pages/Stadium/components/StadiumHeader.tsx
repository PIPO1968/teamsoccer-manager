
import { Link } from "react-router-dom";
import { StadiumData } from "@/hooks/useStadiumData";
import { TeamLeague } from "@/hooks/useTeamLeague";

interface StadiumHeaderProps {
  stadium: StadiumData;
  league: TeamLeague | null;
}

export const StadiumHeader = ({ stadium, league }: StadiumHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-700">
        {stadium.stadium_name} <span className="text-lg font-normal">({stadium.stadium_id})</span>
      </h1>
      <p className="text-gray-500">
        <Link 
          to={`/team/${stadium.team_id}`} 
          className="text-blue-600 hover:underline"
        >
          {stadium.team_name}
        </Link>
        {stadium.country && (
          <>
            {" • "}
            <span>{stadium.country}</span>
          </>
        )}
      </p>
    </div>
  );
};
