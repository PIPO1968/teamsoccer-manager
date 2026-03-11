import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";

export default function TrainingManualPage() {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const coachLevels: Array<{ key: string; descKey: string }> = [
        { key: "poor", descKey: "training.manual.poorDesc" },
        { key: "regular", descKey: "training.manual.regularDesc" },
        { key: "good", descKey: "training.manual.goodDesc" },
        { key: "excellent", descKey: "training.manual.excellentDesc" },
        { key: "worldClass", descKey: "training.manual.worldClassDesc" },
    ];

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <Button
                variant="ghost"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/training")}
            >
                <ArrowLeft className="w-4 h-4" />
                {t('training.manual.back')}
            </Button>

            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-green-700">{t('training.manual.title')}</h2>

                <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('training.manual.intro')}
                </p>

                <div className="space-y-3 pt-2">
                    {coachLevels.map(({ key, descKey }) => (
                        <div
                            key={key}
                            className="flex items-start gap-3 border rounded-md p-3 bg-muted/30"
                        >
                            <span className="min-w-[110px] font-semibold text-green-700 shrink-0">
                                {t(`training.coach.${key}` as Parameters<typeof t>[0])}
                            </span>
                            <p className="text-sm text-muted-foreground">
                                {t(descKey as Parameters<typeof t>[0])}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-2 rounded-md border border-yellow-400 bg-yellow-50 p-3">
                    <p className="text-sm font-semibold text-yellow-800">
                        {t('training.manual.warning')}
                    </p>
                </div>
            </Card>
        </div>
    );
}
