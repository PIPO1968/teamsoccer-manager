
import { Link } from "react-router-dom";
import { Globe, HelpCircle, MailboxIcon, MessageCircle, Crown, UserRound, LogOut, Users, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserTeam } from "@/hooks/useUserTeam";

const WaitingListNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { unreadCount } = useMessages();
  const { manager, isPremium, signOut } = useAuth();
  const { t } = useLanguage();
  const { team } = useUserTeam();
  
  const navItems = [
    { name: "My Club", icon: Home, path: team ? `/team/${team.team_id}` : "/team" },
    { name: t('nav.world'), icon: Globe, path: "/world" },
    { name: "Rooms", icon: Users, path: "/rooms" },
    { name: t('nav.forums'), icon: MessageCircle, path: "/forums" },
    { name: "Community", icon: Users, path: "/community" },
  ];

  return (
    <header className="bg-teamsoccer-green text-white border-b border-teamsoccer-green-dark sticky top-0 z-50 shadow-md">
      <div className="container mx-auto">
        <div className="flex h-14 items-center justify-between px-4">
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className={`px-3 py-1 rounded-md font-medium text-sm flex items-center gap-1.5 hover:bg-teamsoccer-green-dark ${
                  window.location.pathname === item.path 
                    ? "bg-teamsoccer-green-dark" 
                    : "text-white/90"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-1">
            <Link 
              to="/help"
              className="px-3 py-1 rounded-md font-medium text-sm flex items-center gap-1.5 hover:bg-teamsoccer-green-dark text-white/90"
            >
              <HelpCircle className="h-4 w-4" />
              <span>{t('nav.help')}</span>
            </Link>
            
            <Link 
              to="/shop"
              className="px-3 py-1 rounded-md font-medium text-sm flex items-center gap-1.5 hover:bg-yellow-700 bg-yellow-600 text-white"
            >
              <Crown className="h-4 w-4" />
              <span>{t('nav.premium')}</span>
            </Link>

            <Link 
              to="/messages"
              className="px-3 py-1 rounded-md font-medium text-sm flex items-center gap-1.5 hover:bg-teamsoccer-green-dark text-white/90"
            >
              <MailboxIcon className="h-4 w-4" />
              <span>{t('nav.mailbox')}</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white rounded-full px-1.5 ml-1">
                  {unreadCount}
                </span>
              )}
            </Link>

            {manager && (
              <Link 
                to={`/manager/${manager.user_id}`}
                className="px-3 py-1 rounded-md font-medium text-sm flex items-center gap-1.5 hover:bg-teamsoccer-green-dark text-white/90"
              >
                <UserRound className="h-4 w-4" />
                <span>{manager.username}</span>
              </Link>
            )}

            <Button
              variant="ghost"
              onClick={signOut}
              className="px-3 py-1 rounded-md font-medium text-sm flex items-center gap-1.5 hover:bg-teamsoccer-green-dark text-white/90 h-auto"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WaitingListNavbar;
