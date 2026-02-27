
import { useState, useEffect } from "react";
import { PlayerData } from "@/hooks/useTeamPlayers";

interface FormationManagementProps {
  selectedPlayers: {[key: string]: PlayerData};
  setSubstitutes: React.Dispatch<React.SetStateAction<PlayerData[]>>;
}

export const useFormationManagement = ({ selectedPlayers, setSubstitutes }: FormationManagementProps) => {
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");

  // Handle formation change
  const handleFormationChange = (formation: string) => {
    setSelectedFormation(formation);
    
    // Reset player assignments if formation changes dramatically
    const oldFormationParts = selectedFormation.split('-');
    const newFormationParts = formation.split('-');
    
    const oldDefenders = parseInt(oldFormationParts[0]);
    const oldMidfielders = parseInt(oldFormationParts[1]);
    const oldForwards = parseInt(oldFormationParts[2] || '0');
    
    const newDefenders = parseInt(newFormationParts[0]);
    const newMidfielders = parseInt(newFormationParts[1]);
    const newForwards = parseInt(newFormationParts[2] || '0');
    
    const newLineup = {...selectedPlayers};
    
    // Handle defenders
    if (newDefenders < oldDefenders) {
      // Remove excess defenders and move them to substitutes
      for (let i = newDefenders + 1; i <= oldDefenders; i++) {
        const position = `DEF${i}`;
        if (newLineup[position]) {
          setSubstitutes(prev => [...prev, newLineup[position]]);
          delete newLineup[position];
        }
      }
    }
    
    // Handle midfielders
    if (newMidfielders < oldMidfielders) {
      for (let i = newMidfielders + 1; i <= oldMidfielders; i++) {
        const position = `MID${i}`;
        if (newLineup[position]) {
          setSubstitutes(prev => [...prev, newLineup[position]]);
          delete newLineup[position];
        }
      }
    }
    
    // Handle forwards
    if (newForwards < oldForwards) {
      for (let i = newForwards + 1; i <= oldForwards; i++) {
        const position = `FWD${i}`;
        if (newLineup[position]) {
          setSubstitutes(prev => [...prev, newLineup[position]]);
          delete newLineup[position];
        }
      }
    }
    
    return newLineup;
  };

  return {
    selectedFormation,
    handleFormationChange
  };
};
