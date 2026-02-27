import { useEffect, useState } from "react";
import { useParams, Navigate, useSearchParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useChallenges, Challenge } from "@/hooks/useChallenges";
import { toast } from "sonner";

export default function Challenges() {
  const { teamId } = useParams<{ teamId: string }>();
  const [searchParams] = useSearchParams();
  const challengeTeamId = searchParams.get('challengeTeam');
  const challengeTeamName = searchParams.get('challengeTeamName');
  
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchChallenges, respondToChallenge, sendChallenge, isLoading: isResponding } = useChallenges(teamId);

  useEffect(() => {
    console.info('Challenges page loaded with params:', {
      'teamId from URL': teamId,
      'challengeTeam from query': challengeTeamId,
      'challengeTeamName from query': challengeTeamName,
      'teamId parsed as number': Number(teamId),
      'challengeTeamId parsed as number': challengeTeamId ? Number(challengeTeamId) : null
    });
  }, [teamId, challengeTeamId, challengeTeamName]);

  useEffect(() => {
    let mounted = true;

    const loadChallenges = async () => {
      if (!teamId) return;
      
      setIsLoading(true);
      const data = await fetchChallenges();
      if (mounted) {
        console.log('Fetched challenges:', data);
        
        data.forEach(challenge => {
          console.log(`Challenge #${challenge.id} scheduled date:`, {
            raw: challenge.scheduled_date,
            parsed: challenge.scheduled_date ? new Date(challenge.scheduled_date) : null,
            formatted: challenge.scheduled_date ? format(new Date(challenge.scheduled_date), "PPp") : "None"
          });
        });
        
        setChallenges(data);
        setIsLoading(false);
      }
    };

    loadChallenges();
    return () => { mounted = false; };
  }, [teamId, fetchChallenges]);

  useEffect(() => {
    const handleInitialChallenge = async () => {
      if (!teamId || !challengeTeamId || isLoading) {
        console.log('Skipping auto-challenge - missing data or still loading');
        return;
      }

      try {
        const currentTeamId = Number(teamId);
        const targetTeamId = Number(challengeTeamId);
        
        console.info('Auto-challenge attempt:', {
          'Current team ID (URL param)': currentTeamId,
          'Target team ID (query param)': targetTeamId,
          'Target team name': challengeTeamName,
          'Are they the same?': currentTeamId === targetTeamId,
          'Current team ID type': typeof currentTeamId,
          'Target team ID type': typeof targetTeamId,
          'challengeTeamId raw value': challengeTeamId
        });
        
        if (currentTeamId === targetTeamId) {
          console.error(`Self-challenge prevented in UI: team ${currentTeamId} cannot challenge itself`);
          toast.error("You cannot challenge your own team");
          return;
        }
        
        const result = await sendChallenge(targetTeamId);
        if (result) {
          toast.success(`Challenge sent to ${challengeTeamName || 'team'}`);
          
          const updatedChallenges = await fetchChallenges();
          setChallenges(updatedChallenges);
        }
        
        const url = new URL(window.location.href);
        url.searchParams.delete('challengeTeam');
        url.searchParams.delete('challengeTeamName');
        window.history.replaceState({}, '', url);
        
      } catch (error) {
        console.error("Error in auto-challenge process:", error);
      }
    };
    
    handleInitialChallenge();
  }, [teamId, challengeTeamId, challengeTeamName, isLoading, sendChallenge, fetchChallenges]);

  if (!teamId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  const handleResponse = async (challengeId: number, accept: boolean) => {
    if (isResponding) return;
    
    const success = await respondToChallenge(challengeId, accept);
    if (success) {
      setChallenges(prev => 
        prev.map(challenge => 
          challenge.id === challengeId 
            ? { ...challenge, status: accept ? 'accepted' : 'rejected' } 
            : challenge
        )
      );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No challenges found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {challenge.is_sender ? (
                          <p>
                            Challenge sent to{" "}
                            <Link 
                              to={`/team/${challenge.challenged_team_id}`}
                              className="font-semibold text-green-700 hover:underline"
                            >
                              {challenge.challenged_team_name}
                            </Link>
                          </p>
                        ) : (
                          <p>
                            Challenge from{" "}
                            <Link 
                              to={`/team/${challenge.challenger_team_id}`}
                              className="font-semibold text-green-700 hover:underline"
                            >
                              {challenge.challenger_team_name}
                            </Link>
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sent on {format(new Date(challenge.created_at), "PP")}
                      </p>
                      {challenge.scheduled_date && (
                        <p className="text-sm text-green-600 mt-1">
                          Proposed match date: {format(new Date(challenge.scheduled_date), "PPp")}
                        </p>
                      )}
                      <p className="text-sm font-medium mt-2">
                        Status: <span className="capitalize">{challenge.status}</span>
                      </p>
                    </div>
                    {!challenge.is_sender && challenge.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResponse(challenge.id, false)}
                          disabled={isResponding}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResponse(challenge.id, true)}
                          disabled={isResponding}
                        >
                          Accept
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
