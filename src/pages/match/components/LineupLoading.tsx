
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const LineupLoading: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
      </div>
      <Card>
        <CardContent className="p-8 flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-96 w-full max-w-3xl bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LineupLoading;
