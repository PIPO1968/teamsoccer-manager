
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Loader2 } from "lucide-react";
import { useUserTeam } from "@/hooks/useUserTeam";
import { useTeamFinances } from "@/hooks/useTeamFinances";
import { useTransferOperations } from "@/hooks/useTransferOperations";
import { MarketPlayer } from "../types";
import { formatMoney } from "../utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface BuyPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: MarketPlayer | null;
  onSuccess: () => void;
}

export const BuyPlayerDialog = ({ open, onOpenChange, player, onSuccess }: BuyPlayerDialogProps) => {
  const { team } = useUserTeam();
  const { finances } = useTeamFinances(team?.team_id.toString());
  const { buyPlayer, isProcessing } = useTransferOperations();
  const { t } = useLanguage();
  const availableBudget = finances?.cash_balance || 0;

  const handleBuyPlayer = async () => {
    if (!player) return;

    const success = await buyPlayer(
      player.listing_id || { askingPrice: player.askingPrice },
      player.player_id || player.id,
      player.seller_team_id
    );

    if (success) {
      onSuccess();
    }
  };

  if (!player) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('transfer.buyPlayerTitle')}</DialogTitle>
          <DialogDescription>
            {t('transfer.confirmTransferPre')} {player.name} {t('transfer.toYourTeam')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-4 py-4">
          <div className="w-16 h-16 bg-team-primary rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{player.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{player.position}</Badge>
              <span className="text-sm text-muted-foreground">{player.nationality}</span>
              <span className="text-sm font-medium">{t('transfer.ratingLabel')}: {player.rating}</span>
            </div>
            <div className="mt-1">
              <span className="text-sm text-muted-foreground">{t('transfer.currentTeam')} </span>
              <span className="font-medium">{player.team}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-accent p-4 rounded-md">
            <p className="font-medium">{t('transfer.transferFee')}</p>
            <p className="text-2xl font-bold text-green-600">{formatMoney(player.askingPrice)}</p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-muted-foreground">{t('transfer.yourBudget')}</span>
              <span className="font-medium">{formatMoney(availableBudget)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('transfer.afterTransfer')}</span>
              <span className={`font-medium ${availableBudget < player.askingPrice ? 'text-red-600' : ''}`}>
                {formatMoney(availableBudget - player.askingPrice)}
              </span>
            </div>
          </div>

          {availableBudget < player.askingPrice && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {t('transfer.notEnoughBudget')}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('transfer.cancel')}
          </Button>
          <Button
            onClick={handleBuyPlayer}
            disabled={availableBudget < player.askingPrice || isProcessing}
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('transfer.completeTransfer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
