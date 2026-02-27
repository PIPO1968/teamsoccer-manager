
import { Search, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney } from "../utils";

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
  return (
    <>
      <div className="relative w-full md:w-auto flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search players..."
          className="pl-8"
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Select value={positionFilter} onValueChange={onPositionChange}>
            <SelectTrigger className="min-w-[130px]">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="GK">Goalkeeper</SelectItem>
              <SelectItem value="CB">Center Back</SelectItem>
              <SelectItem value="LB">Left Back</SelectItem>
              <SelectItem value="RB">Right Back</SelectItem>
              <SelectItem value="CDM">Def. Midfielder</SelectItem>
              <SelectItem value="CM">Midfielder</SelectItem>
              <SelectItem value="LM">Left Midfielder</SelectItem>
              <SelectItem value="RM">Right Midfielder</SelectItem>
              <SelectItem value="CAM">Att. Midfielder</SelectItem>
              <SelectItem value="LW">Left Wing</SelectItem>
              <SelectItem value="RW">Right Wing</SelectItem>
              <SelectItem value="ST">Striker</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="bg-accent px-4 py-2 rounded-md flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-green-500" />
            <span className="font-semibold">Budget:</span>
            <span className="ml-2 font-bold text-green-600">{formatMoney(teamBudget)}</span>
          </div>
        </div>
      </div>
    </>
  );
};
