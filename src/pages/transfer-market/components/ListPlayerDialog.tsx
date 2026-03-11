
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTransferOperations } from "@/hooks/useTransferOperations";
import { Loader2 } from "lucide-react";
import { formatMoney } from "../utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface ListPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: {
    id: number;
    name: string;
    position: string;
    rating: number;
    value: number;
  };
  onSuccess?: () => void;
}

export const ListPlayerDialog = ({ open, onOpenChange, player, onSuccess }: ListPlayerDialogProps) => {
  const { listPlayerForSale, isProcessing } = useTransferOperations();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Set initial asking price to 20% above player value
  const suggestedPrice = Math.round(player.value * 1.2);
  const [askingPrice, setAskingPrice] = useState<number>(suggestedPrice);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/,/g, ''));
    if (!isNaN(value)) {
      setAskingPrice(value);
    }
  };

  const handleSubmit = async () => {
    // Validate asking price
    if (askingPrice < player.value * 0.5) {
      toast.error(`Asking price is too low (minimum: ${formatMoney(player.value * 0.5)})`);
      return;
    }

    if (askingPrice > player.value * 5) {
      toast.error(`Asking price is too high (maximum: ${formatMoney(player.value * 5)})`);
      return;
    }

    const success = await listPlayerForSale(player.id, askingPrice);
    if (success) {
      onOpenChange(false);
      toast.success(`${player.name} has been listed on the transfer market`);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/transfer-market');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('transfer.listPlayerTitle')}</DialogTitle>
          <DialogDescription>
            {t('transfer.enterAskingPrice')} {player.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="name">{t('transfer.colPlayer')}</Label>
            <div className="flex items-center gap-2">
              {player.name}
              <Badge variant="outline">{player.position}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="rating">{t('transfer.ratingLabel')}</Label>
            <div>{player.rating}</div>
          </div>

          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="value">{t('transfer.marketValue')}</Label>
            <div>{formatMoney(player.value)}</div>
          </div>

          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="asking-price">{t('transfer.askingPrice')}</Label>
            <Input
              id="asking-price"
              type="text"
              value={askingPrice.toLocaleString()}
              onChange={handlePriceChange}
              className="font-medium text-primary"
            />
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <p>{t('transfer.listingInfo')}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('transfer.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('transfer.processing')}
              </>
            ) : (
              t('transfer.listForSale')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
