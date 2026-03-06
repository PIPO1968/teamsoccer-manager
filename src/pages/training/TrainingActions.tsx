
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type CoachLevel = "" | "poor" | "regular" | "good" | "excellent" | "worldClass";

export default function TrainingActions() {
  const { t } = useLanguage();
  const [coachLevel, setCoachLevel] = useState<CoachLevel>("");

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">{t('training.actions')}</h3>
      <div className="space-y-3">
        <div>
          <select
            value={coachLevel}
            onChange={(e) => setCoachLevel(e.target.value as CoachLevel)}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
          >
            <option value="">{t('training.coach.changeLevel')}</option>
            <option value="poor">{t('training.coach.poor')}</option>
            <option value="regular">{t('training.coach.regular')} - 300.000</option>
            <option value="good">{t('training.coach.good')} - 1.500.000</option>
            <option value="excellent">{t('training.coach.excellent')} - 4.000.000</option>
            <option value="worldClass">{t('training.coach.worldClass')} - 10.000.000</option>
          </select>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-green-700 hover:text-green-800 hover:bg-green-50"
        >
          {t('training.manual')}
        </Button>
      </div>
    </Card>
  );
}
