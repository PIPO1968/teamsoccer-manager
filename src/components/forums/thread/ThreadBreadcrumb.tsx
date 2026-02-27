
import { Link } from "react-router-dom";

interface ThreadBreadcrumbProps {
  forumId: number;
  threadTitle: string;
}

export default function ThreadBreadcrumb({ forumId, threadTitle }: ThreadBreadcrumbProps) {
  return (
    <div className="flex items-center text-sm">
      <Link to="/forums" className="text-primary hover:underline">
        Forums
      </Link>
      <span className="mx-1 text-muted-foreground">/</span>
      <Link to={`/forum/${forumId}`} className="text-primary hover:underline">
        {forumId} {/* TODO: Replace with forum name */}
      </Link>
      <span className="mx-1 text-muted-foreground">/</span>
      <span className="text-muted-foreground">{threadTitle}</span>
    </div>
  );
}
