import { Link } from "react-router-dom";
import { Award, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const WaitingListNavbar = () => {
  const { manager, signOut } = useAuth();

  return (
    <header className="bg-teamsoccer-green text-white border-b border-teamsoccer-green-dark sticky top-0 z-50 shadow-md">
      <div className="container mx-auto">
        <div className="flex h-14 items-center justify-between px-4">
          <nav className="flex space-x-1">
            <Link
              to="/carnet"
              className="px-3 py-1 rounded-md font-medium text-sm flex items-center gap-1.5 hover:bg-teamsoccer-green-dark text-white/90"
            >
              <Award className="h-4 w-4" />
              <span>Carnet de Manager</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-1">
            {manager && (
              <span className="px-3 py-1 text-sm flex items-center gap-1.5 text-white/90">
                <UserRound className="h-4 w-4" />
                <span>{manager.username}</span>
              </span>
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
