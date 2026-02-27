
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Shield, Bot } from "lucide-react";

type SeriesTeamStats = {
  team_id: number;
  team_name: string;
  team_logo: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: string[];
  is_bot: number;
};

type SeriesStandingsTableProps = {
  teams: SeriesTeamStats[];
};

const TeamIcon = ({ team }: { team: SeriesTeamStats }) => {
  if (team.is_bot === 1) {
    return (
      <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center">
        <Bot className="w-3 h-3 text-white" />
      </div>
    );
  }

  if (team.team_logo) {
    return (
      <img 
        src={team.team_logo} 
        alt={`${team.team_name} logo`}
        className="w-5 h-5 rounded-full object-contain"
      />
    );
  }

  return (
    <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white">
      <Shield className="w-3 h-3" />
    </div>
  );
};

const SeriesStandingsTable = ({ teams }: SeriesStandingsTableProps) => {
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[40px]">#</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center w-[35px]">P</TableHead>
            <TableHead className="text-center w-[35px]">W</TableHead>
            <TableHead className="text-center w-[35px]">D</TableHead>
            <TableHead className="text-center w-[35px]">L</TableHead>
            <TableHead className="text-center w-[35px]">GF</TableHead>
            <TableHead className="text-center w-[35px]">GA</TableHead>
            <TableHead className="text-center w-[35px]">+/-</TableHead>
            <TableHead className="text-center w-[40px]">Pts</TableHead>
            <TableHead className="w-[100px]">Form</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, i) => (
            <TableRow 
              key={team.team_id} 
              className={`cursor-pointer hover:bg-accent/50`}
              onMouseEnter={() => setHoveredTeam(team.team_id)}
              onMouseLeave={() => setHoveredTeam(null)}
            >
              <TableCell className="py-2">
                <div className="flex items-center gap-1">
                  {i + 1}
                  {i < 2 && <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Promotion" />}
                  {i > teams.length - 4 && <div className="w-1.5 h-1.5 rounded-full bg-red-500" title="Relegation" />}
                </div>
              </TableCell>
              <TableCell className="py-2">
                <Link to={`/team/${team.team_id}`} className="block">
                  <div className="flex items-center gap-1.5">
                    <TeamIcon team={team} />
                    <span className="text-sm">{team.team_name}</span>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-center py-2 text-sm">{team.played}</TableCell>
              <TableCell className="text-center py-2 text-sm">{team.won}</TableCell>
              <TableCell className="text-center py-2 text-sm">{team.drawn}</TableCell>
              <TableCell className="text-center py-2 text-sm">{team.lost}</TableCell>
              <TableCell className="text-center py-2 text-sm">{team.goals_for}</TableCell>
              <TableCell className="text-center py-2 text-sm">{team.goals_against}</TableCell>
              <TableCell className="text-center py-2 text-sm font-medium">
                {team.goal_difference}
              </TableCell>
              <TableCell className="text-center py-2 text-sm font-medium">{team.points}</TableCell>
              <TableCell className="py-2">
                <div className="flex gap-0.5">
                  {team.form.map((result, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 flex items-center justify-center rounded text-[10px] font-medium ${
                        result === "W"
                          ? "bg-green-500 text-white"
                          : result === "D"
                          ? "bg-yellow-500 text-black"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SeriesStandingsTable;
