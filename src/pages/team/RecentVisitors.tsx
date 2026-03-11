
import { Card, CardContent } from "@/components/ui/card";
import { useTeamVisitors } from "@/hooks/useTeamVisitors";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface RecentVisitorsProps {
  teamId: string | undefined;
}

export default function RecentVisitors({ teamId }: RecentVisitorsProps) {
  const { data: visitors, isLoading } = useTeamVisitors(teamId);
  const { t } = useLanguage();

  if (isLoading) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          {t('team.recentVisitors')}
        </h2>
        <div className="space-y-2 text-sm">
          {visitors?.length ? (
            visitors.map((visitor) => (
              <div key={visitor.visitor_id} className="flex items-center justify-between">
                <Link
                  to={`/manager/${visitor.visitor_id}`}
                  className="text-green-700 hover:underline"
                >
                  {visitor.visitor_username}
                </Link>
                <span className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(visitor.visited_at), { addSuffix: true })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">{t('team.noRecentVisitors')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
