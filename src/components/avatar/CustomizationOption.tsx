
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomizationOptionProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  options?: string[];
}

export const CustomizationOption: React.FC<CustomizationOptionProps> = ({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 5,
  options = []
}) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="w-20 text-center text-sm px-2">
        {options.length > 0 ? options[value - min] || value : value}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
