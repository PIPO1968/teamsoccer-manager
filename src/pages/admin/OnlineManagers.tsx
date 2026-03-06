
import { useMemo } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useOnlinePlayers } from "@/hooks/useOnlinePlayers";
import { useLanguage } from "@/contexts/LanguageContext";
import { OnlineManagersList } from "@/components/admin/OnlineManagersList";

interface OnlineManager {
  user_id: number;
  username: string;
  is_admin: number;
  is_premium: number;
  last_login: string;
  country_name?: string;
  current_url?: string;
}

const OnlineManagers = () => {
  const { onlineUserIds, isLoading } = useOnlinePlayers();
  const { t } = useLanguage();

  const onlineManagers = useMemo<OnlineManager[]>(() => {
    return [];
  }, []);

  const loading = isLoading;

  return (
    <AdminGuard requiredLevel={1}>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold">{t('admin.onlineManagers')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('admin.currentlyOnline')}</span>
              <Badge variant="outline" className="text-sm">
                {t('admin.onlineCount').replace('{n}', onlineUserIds.length.toString())}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OnlineManagersList managers={onlineManagers} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  );
};

export default OnlineManagers;
