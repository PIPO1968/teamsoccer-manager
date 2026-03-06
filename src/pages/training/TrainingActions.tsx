
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TrainingActions() {
  const { t } = useLanguage();

  const actions = [
    t('training.coach'),
    t('training.manual'),
  ];

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">{t('training.actions')}</h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action}
            variant="outline"
            className="w-full justify-start text-green-700 hover:text-green-800 hover:bg-green-50"
          >
            {action}
          </Button>
        ))}
      </div>
    </Card>
  );
}
