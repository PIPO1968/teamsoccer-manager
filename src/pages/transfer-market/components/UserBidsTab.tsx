
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBidOperations } from "@/hooks/transfer/useBidOperations";
import { formatMoney } from "../utils";
import { PlayerBid } from "../types";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export const UserBidsTab = () => {
  const [userBids, setUserBids] = useState<PlayerBid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserBids } = useBidOperations();
  const { t } = useLanguage();

  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  const fetchUserBids = useCallback(async () => {
    if (fetchInProgress.current) {
      console.log("Fetch already in progress, skipping");
      return;
    }

    fetchInProgress.current = true;

    if (isMounted.current) {
      setIsLoading(true);
    }

    try {
      console.log("Fetching user bids...");
      const bids = await getUserBids();
      console.log("Retrieved bids:", bids);
      if (isMounted.current) {
        setUserBids(bids);
      }
    } catch (error) {
      console.error("Error fetching user bids:", error);
    } finally {
      fetchInProgress.current = false;
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [getUserBids]);

  // Effect for initial data loading - run immediately when component mounts
  useEffect(() => {
    console.log("UserBidsTab mounted, fetching data immediately");
    isMounted.current = true;

    // Immediately fetch data on component mount
    fetchUserBids();

    return () => {
      console.log("UserBidsTab unmounting");
      isMounted.current = false;
    };
  }, [fetchUserBids]); // Add fetchUserBids to dependency array

  const getBidStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100">{t('transfer.statusPending')}</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100">{t('transfer.statusWon')}</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100">{t('transfer.statusLost')}</Badge>;
      case 'outbid':
        return <Badge variant="outline" className="bg-gray-100">{t('transfer.statusOutbid')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (deadlineDate < now) {
      return <Badge variant="outline" className="bg-red-100">{t('transfer.statusExpired')}</Badge>;
    }

    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${diffDays}d ${diffHours}h`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('transfer.yourBids')}</CardTitle>
            <CardDescription>{t('transfer.trackBids')}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUserBids()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('transfer.refresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">{t('transfer.loadingBids')}</span>
          </div>
        ) : userBids.length > 0 ? (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('transfer.colPlayer')}</TableHead>
                  <TableHead>{t('transfer.colTeam')}</TableHead>
                  <TableHead>{t('transfer.colYourBid')}</TableHead>
                  <TableHead>{t('transfer.colStatus')}</TableHead>
                  <TableHead>{t('transfer.colDeadline')}</TableHead>
                  <TableHead>{t('transfer.colBidDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userBids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium">
                      {bid.player_name ? (
                        <Link to={`/players/${bid.player_id}`} className="hover:underline text-blue-600">
                          {bid.player_name}
                        </Link>
                      ) : (
                        <div className="flex items-center text-amber-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {t('transfer.playerUnavailable')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {bid.seller_team_id ? (
                        <Link to={`/teams/${bid.seller_team_id}`} className="hover:underline text-blue-600">
                          {bid.seller_team_name || t('transfer.unknownTeam')}
                        </Link>
                      ) : (
                        <span className="text-gray-500">{t('transfer.unknownTeam')}</span>
                      )}
                    </TableCell>
                    <TableCell>{formatMoney(bid.bid_amount)}</TableCell>
                    <TableCell>{getBidStatusBadge(bid.status)}</TableCell>
                    <TableCell>
                      {bid.deadline ?
                        getDeadlineStatus(bid.deadline) :
                        <Badge variant="outline" className="bg-gray-100">{t('transfer.statusUnknown')}</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(bid.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('transfer.noBidsYet')}</p>
            <p className="mt-2">{t('transfer.browseBids')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
