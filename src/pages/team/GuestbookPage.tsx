
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamGuestbook } from "@/hooks/useTeamGuestbook";
import { useTeamData } from "@/hooks/useTeamData";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";

export default function GuestbookPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { entries, isLoading, addEntry, fetchAllEntries, hasPosted } = useTeamGuestbook(teamId);
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { manager } = useAuth();
  
  // Determine if the current team is the manager's own team
  const isOwnTeam = manager?.team_id === parseInt(teamId || '0');

  useEffect(() => {
    fetchAllEntries();
  }, [teamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    const success = await addEntry(message);
    if (success) {
      setMessage("");
      fetchAllEntries();
    }
    setIsSubmitting(false);
  };

  if (isLoading || teamLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-64 mb-6" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-50 p-4 rounded-md">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link 
          to={`/team/${teamId}`}
          className="inline-flex items-center text-green-700 hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to team
        </Link>
        <h1 className="text-2xl font-bold">{team?.name} Guestbook</h1>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {!isOwnTeam && manager && !hasPosted && (
            <div className="mb-6">
              <h2 className="font-semibold mb-3">Leave a message</h2>
              <form onSubmit={handleSubmit}>
                <Textarea 
                  placeholder="Write your message here..." 
                  className="mb-2 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="text-right">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !message.trim()}
                  >
                    Post message
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          {!isOwnTeam && manager && hasPosted && (
            <div className="mb-6 p-4 bg-slate-50 rounded-md">
              <p className="text-sm text-muted-foreground">
                You have already posted a message in this guestbook. You can only post one message per team.
              </p>
            </div>
          )}
          
          {isOwnTeam && (
            <div className="mb-6 p-4 bg-slate-50 rounded-md">
              <p className="text-sm text-muted-foreground">
                You cannot leave messages on your own team's guestbook.
              </p>
            </div>
          )}
          
          {!manager && (
            <div className="mb-6 p-4 bg-slate-50 rounded-md">
              <p className="text-sm text-muted-foreground">
                You must be logged in to post messages.
              </p>
            </div>
          )}
          
          <h2 className="font-semibold mb-4">All messages</h2>
          
          {entries.length > 0 ? (
            <div className="space-y-6">
              {entries.map(entry => (
                <div key={entry.id} className="bg-slate-50 p-4 rounded-md">
                  <div className="flex justify-between">
                    <Link to={`/manager/${entry.author_id}`} className="font-medium text-green-700 hover:underline">
                      {entry.author_name}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-2">{entry.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No messages yet. Be the first to write in the guestbook!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
