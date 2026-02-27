
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formations, tactics, attitudes } from "../utils/formationUtils";

interface FormationSettingsProps {
  selectedFormation: string;
  onFormationChange: (formation: string) => void;
}

const FormationSettings: React.FC<FormationSettingsProps> = ({
  selectedFormation,
  onFormationChange
}) => {
  return (
    <div className="flex gap-4 justify-between mb-4">
      <Select value={selectedFormation} onValueChange={onFormationChange}>
        <SelectTrigger className="w-32 bg-green-600 border-green-500 text-white">
          <SelectValue placeholder="Formation" />
        </SelectTrigger>
        <SelectContent>
          {formations.map((formation) => (
            <SelectItem key={formation.id} value={formation.id}>{formation.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex gap-2">
        <div>
          <p className="text-xs text-gray-100 mb-1">Tactics</p>
          <Select defaultValue="normal">
            <SelectTrigger className="w-32 bg-green-600 border-green-500 text-white">
              <SelectValue placeholder="Tactics" />
            </SelectTrigger>
            <SelectContent>
              {tactics.map((tactic) => (
                <SelectItem key={tactic.id} value={tactic.id}>{tactic.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <p className="text-xs text-gray-100 mb-1">Team Attitude</p>
          <Select defaultValue="normal">
            <SelectTrigger className="w-32 bg-green-600 border-green-500 text-white">
              <SelectValue placeholder="Attitude" />
            </SelectTrigger>
            <SelectContent>
              {attitudes.map((attitude) => (
                <SelectItem key={attitude.id} value={attitude.id}>{attitude.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FormationSettings;
