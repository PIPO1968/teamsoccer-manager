
import { Card, CardContent } from "@/components/ui/card";

export const StadiumVisualization = () => {
  return (
    <Card className="h-full">
      <CardContent className="p-6 h-full">
        <div 
          className="w-full h-full rounded-lg flex items-center justify-center relative min-h-[400px]"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          }}
        >
          {/* Simple stadium representation */}
          <div className="relative w-40 h-32 border-2 border-white/60 rounded-lg">
            <div className="absolute inset-2 border border-white/40 rounded"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-8 border border-white/40 rounded-full"></div>
            <div className="absolute top-1/2 left-0 w-2 h-6 border-r border-white/40 transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 right-0 w-2 h-6 border-l border-white/40 transform -translate-y-1/2"></div>
          </div>
          {/* Stadium stands representation */}
          <div className="absolute inset-4 border border-white/30 rounded-lg"></div>
          <div className="absolute inset-8 border border-white/20 rounded-lg"></div>
        </div>
      </CardContent>
    </Card>
  );
};
