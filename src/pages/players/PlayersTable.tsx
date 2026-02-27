
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Player = {
  id: number;
  name: string;
  position: string;
  age: number;
  nationality: string;
  rating: number;
  form: string;
  value: number;
  contract: string;
};

function getFormColor(form: string) {
  switch (form) {
    case "Excellent":
      return "bg-green-500 text-white";
    case "Good":
      return "bg-blue-500 text-white";
    case "Average":
      return "bg-yellow-500 text-black";
    case "Poor":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

function formatMoney(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else {
    return `$${(value / 1000).toFixed(0)}K`;
  }
}

interface PlayersTableProps {
  players: Player[];
}

const PlayersTable = ({ players }: PlayersTableProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Squad</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]"></TableHead>
              <TableHead className="w-[100px]">Position</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Contract</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map(player => (
              <TableRow key={player.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src="/teamsoccer-assets/848f6751-dbc0-4a55-a9c5-b33f9ba442b2.png" alt={player.name} />
                    <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{player.position}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <Link to={`/players/${player.id}`} className="hover:underline text-primary">
                    {player.name}
                  </Link>
                </TableCell>
                <TableCell>{player.age}</TableCell>
                <TableCell>{player.rating}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-xs ${getFormColor(player.form)}`}>
                    {player.form}
                  </span>
                </TableCell>
                <TableCell>{formatMoney(player.value)}</TableCell>
                <TableCell>Until {player.contract}</TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm" asChild>
                    <Link to={`/players/${player.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

export default PlayersTable;
