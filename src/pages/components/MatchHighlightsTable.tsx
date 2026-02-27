
import { MatchHighlight } from "@/hooks/useMatchDetails";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface MatchHighlightsTableProps {
  highlights: MatchHighlight[];
  homeTeamName: string;
  awayTeamName: string;
}

const MatchHighlightsTable = ({ highlights, homeTeamName, awayTeamName }: MatchHighlightsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Minute</TableHead>
          <TableHead>Event</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Team</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {highlights.map((highlight, index) => (
          <TableRow key={index}>
            <TableCell>{highlight.minute}'</TableCell>
            <TableCell>
              <Badge variant={
                highlight.event_type === 'goal' ? 'default' : 
                highlight.event_type === 'red_card' ? 'destructive' : 'outline'
              }>
                {highlight.event_type.replace('_', ' ')}
              </Badge>
            </TableCell>
            <TableCell>{highlight.player_name}</TableCell>
            <TableCell>{highlight.team === 'home' ? homeTeamName : awayTeamName}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MatchHighlightsTable;
