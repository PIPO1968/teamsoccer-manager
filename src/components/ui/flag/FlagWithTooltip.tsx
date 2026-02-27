
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Flag } from "./FlagImage";
import { FlagProps } from "./types";

interface FlagWithTooltipProps extends FlagProps {
  showTooltip?: boolean;
}

export function FlagWithTooltip({ country, countryId, className, showTooltip = true }: FlagWithTooltipProps) {
  if (!showTooltip) {
    return <Flag country={country} countryId={countryId} className={className} />;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Flag country={country} countryId={countryId} className={className} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{country || (countryId ? `Country ID: ${countryId}` : 'Unknown country')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
