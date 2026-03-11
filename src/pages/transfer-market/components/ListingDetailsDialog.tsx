
import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MarketPlayer, PlayerBid } from "../types";
import { useBidOperations } from "@/hooks/transfer/useBidOperations";
import { PlayerInfoCard } from "./details/PlayerInfoCard";
import { PlayerAttributesCard } from "./details/PlayerAttributesCard";
import { BidsTable } from "./details/BidsTable";
import { DialogActions } from "./details/DialogActions";
import { useLanguage } from "@/contexts/LanguageContext";

interface ListingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: MarketPlayer;
}

export const ListingDetailsDialog = ({ open, onOpenChange, player }: ListingDetailsDialogProps) => {
  const [bids, setBids] = useState<PlayerBid[]>([]);
  const [loading, setLoading] = useState(false);
  const { getListingBids } = useBidOperations();
  const { t } = useLanguage();
  
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);
  const hasLoaded = useRef(false);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    if (!open) {
      hasLoaded.current = false;
    }
  }, [open]);
  
  useEffect(() => {
    const loadBids = async () => {
      if (!player?.listing_id || !open || fetchInProgress.current || hasLoaded.current) {
        return;
      }
      
      fetchInProgress.current = true;
      if (isMounted.current) {
        setLoading(true);
      }
      
      try {
        const listingBids = await getListingBids(player.listing_id);
        if (isMounted.current) {
          setBids(Array.isArray(listingBids) ? listingBids : []);
          hasLoaded.current = true;
        }
      } catch (error) {
        console.error("Error loading bids:", error);
      } finally {
        fetchInProgress.current = false;
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    if (open) {
      loadBids();
    }
  }, [player?.listing_id, getListingBids, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {player?.name || t('transfer.playerDetails')}
            <Badge className="ml-2">{player?.position || t('transfer.statusUnknown')}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <PlayerInfoCard player={player} />
            <PlayerAttributesCard player={player} />
          </div>
          
          <BidsTable bids={bids} loading={loading} />

          <DialogActions player={player} onClose={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
