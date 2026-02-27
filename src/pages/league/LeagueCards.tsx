
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

// Info cards at the top of League Page
export default function LeagueCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">League Position</CardTitle>
        </CardHeader>
        <CardContent className="py-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full p-4 bg-primary-foreground">
              <span className="text-4xl font-bold text-primary">3rd</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Out of 16 teams</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Points</CardTitle>
        </CardHeader>
        <CardContent className="py-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full p-4 bg-primary-foreground">
              <span className="text-4xl font-bold text-primary">29</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">4 pts behind leader</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Form</CardTitle>
        </CardHeader>
        <CardContent className="py-0 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {["W", "W", "L", "W", "W"].map((result, i) => (
              <div
                key={i}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                  result === "W"
                    ? "bg-green-500 text-white"
                    : result === "D"
                    ? "bg-yellow-500 text-black"
                    : "bg-red-500 text-white"
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
