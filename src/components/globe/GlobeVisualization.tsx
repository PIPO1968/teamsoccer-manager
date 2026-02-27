import { useState } from 'react';
import WorldMap from 'react-svg-worldmap';
import { cn } from '@/lib/utils';
import { CountryData } from '@/utils/countries';
import { getCountryCode } from '@/utils/countries/codes';
import { MouseEvent } from 'react';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// Define the type for the country context based on the react-svg-worldmap package
interface CountryContext<T> {
  countryCode: string;
  countryName: string;
  color: string;
  value?: T;
}

interface GlobeVisualizationProps {
  visitedCountries: CountryData[];
  className?: string;
}

export function GlobeVisualization({ visitedCountries, className }: GlobeVisualizationProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  // Format data for the WorldMap component
  const mapData = visitedCountries.map(country => {
    // Convert our country data to the format required by react-svg-worldmap
    // The package expects { country: "CountryCode", value: number }
    let countryCode = getCountryCode(country.name);
    
    // Special handling for England - use GB for world map
    if (countryCode === "gb-eng") {
      countryCode = "gb";
    }
    
    return {
      country: countryCode.toUpperCase(),
      value: 1, // We just want to highlight it, value could represent intensity if needed
    };
  }).filter(item => item.country !== ""); // Filter out any countries we couldn't map

  // Styling for the map
  const mapStyles = {
    defaultColor: "#D6D6DA", // Default color for countries
    selectedColor: "#2233ff", // Color when a country is selected
    hoverColor: "#3B82F6", // Color when hovering over a country
    pressColor: "#2233ff", // Color when pressing on a country
  };
  
  // Custom callback when a country is selected - updated type signature
  const handleCountryClick = (context: CountryContext<number> & { event: MouseEvent<SVGElement, Event> }) => {
    setSelectedCountry(context.countryName);
  };

  // Custom tooltip text function - will now show name for all countries
  const getTooltipText = (context: CountryContext<number>): string => {
    return context.countryName;
  };

  return (
    <div 
      className={cn("w-full h-full rounded-lg overflow-hidden relative", className)}
      aria-label="World map visualization of visited countries"
    >
      <div className="w-full h-full flex items-center justify-center">
        <WorldMap
          color="#3B82F6"
          tooltipBgColor="#333"
          tooltipTextColor="#fff"
          valueSuffix="points"
          size="responsive"
          data={mapData}
          borderColor="#152538"
          backgroundColor="transparent"
          tooltipTextFunction={getTooltipText}
          styleFunction={(country) => {
            const isVisited = mapData.some(item => item.country === country.countryCode);
            return {
              fill: isVisited ? "#3B82F6" : "#D6D6DA",
              stroke: "#152538",
              strokeWidth: 0.5,
              strokeOpacity: 0.2,
              cursor: "pointer",
              // Make sure all countries have the same tooltip behavior
              fillOpacity: 1,
              tooltipText: country.countryName
            };
          }}
          onClickFunction={handleCountryClick}
        />
      </div>
      
      {selectedCountry && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 bg-green-50 text-green-800 rounded-md">
          Selected: {selectedCountry}
        </div>
      )}
    </div>
  );
}
