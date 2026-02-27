
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Link } from "react-router-dom";
import { SeriesInfo } from "@/hooks/useLeagueHierarchy";
import { toRomanNumeral } from "@/utils/romanNumerals";

interface DivisionNavigationProps {
  currentSeries: SeriesInfo | null;
  higherSeries: SeriesInfo | null;
  lowerSeries: SeriesInfo | null;
}

const DivisionNavigation = ({
  currentSeries,
  higherSeries,
  lowerSeries
}: DivisionNavigationProps) => {
  if (!currentSeries) {
    return null;
  }

  return (
    <div className="flex justify-end mb-4">
      <div className="flex gap-2">
        {higherSeries && (
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/series/${higherSeries.series_id}`}>
              <ArrowUp className="h-3.5 w-3.5 mr-1" />
              <span>{toRomanNumeral(higherSeries.division)}</span>
            </Link>
          </Button>
        )}
        
        {lowerSeries && (
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to={`/series/${lowerSeries.series_id}`}>
              <ArrowDown className="h-3.5 w-3.5 mr-1" />
              <span>{toRomanNumeral(lowerSeries.division)}.{lowerSeries.group_number}</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default DivisionNavigation;
