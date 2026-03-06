
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamGuestbook } from "@/hooks/useTeamGuestbook";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface TeamGuestbookProps {
  teamId: string | undefined;
}

export default function TeamGuestbook({ teamId }: TeamGuestbookProps) {
  const { latestEntries, isLoading, addEntry, hasPosted } = useTeamGuestbook(teamId);
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { manager } = useAuth();
  const { t } = useLanguage();

  // Determine if the current team is the manager's own team
  const isOwnTeam = manager?.team_id === parseInt(teamId || '0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const success = await addEntry(message);
    if (success) {
      setMessage("");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="font-semibold mb-3">{t('team.guestbook')}</h2>
          <Skeleton className="h-14 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">{t('team.guestbook')}</h2>
          <Link
            to={`/guestbook/${teamId}`}
            className="text-xs text-green-700 hover:underline"
          >
            {t('team.viewAll')}
          </Link>
        </div>

        {latestEntries.length > 0 ? (
          <div className="space-y-3 mb-4">
            {latestEntries.map((entry) => (
              <div key={entry.id} className="bg-slate-50 p-3 rounded-md">
                <div className="flex justify-between">
                  <Link to={`/manager/${entry.author_id}`} className="text-sm font-medium text-green-700 hover:underline">
                    {entry.author_name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm mt-1">{entry.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4 bg-slate-50 p-3 rounded-md text-sm text-muted-foreground">
            {t('team.noGuestbookMessages')}
          </div>
        )}

        {!isOwnTeam && manager && !hasPosted && (
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder={t('team.guestbookPlaceholder')}
              className="mb-2 resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
            />
            <div className="text-right">
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || !message.trim()}
              >
                {t('team.postMessage')}
              </Button>
            </div>
          </form>
        )}

        {!isOwnTeam && manager && hasPosted && (
          <div className="text-sm text-muted-foreground">
            {t('team.alreadyPosted')}
          </div>
        )}

        {isOwnTeam && (
          <div className="text-sm text-muted-foreground">
            {t('team.ownGuestbook')}
          </div>
        )}

        {!manager && (
          <div className="text-sm text-muted-foreground">
            {t('team.loginToPost')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
