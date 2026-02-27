
import { ReactNode } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { GAME_NAME } from "@/config/constants";
import GameStatusBar from "@/components/GameStatusBar";
import Navbar from "@/components/layout/Navbar";

interface MatchViewerLayoutProps {
  children: ReactNode;
}

const MatchViewerLayout = ({ children }: MatchViewerLayoutProps) => {
  return (
    <RouteGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <GameStatusBar />
        <Navbar />
        <div className="flex flex-col flex-1">
          <main className="flex-1 max-w-full w-full">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500">
            <div className="container mx-auto">
              {GAME_NAME} &copy; {new Date().getFullYear()}
            </div>
          </footer>
        </div>
      </div>
    </RouteGuard>
  );
};

export default MatchViewerLayout;
