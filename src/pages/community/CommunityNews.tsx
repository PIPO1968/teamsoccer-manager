
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, Eye } from "lucide-react";
import { useCommunityNews } from "@/hooks/useCommunityNews";
import ReactMarkdown from 'react-markdown';
import { Link } from "react-router-dom";

export const CommunityNews = () => {
  const { data: news, isLoading } = useCommunityNews();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Community News
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : news && news.length > 0 ? (
          <div className="space-y-6">
            {news.map((article) => (
              <div key={article.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {article.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <Link 
                      to={`/manager/${article.author_id}`}
                      className="hover:underline hover:text-blue-600 transition-colors"
                    >
                      {article.author?.username || 'Unknown'}
                    </Link>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(article.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      a: ({ href, children, ...props }) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          {...props}
                        >
                          {children}
                        </a>
                      )
                    }}
                  >
                    {article.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No community news available.</p>
        )}
      </CardContent>
    </Card>
  );
};
