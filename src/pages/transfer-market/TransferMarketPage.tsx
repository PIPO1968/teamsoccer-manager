
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TransferMarketHeader } from "./components/TransferMarketHeader";
import { TransferSearchBar } from "./components/TransferSearchBar";
import { useUserTeam } from "@/hooks/useUserTeam";
import { useTeamFinances } from "@/hooks/useTeamFinances";
import { MarketListingsTab } from "./components/MarketListingsTab";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";
import { useCompleteCarnetTest } from '@/hooks/useManagerLicense';

const TransferMarketPage = () => {
  useCompleteCarnetTest('visit_transfer_market');
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const { team } = useUserTeam();
  const { finances } = useTeamFinances(team?.team_id?.toString());
  const navigate = useNavigate();
  
  return (
    <div className="space-y-8">
      <TransferMarketHeader />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <TransferSearchBar 
          searchTerm={searchTerm} 
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          positionFilter={positionFilter}
          onPositionChange={setPositionFilter}
          teamBudget={finances?.cash_balance || 0}
        />
        
        <Button 
          variant="outline"
          onClick={() => navigate(`/bids/${team?.team_id}`)}
          className="ml-auto flex items-center"
        >
          <Inbox className="mr-2 h-4 w-4" />
          Your Bids
        </Button>
      </div>
      
      <div className="space-y-4">
        <MarketListingsTab 
          searchTerm={searchTerm}
          positionFilter={positionFilter}
        />
      </div>
    </div>
  );
};

export default TransferMarketPage;
