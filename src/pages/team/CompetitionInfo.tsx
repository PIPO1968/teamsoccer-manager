
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CompetitionInfo() {
  const { t } = useLanguage();
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold mb-3">{t('team.ongoingCompetitions')}</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground"># 1 in</span>{" "}
            <Link to="/series/1" className="text-green-700 hover:underline">Division 3, Group 4</Link>
          </div>
          <div>
            <span className="text-muted-foreground">Currently in</span>{" "}
            <Link to="/series/1" className="text-green-700 hover:underline">National Cup - Round 3</Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
