
import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOnlinePlayers } from "@/hooks/useOnlinePlayers";
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
  const [onlineManagers, setOnlineManagers] = useState<OnlineManager[]>([]);
  const [loading, setLoading] = useState(true);
  const { onlineUserIds, onlineUserData } = useOnlinePlayers();

  useEffect(() => {
    const fetchOnlineManagers = async () => {
      if (onlineUserIds.length === 0) {
        setOnlineManagers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('managers')
          .select(`
            user_id,
            username,
            is_admin,
            is_premium,
            last_login,
            leagues_regions!managers_country_id_fkey (name)
          `)
          .in('user_id', onlineUserIds)
          .order('last_login', { ascending: false });

        if (error) throw error;

        const managersWithCountry = data?.map(manager => {
          // Find the corresponding user data to get current URL
          const userData = onlineUserData.find(user => user.user_id === manager.user_id);
          
          return {
            ...manager,
            country_name: manager.leagues_regions?.name || 'Unknown',
            current_url: userData?.current_url
          };
        }) || [];

        setOnlineManagers(managersWithCountry);
      } catch (error) {
        console.error('Error fetching online managers:', error);
        setOnlineManagers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineManagers();
    
    // Set up interval to refresh data every 60 seconds (1 minute)
    const refreshInterval = setInterval(fetchOnlineManagers, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [onlineUserIds, onlineUserData]);

  return (
    <AdminGuard requiredLevel={1}>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold">Online Managers</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Currently Online Managers</span>
              <Badge variant="outline" className="text-sm">
                {onlineUserIds.length} online
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
