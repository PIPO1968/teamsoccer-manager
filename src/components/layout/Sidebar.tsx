
import { Calendar, Trophy, Users, Home, User, Flag, Banknote, Star, Building, GraduationCap, Inbox, Swords, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useManagerId } from "@/hooks/useManagerId";
import { useUserTeam } from "@/hooks/useUserTeam";
import { useStadiumIdByTeamId } from "@/hooks/useStadiumIdByTeamId";
import { useTeamLeague } from "@/hooks/useTeamLeague";
import { useLanguage } from "@/contexts/LanguageContext";
import TeamInfo from "./sidebar/TeamInfo";
import NavigationMenu from "./sidebar/NavigationMenu";

const Sidebar = () => {
  const { manager } = useAuth();
  const { managerId, isLoading: managerIdLoading } = useManagerId();
  const { team, isLoading: teamLoading } = useUserTeam();
  const { stadiumId } = useStadiumIdByTeamId(team?.team_id);
  const { league } = useTeamLeague(team?.team_id?.toString());
  const { t } = useLanguage();
  
  const managerIdFromTeam = team?.manager_id || null;
  const effectiveManagerId = managerIdFromTeam || managerId;
  const managerLink = effectiveManagerId ? `/manager/${effectiveManagerId}` : '/manager';
  
  // Check if manager is high-level admin (admin level > 1)
  const isHighLevelAdmin = manager?.is_admin && manager.is_admin > 1;
  
  const navItems = [
    { name: t('sidebar.overview'), icon: Home, path: "/dashboard" },
    { name: t('sidebar.club'), icon: Building, path: `/team/${team?.team_id || 1}` },
    { name: t('sidebar.players'), icon: Users, path: `/team/${team?.team_id || 1}/players` },
    { name: t('sidebar.training'), icon: GraduationCap, path: "/training" },
    { name: t('sidebar.matches'), icon: Calendar, path: "/matches" },
    { name: t('sidebar.league'), icon: Trophy, path: `/series/${league?.series_id || 1}` },
    { name: t('sidebar.stadium'), icon: Flag, path: `/stadium/${stadiumId || team?.team_id || 1}` },
    { name: t('sidebar.finances'), icon: Banknote, path: `/finances/${team?.team_id || 1}` },
    { name: t('sidebar.transfers'), icon: Inbox, path: "/transfer-market" },
    { name: t('sidebar.challenges'), icon: Swords, path: `/challenges/${team?.team_id}` },
    { name: t('sidebar.manager'), icon: User, path: managerLink },
    ...(isHighLevelAdmin ? [{ name: "Admin Area", icon: Settings, path: "/admin" }] : [])
  ];

  return (
    <aside className="hidden md:flex flex-col w-48 bg-white border-r border-gray-200 shadow-sm">
      <div className="flex flex-col flex-1">
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <TeamInfo team={team} isLoading={teamLoading} />
        </div>
        <NavigationMenu items={navItems} />
      </div>
    </aside>
  );
}

export default Sidebar;
