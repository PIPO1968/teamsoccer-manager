
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { PlayerBid } from "../../types";
import { formatMoney } from "../../utils";
import { Link } from "react-router-dom";

interface BidsTableProps {
  bids: PlayerBid[];
  loading: boolean;
}

export const BidsTable = ({ bids, loading }: BidsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bids ({bids.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : bids.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>
                    {bid.bidder_team_id ? (
                      <Link to={`/teams/${bid.bidder_team_id}`} className="hover:underline text-blue-600">
                        {bid.bidder_name}
                      </Link>
                    ) : (
                      bid.bidder_name
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{formatMoney(bid.bid_amount)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      bid.status === 'pending' ? 'outline' : 
                      bid.status === 'accepted' ? 'default' : 
                      bid.status === 'outbid' ? 'secondary' : 
                      'destructive'
                    }>
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(bid.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No bids have been placed on this player yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
