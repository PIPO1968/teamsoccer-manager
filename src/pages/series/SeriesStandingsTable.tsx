
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
  division?: number;
  groupNumber?: number;
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

const SeriesStandingsTable = ({ teams, division, groupNumber }: SeriesStandingsTableProps) => {
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);
  const displayed = teams.slice(0, 8);
  const isDiv1 = division === 1;
  const isDiv2g1 = division === 2 && groupNumber === 1;
  const isDiv2g2 = division === 2 && groupNumber === 2;

  const dot = (color: string, title: string, double = false) =>
    double
      ? <div className={`w-3 h-3 rounded-full border-2 ${color}`} title={title} />
      : <div className={`w-1.5 h-1.5 rounded-full ${color}`} title={title} />;

  const getDot = (pos: number) => {
    if (isDiv1) {
      if (pos === 1) return dot('bg-green-500', 'Champions Cup (next season)');
      if (pos === 2) return dot('bg-blue-500', 'TS Cup (next season)');
      if (pos === 5) return dot('bg-orange-500', 'Playoff vs 2nd Div II.2');
      if (pos === 6) return dot('bg-orange-500', 'Playoff vs 2nd Div II.1');
      if (pos === 7) return dot('border-red-500 bg-red-200', 'Relegation to Div II.1', true);
      if (pos === 8) return dot('border-red-500 bg-red-200', 'Relegation to Div II.2', true);
    }
    if (isDiv2g1) {
      if (pos === 1) return dot('bg-green-500', 'Promotion to Div I.1 (replaces 7th)');
      if (pos === 2) return dot('bg-blue-500', 'Playoff vs 6th of Div I.1');
      if (pos === 5 || pos === 6) return dot('bg-orange-500', 'Relegation playoff');
      if (pos === 7 || pos === 8) return dot('border-red-500 bg-red-200', 'Relegation to Div III', true);
    }
    if (isDiv2g2) {
      if (pos === 1) return dot('bg-green-500', 'Promotion to Div I.1 (replaces 8th)');
      if (pos === 2) return dot('bg-blue-500', 'Playoff vs 5th of Div I.1');
      if (pos === 5 || pos === 6) return dot('bg-orange-500', 'Relegation playoff');
      if (pos === 7 || pos === 8) return dot('border-red-500 bg-red-200', 'Relegation to Div III', true);
    }
    return null;
  };

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
          {displayed.map((team, i) => (
            <TableRow
              key={team.team_id}
              className={`cursor-pointer hover:bg-accent/50`}
              onMouseEnter={() => setHoveredTeam(team.team_id)}
              onMouseLeave={() => setHoveredTeam(null)}
            >
              <TableCell className="py-2">
                <div className="flex items-center gap-1">
                  {i + 1}
                  {getDot(i + 1)}
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
                      className={`w-4 h-4 flex items-center justify-center rounded text-[10px] font-medium ${result === "W"
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
