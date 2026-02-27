
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage, languageNames, Language } from "@/contexts/LanguageContext";

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('landing.chooseLanguage')}
      </label>
      <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languageNames).map(([code, name]) => (
            <SelectItem key={code} value={code}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
