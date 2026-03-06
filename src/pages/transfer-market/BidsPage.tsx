
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BidTable } from "./components/bids/BidTable";
import { LoadingBidsState } from "./components/bids/LoadingBidsState";
import { EmptyBidsState } from "./components/bids/EmptyBidsState";
import { useTransferMarketAuth } from "@/hooks/transfer/useTransferMarketAuth";
import { useFetchUserBids } from "@/hooks/transfer/useFetchUserBids";
import { useLanguage } from "@/contexts/LanguageContext";

const BidsPage = () => {
  const navigate = useNavigate();
  const { isAuthorized, userTeam } = useTransferMarketAuth();
  const { userBids, isLoading, refetch } = useFetchUserBids();
  const { t } = useLanguage();

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
          {t('transfer.backToMarket')}
        </Button>
        <h1 className="text-2xl font-bold">{t('transfer.transferBids')}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('transfer.bidsMade')}</CardTitle>
              <CardDescription>{t('transfer.trackBids')}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch(true)}
              disabled={isLoading || !userTeam}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('transfer.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading
            ? <LoadingBidsState />
            : !userTeam
              ? <EmptyBidsState message={t('transfer.noTeamData')} />
              : userBids.length > 0
                ? <BidTable bids={userBids} />
                : <EmptyBidsState />}
        </CardContent>
      </Card>
    </div>
  );
};

export default BidsPage;
