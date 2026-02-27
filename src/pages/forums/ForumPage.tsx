
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useForumThreads } from "@/hooks/useForumThreads";
import { useSearchParams } from "react-router-dom";
import { Lock, Pin, Clock, User, Plus } from "lucide-react";
import ThreadPagination from "@/components/forums/thread/ThreadPagination";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function ForumPage() {
  const { forumId } = useParams<{ forumId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const { data, isLoading, error } = useForumThreads(
    Number(forumId), 
    currentPage, 
    10
  );

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  if (isLoading) {
    return <div>Loading forum threads...</div>;
  }

  if (error || !data) {
    return <div>Error loading forum threads</div>;
  }

  const { stickyThreads, normalThreads, totalPages } = data;

  const ThreadItem = ({ thread }: { thread: any }) => (
    <Link
      key={thread.id}
      to={`/thread/${thread.id}`}
      className="block border rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {thread.is_sticky && <Pin className="h-4 w-4 text-blue-600" />}
            {thread.is_locked && <Lock className="h-4 w-4 text-gray-600" />}
            <h3 className="font-semibold text-blue-600 hover:text-blue-800">
              {thread.title}
            </h3>
          </div>
          <div className="text-sm text-gray-500">
            Replies: {thread.reply_count || 0}
          </div>
        </div>
        
        {thread.last_post_at && (
          <div className="text-right text-sm text-gray-600 ml-4">
            <div className="flex items-center gap-1 justify-end mb-1">
              <Clock className="h-3 w-3" />
              <span>{formatDateTime(thread.last_post_at)}</span>
            </div>
            {thread.last_post_manager_username && (
              <div className="flex items-center gap-1 justify-end">
                <User className="h-3 w-3" />
                <span className="text-xs font-medium">
                  {thread.last_post_manager_username}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Forum Threads</h1>
        <Link to={`/forum/${forumId}/new-thread`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Thread
          </Button>
        </Link>
      </div>
      
      {/* Sticky Threads Section */}
      {stickyThreads.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
            <Pin className="h-5 w-5" />
            Sticky Threads
          </h2>
          <div className="space-y-4">
            {stickyThreads.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} />
            ))}
          </div>
        </div>
      )}

      {/* Normal Threads Section */}
      <div className="space-y-4">
        {stickyThreads.length > 0 && (
          <h2 className="text-lg font-semibold">Threads</h2>
        )}
        
        {/* Top pagination */}
        <ThreadPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        
        <div className="space-y-4">
          {normalThreads.map((thread) => (
            <ThreadItem key={thread.id} thread={thread} />
          ))}
        </div>
        
        {/* Bottom pagination */}
        <ThreadPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
