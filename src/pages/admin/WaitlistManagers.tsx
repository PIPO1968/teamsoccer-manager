
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flag } from "@/components/ui/flag";
import { ManagerStatusIndicators } from "@/components/manager/ManagerStatusIndicators";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";

interface WaitlistManager {
  user_id: number;
  username: string;
  email: string;
  status: string;
  country_id: number;
  country_name: string;
  team_name?: string;
  created_at: string;
  is_admin: number;
  is_premium: number;
}

const WaitlistManagers = () => {
  const { manager } = useAuth();
  const { t } = useLanguage();

  // Check if user has required admin level
  if (!manager?.is_admin || manager.is_admin <= 1) {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: waitlistManagers, isLoading, error } = useQuery({
    queryKey: ['waitlist-managers'],
    queryFn: async (): Promise<WaitlistManager[]> => {
      const response = await apiFetch<{ success: boolean; managers: WaitlistManager[] }>(
        "/admin/waitlist-managers"
      );
      return response.managers || [];
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/admin" className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{t('waitlist.loading')}</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/admin" className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-red-600">{t('waitlist.error')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/admin" className="text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Users className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">{t('waitlist.title')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('waitlist.pending')} ({waitlistManagers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {waitlistManagers && waitlistManagers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('waitlist.colManager')}</TableHead>
                  <TableHead>{t('waitlist.colEmail')}</TableHead>
                  <TableHead>{t('waitlist.colStatus')}</TableHead>
                  <TableHead>{t('waitlist.colCountry')}</TableHead>
                  <TableHead>{t('waitlist.colTeamName')}</TableHead>
                  <TableHead>{t('waitlist.colJoined')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitlistManagers.map((manager) => (
                  <TableRow key={manager.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Link to={`/manager/${manager.user_id}`}>{manager.username}</Link>
                        <ManagerStatusIndicators
                          managerId={manager.user_id}
                          isPremium={manager.is_premium}
                          isAdmin={manager.is_admin}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{manager.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${manager.status === 'waiting_list'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                        {manager.status === 'waiting_list' ? t('waitlist.statusWaiting') : t('waitlist.statusPending')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Flag countryId={manager.country_id} className="max-w-[20px] max-h-[15px]" />
                        <span>{manager.country_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{manager.team_name || 'No team'}</TableCell>
                    <TableCell>
                      {new Date(manager.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('waitlist.noManagers')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistManagers;
