
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForums } from "@/hooks/useForums";
import { Link } from "react-router-dom";
import { MessageCircle, Loader2, Lock, ShieldAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/contexts/AuthContext';
import { useCompleteCarnetTest } from '@/hooks/useManagerLicense';

export default function ForumListPage() {
  useCompleteCarnetTest('visit_forums');
  const { data, isLoading, error } = useForums();
  const { manager } = useAuth();
  const isAdmin = manager?.is_admin > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading forums...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error loading forums: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (!data || !data.categories || !data.forums || data.categories.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        No forums found. Check back soon!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.categories.map((category) => {
        // Filter forums for this category
        const categoryForums = data.forums
          .filter((forum) => forum.category_id === category.id);
          
        // Skip rendering empty categories
        if (categoryForums.length === 0) return null;
        
        // Check if this is a staff forum category
        const isStaffCategory = category.id === 4;
        
        return (
          <Card key={category.id}>
            <CardHeader className={isStaffCategory ? "bg-red-50 dark:bg-red-900/10" : ""}>
              <CardTitle className="flex items-center gap-2">
                {isStaffCategory && <ShieldAlert className="h-4 w-4 text-red-500" />}
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryForums.map((forum) => (
                  <Link
                    key={forum.id}
                    to={`/forum/${forum.id}`}
                    className="block p-4 rounded-lg border hover:bg-accent"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        {category.name === "Group Forums" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Lock className="h-4 w-4 text-muted-foreground mt-1" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Private group forum
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {category.id === 4 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <ShieldAlert className="h-4 w-4 text-red-500 mt-1" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Staff only forum
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <div>
                          <h3 className="font-semibold">{forum.name}</h3>
                          <p className="text-sm text-muted-foreground">{forum.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageCircle className="w-4 h-4" />
                        <span>{forum.thread_count} threads • {forum.post_count} posts</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
