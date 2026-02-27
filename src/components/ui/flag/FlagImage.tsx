
import { useState, useEffect } from "react";
import { Flag as FlagIcon } from "lucide-react";
import { getCountryCode, getCountryNameById } from "@/utils/countries";
import { FlagProps } from "./types";
import { cn } from "@/lib/utils";

export function Flag({ country, countryId, className }: FlagProps) {
  const [imageError, setImageError] = useState(false);
  const [countryName, setCountryName] = useState<string | undefined>(country);
  const [isLoading, setIsLoading] = useState(countryId !== undefined && !country);
  
  useEffect(() => {
    // Reset state when props change
    setImageError(false);
    setCountryName(country);
    setIsLoading(countryId !== undefined && !country);
    
    // If countryId is provided but no country name, fetch the country name
    if (countryId && !country) {
      const fetchCountryName = async () => {
        try {
          const name = await getCountryNameById(countryId);
          setCountryName(name);
          setIsLoading(false);
        } catch (err) {
          console.error(`Error fetching country name for ID ${countryId}:`, err);
          setIsLoading(false);
          setImageError(true);
        }
      };
      
      fetchCountryName();
    }
  }, [countryId, country]);
  
  // Show loading state
  if (isLoading) {
    return <FlagIcon className={cn("h-4 w-4 text-muted-foreground animate-pulse", className)} />;
  }
  
  // Show placeholder for undefined country
  if (!countryName && !countryId) {
    return <FlagIcon className={cn("h-4 w-4 text-muted-foreground", className)} />;
  }
  
  // Get country code and create flag URL
  const countryCode = getCountryCode(countryName || '');
  const flagUrl = `https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`;

  // Handle error case
  if (imageError) {
    return <FlagIcon className={cn("h-4 w-4 text-muted-foreground", className)} aria-label={`${countryName || 'Unknown'} flag not found`} />;
  }

  return (
    <img 
      src={flagUrl} 
      alt={`${countryName} flag`}
      className={cn("max-w-[28px] max-h-[20px] object-contain rounded-sm inline-block", className)}
      onError={() => {
        console.log(`Flag not found for ${countryName} (code: ${countryCode})`);
        setImageError(true);
      }}
      aria-label={`${countryName} flag`}
    />
  );
}
