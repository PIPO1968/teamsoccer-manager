
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import PlayersList from "./PlayersList";
import { PlayerData } from "@/hooks/useTeamPlayers";

interface PlayersSideBarProps {
  players: PlayerData[];
  selectedPlayers: { [key: string]: PlayerData };
  onPlayerSelect: (player: PlayerData) => void;
  selectedPlayer: PlayerData | null;
}

const PlayersSideBar: React.FC<PlayersSideBarProps> = ({
  players,
  selectedPlayers,
  onPlayerSelect,
  selectedPlayer
}) => {
  const [sortBy, setSortBy] = useState<string>("rating");

  // Function to sort players based on selected criteria
  const getSortedPlayers = () => {
    if (!players) return [];
    
    return [...players].sort((a, b) => {
      switch(sortBy) {
        case "position":
          return a.position.localeCompare(b.position);
        case "name":
          return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
        case "form":
          return a.form.localeCompare(b.form);
        case "rating":
        default:
          return b.rating - a.rating;
      }
    });
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Players</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Sort by</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="position">Position</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="form">Form</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={() => setSortBy("rating")}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <PlayersList 
          players={getSortedPlayers()} 
          selectedPlayers={selectedPlayers}
          onPlayerSelect={onPlayerSelect}
          selectedPlayer={selectedPlayer}
        />
      </CardContent>
    </Card>
  );
};

export default PlayersSideBar;
