
import { Link } from "react-router-dom";
import { Globe, HelpCircle, Home, Menu, MailboxIcon, MessageCircle, Crown, UserRound, Users, LogOut, Tv2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTeam } from "@/hooks/useUserTeam";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { unreadCount } = useMessages();
  const { manager, isPremium, signOut } = useAuth();
  const { team } = useUserTeam();
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav.myClub'), icon: Home, path: `/team/${team?.team_id || 1}` },
    { name: t('nav.world'), icon: Globe, path: "/world" },
    { name: t('nav.rooms'), icon: Users, path: "/rooms" },
    { name: t('nav.forums'), icon: MessageCircle, path: "/forums" },
    { name: t('nav.community'), icon: Globe, path: "/community" },
    { name: t('nav.matchViewer'), icon: Tv2, path: "/match-viewer" },
  ];

  return (
    <header className="bg-teamsoccer-green text-white border-b border-teamsoccer-green-dark sticky top-0 z-50 shadow-md">
      <div className="container mx-auto">
        <div className="flex h-14 items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-teamsoccer-green-dark"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-1 rounded-md font-medium text-sm flex items-center gap-1.5 hover:bg-teamsoccer-green-dark ${window.location.pathname === item.path
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
              <span>{t('nav.logout')}</span>
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-teamsoccer-green-dark border-t border-white/10 px-2 py-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-white hover:bg-teamsoccer-green"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
