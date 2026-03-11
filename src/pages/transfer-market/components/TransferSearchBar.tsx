
import { Search, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney } from "../utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface TransferSearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  positionFilter: string;
  onPositionChange: (value: string) => void;
  teamBudget: number;
}

export const TransferSearchBar = ({
  searchTerm,
  onSearchChange,
  positionFilter,
  onPositionChange,
  teamBudget
}: TransferSearchBarProps) => {
  const { t } = useLanguage();

  return (
    <>
      <div className="relative w-full md:w-auto flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('transfer.searchPlayers')}
          className="pl-8"
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Select value={positionFilter} onValueChange={onPositionChange}>
            <SelectTrigger className="min-w-[130px]">
              <SelectValue placeholder={t('transfer.colPosition')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('transfer.allPositions')}</SelectItem>
              <SelectItem value="GK">{t('transfer.posGK')}</SelectItem>
              <SelectItem value="CB">{t('transfer.posCB')}</SelectItem>
              <SelectItem value="LB">{t('transfer.posLB')}</SelectItem>
              <SelectItem value="RB">{t('transfer.posRB')}</SelectItem>
              <SelectItem value="CDM">{t('transfer.posCDM')}</SelectItem>
              <SelectItem value="CM">{t('transfer.posCM')}</SelectItem>
              <SelectItem value="LM">{t('transfer.posLM')}</SelectItem>
              <SelectItem value="RM">{t('transfer.posRM')}</SelectItem>
              <SelectItem value="CAM">{t('transfer.posCAM')}</SelectItem>
              <SelectItem value="LW">{t('transfer.posLW')}</SelectItem>
              <SelectItem value="RW">{t('transfer.posRW')}</SelectItem>
              <SelectItem value="ST">{t('transfer.posST')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="bg-accent px-4 py-2 rounded-md flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-green-500" />
            <span className="font-semibold">{t('transfer.budget')}</span>
            <span className="ml-2 font-bold text-green-600">{formatMoney(teamBudget)}</span>
          </div>
        </div>
      </div>
    </>
  );
};
