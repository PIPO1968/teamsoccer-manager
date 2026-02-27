
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface Series {
  series_id: number;
  division: number;
  group_number: number;
  team_count: number;
}

interface SeriesListProps {
  series: Series[];
}

const SeriesList = ({ series }: SeriesListProps) => {
  // Group series by division
  const seriesByDivision = series.reduce((acc, s) => {
    const division = s.division;
    if (!acc[division]) {
      acc[division] = [];
    }
    acc[division].push(s);
    return acc;
  }, {} as Record<number, Series[]>);

  // Sort divisions in ascending order
  const sortedDivisions = Object.keys(seriesByDivision)
    .map(Number)
    .sort((a, b) => a - b);

  // Track open state for each division - initialize all to collapsed (false)
  const [openDivisions, setOpenDivisions] = useState<Record<number, boolean>>(
    Object.fromEntries(sortedDivisions.map(div => [div, false]))
  );

  const toggleDivision = (division: number) => {
    setOpenDivisions(prev => ({
      ...prev,
      [division]: !prev[division]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Series Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedDivisions.map(division => (
          <Collapsible
            key={division}
            open={openDivisions[division]}
            onOpenChange={() => toggleDivision(division)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between p-2 bg-slate-100 hover:bg-slate-200 rounded-md">
              <span className="font-medium">Division {division}</span>
              {openDivisions[division] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {seriesByDivision[division]
                .sort((a, b) => a.group_number - b.group_number)
                .map((s) => (
                  <Link
                    key={s.series_id}
                    to={`/series/${s.series_id}`}
                    className="flex items-center justify-between p-3 ml-4 bg-gray-50 hover:bg-gray-100 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Group {s.group_number}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {s.team_count} teams
                    </div>
                  </Link>
                ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};

export default SeriesList;
