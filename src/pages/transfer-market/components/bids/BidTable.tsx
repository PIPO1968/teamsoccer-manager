
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlayerBid } from "../../types";
import { BidStatusBadge } from "./BidStatusBadge";
import { DeadlineDisplay } from "./DeadlineDisplay";
import { formatMoney } from "../../utils";
import { AlertTriangle, Eye } from "lucide-react";

interface BidTableProps {
  bids: PlayerBid[];
}

export const BidTable = ({ bids }: BidTableProps) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Your Bid</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Bid Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid) => (
            <TableRow key={bid.id}>
              <TableCell className="font-medium">
                {bid.player_name ? (
                  <Link to={`/players/${bid.player_id}`} className="hover:underline text-blue-600">
                    {bid.player_name}
                  </Link>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Player unavailable
                  </div>
                )}
              </TableCell>
              <TableCell>
                {bid.seller_team_id ? (
                  <Link to={`/teams/${bid.seller_team_id}`} className="hover:underline text-blue-600">
                    {bid.seller_team_name || "Unknown Team"}
                  </Link>
                ) : (
                  <span className="text-gray-500">Unknown Team</span>
                )}
              </TableCell>
              <TableCell>{formatMoney(bid.bid_amount)}</TableCell>
              <TableCell><BidStatusBadge status={bid.status} /></TableCell>
              <TableCell>
                <DeadlineDisplay deadline={bid.deadline} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(bid.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {bid.player_id && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    asChild
                  >
                    <Link to={`/players/${bid.player_id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
