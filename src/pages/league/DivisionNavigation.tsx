
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { SeriesInfo } from "@/hooks/useLeagueHierarchy";

interface DivisionNavigationProps {
  currentSeries: SeriesInfo | null;
  higherSeries: SeriesInfo | null;
  lowerSeries: SeriesInfo | null;
}

const DivisionNavigation = ({ currentSeries, higherSeries, lowerSeries }: DivisionNavigationProps) => {
  if (!currentSeries) return null;

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-muted-foreground">
        Division {currentSeries.division} - Group {currentSeries.group_number}
        {currentSeries.division_level > 1 && ` (Level ${currentSeries.division_level})`}
      </div>
      <div className="flex gap-2">
        {higherSeries && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <Link to={`/league/${higherSeries.series_id}`}>
              <ArrowUp className="w-4 h-4 mr-1" />
              Division {higherSeries.division}
            </Link>
          </Button>
        )}
        {lowerSeries && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            <Link to={`/league/${lowerSeries.series_id}`}>
              <ArrowDown className="w-4 h-4 mr-1" />
              Division {lowerSeries.division}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default DivisionNavigation;
