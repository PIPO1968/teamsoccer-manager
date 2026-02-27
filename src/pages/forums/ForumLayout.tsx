
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentForumThreads } from "@/hooks/useRecentForumThreads";
import { Clock, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  const { data: recentThreads, isLoading } = useRecentForumThreads(5);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forums</h1>
          <p className="text-muted-foreground">Discuss football with the community</p>
        </div>
        <Link to="/forums">
          <Button variant="outline">Back to Forums</Button>
        </Link>
      </div>
      
      <div className="flex gap-6">
        <div className="flex-1">
          {children}
        </div>
        
        <div className="w-80 space-y-4">
          <Card className="shadow-sm border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-2 w-16" />
                        <Skeleton className="h-2 w-12" />
                      </div>
                      {i < 2 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {recentThreads?.slice(0, 5).map((thread, index) => (
                    <div key={thread.id}>
                      <Link
                        to={`/thread/${thread.id}`}
                        className="block group"
                      >
                        <div className="p-2 rounded-md hover:bg-muted/40 transition-colors duration-200">
                          <div className="space-y-1.5">
                            <h4 className="font-medium text-xs leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                              {thread.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MessageCircle className="h-2.5 w-2.5" />
                                <span className="font-medium text-foreground/60 truncate max-w-20">
                                  {thread.forums.name}
                                </span>
                              </div>
                              {thread.last_post_at && (
                                <span className="font-mono text-xs text-muted-foreground/80 bg-muted/30 px-1.5 py-0.5 rounded text-[10px]">
                                  {formatDateTime(thread.last_post_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                      {index < Math.min((recentThreads?.length || 0), 5) - 1 && (
                        <Separator className="my-1" />
                      )}
                    </div>
                  )) || (
                    <div className="text-center py-6">
                      <MessageCircle className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
