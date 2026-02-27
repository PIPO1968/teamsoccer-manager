
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { Flag } from "@/components/ui/flag";
import { useTopForumPosters } from "@/hooks/useTopForumPosters";

export const TopForumPosters = () => {
  const { data: topPosters, isLoading, error } = useTopForumPosters();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Top Forum Posters
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500 text-sm mb-2">Error loading forum data</p>
            <p className="text-gray-500 text-xs">{error.message}</p>
          </div>
        ) : topPosters && topPosters.length > 0 ? (
          <div className="space-y-3">
            {topPosters.map((poster, index) => {
              // Handle the case where manager might be an array or undefined
              const managerData = poster.manager 
                ? (Array.isArray(poster.manager) ? poster.manager[0] : poster.manager)
                : null;
              
              return (
                <div key={poster.user_id || index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/manager/${poster.user_id}`} 
                        className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {poster.username || 'Unknown'}
                      </Link>
                      {managerData?.country?.name && (
                        <Flag 
                          country={managerData.country.name} 
                          className="w-4 h-3" 
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{poster.post_count || 0} posts</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No forum activity yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
