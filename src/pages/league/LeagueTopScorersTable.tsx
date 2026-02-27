
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { topScorers } from "@/mock/leagueData";
import { GAME_NAME } from "@/config/constants";

export default function LeagueTopScorersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Pos</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-center">Goals</TableHead>
          <TableHead className="text-center">Assists</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topScorers.map((player) => (
          <TableRow
            key={player.position}
            className={player.team === GAME_NAME ? "bg-primary/5" : undefined}
          >
            <TableCell>{player.position}</TableCell>
            <TableCell className={player.team === GAME_NAME ? "font-semibold" : undefined}>
              {player.player}
            </TableCell>
            <TableCell>{player.team}</TableCell>
            <TableCell className="text-center font-medium">{player.goals}</TableCell>
            <TableCell className="text-center">{player.assists}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
