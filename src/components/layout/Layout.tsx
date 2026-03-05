
import { ReactNode } from "react";
import { RouteGuard } from "../auth/RouteGuard";
import { useAuth } from "@/contexts/AuthContext";
import WaitingListLayout from "./WaitingListLayout";
import CarnetLayout from "./CarnetLayout";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import GameStatusBar from "../GameStatusBar";
import { GAME_NAME } from "@/config/constants";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isWaitingList, isCarnetPending } = useAuth();

  if (isWaitingList || isCarnetPending) {
    return <CarnetLayout>{children}</CarnetLayout>;
  }

  return (
    <RouteGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <GameStatusBar />
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
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

export default Layout;
