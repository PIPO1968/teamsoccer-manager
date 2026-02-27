
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function TrainingPlayers() {
  const players = [
    "Percy Caetano",
    "Brian Iles",
    "Thomas Prior",
    "Jim Sherborn",
    "Declan Hoffmann",
    "Nicolas Sparrow"
  ];

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Training preview</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player name</TableHead>
            <TableHead>Training</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player}>
              <TableCell>{player}</TableCell>
              <TableCell>
                <div className="w-full h-6 bg-gray-100 rounded"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
