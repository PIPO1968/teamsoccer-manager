
import { ReactNode } from "react";
import { RouteGuard } from "../auth/RouteGuard";
import { useAuth } from "@/contexts/AuthContext";
import WaitingListLayout from "./WaitingListLayout";
import Navbar from "./Navbar";
import GameStatusBar from "../GameStatusBar";
import { GAME_NAME } from "@/config/constants";

interface ForumOnlyLayoutProps {
  children: ReactNode;
}

const ForumOnlyLayout = ({ children }: ForumOnlyLayoutProps) => {
  const { isWaitingList } = useAuth();

  // Use waiting list layout for waiting list users
  if (isWaitingList) {
    return <WaitingListLayout>{children}</WaitingListLayout>;
  }

  return (
    <RouteGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <GameStatusBar />
        <Navbar />
        <div className="flex flex-col flex-1">
          <main className="flex-1 p-4 md:p-6 max-w-full mx-auto w-full">
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

export default ForumOnlyLayout;
