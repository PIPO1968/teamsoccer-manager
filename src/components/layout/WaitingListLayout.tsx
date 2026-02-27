
import { ReactNode } from "react";
import { RouteGuard } from "../auth/RouteGuard";
import WaitingListNavbar from "./WaitingListNavbar";
import GameStatusBar from "../GameStatusBar";
import { GAME_NAME } from "@/config/constants";

interface WaitingListLayoutProps {
  children: ReactNode;
}

const WaitingListLayout = ({ children }: WaitingListLayoutProps) => {
  return (
    <RouteGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <GameStatusBar />
        <WaitingListNavbar />
        <div className="flex flex-1">
          <div className="flex flex-col flex-1">
            <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
              {children}
            </main>
            <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500">
              <div className="container mx-auto">
                {GAME_NAME} &copy; {new Date().getFullYear()}
              </div>
            </footer>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
};

export default WaitingListLayout;
