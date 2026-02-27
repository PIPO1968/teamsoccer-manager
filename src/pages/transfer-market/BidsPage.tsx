
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BidTable } from "./components/bids/BidTable";
import { LoadingBidsState } from "./components/bids/LoadingBidsState";
import { EmptyBidsState } from "./components/bids/EmptyBidsState";
import { useTransferMarketAuth } from "@/hooks/transfer/useTransferMarketAuth";
import { useFetchUserBids } from "@/hooks/transfer/useFetchUserBids";

const BidsPage = () => {
  const navigate = useNavigate();
  const { isAuthorized, userTeam } = useTransferMarketAuth();
  const { userBids, isLoading, refetch } = useFetchUserBids();

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/transfer-market')}
          className="mr-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Market
        </Button>
        <h1 className="text-2xl font-bold">Your Transfer Bids</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bids Made</CardTitle>
              <CardDescription>Track the status of your transfer market bids</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch(true)}
              disabled={isLoading || !userTeam}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading 
            ? <LoadingBidsState />
            : !userTeam
              ? <EmptyBidsState message="No team data available" />
              : userBids.length > 0
                ? <BidTable bids={userBids} />
                : <EmptyBidsState />}
        </CardContent>
      </Card>
    </div>
  );
};

export default BidsPage;
