
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Crown } from "lucide-react";
import { GAME_NAME } from "@/config/constants";
import { useLanguage } from "@/contexts/LanguageContext";

const Help = () => {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('help.title').replace('{name}', GAME_NAME)}
          </h1>
        </div>

        <div className="space-y-6">
          {/* Forums Section */}
          <Card className="border-l-4 border-l-teamsoccer-green">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-teamsoccer-green flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('help.forums')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {t('help.forumsDesc').replace('{name}', GAME_NAME)}
              </p>
            </CardContent>
          </Card>

          {/* Staff Section */}
          <Card className="border-l-4 border-l-teamsoccer-green">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-teamsoccer-green flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('help.staff')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {t('help.staffDesc').replace('{name}', GAME_NAME)}
              </p>
            </CardContent>
          </Card>

          {/* About Premium Section */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-yellow-600 flex items-center gap-2">
                <Crown className="h-5 w-5" />
                {t('help.premium')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {t('help.premiumDesc').replace(/\{name\}/g, GAME_NAME)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
