
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeamData } from "@/hooks/useTeamData";
import TeamHeader from "./team/TeamHeader";
import TeamSidebar from "./team/TeamSidebar";
import ClubDetails from "./team/ClubDetails";
import TeamGuestbook from "./team/TeamGuestbook";
import { useCompleteCarnetTest } from '@/hooks/useManagerLicense';
import { useAuth } from '@/contexts/AuthContext';

export default function TeamView() {
  const { teamId } = useParams<{ teamId: string }>();
  const { manager } = useAuth();
  useCompleteCarnetTest('visit_team', !!teamId && teamId === String(manager?.team_id));
  const navigate = useNavigate();
  const { team, isLoading, error } = useTeamData(teamId);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
        <div className="space-y-6">
          <TeamHeader team={team} />
          <ClubDetails team={team} />
          <TeamGuestbook teamId={teamId} />
        </div>
        <TeamSidebar />
      </div>
    </div>
  );
}
