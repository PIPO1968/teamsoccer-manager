
import { useLanguage } from "@/contexts/LanguageContext";

const MatchViewer = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('nav.matchViewer')}</h1>
        <p className="text-lg text-muted-foreground">
          Página en construcción
        </p>
      </div>
    </div>
  );
};

export default MatchViewer;
