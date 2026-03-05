
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { RouteGuard } from "../auth/RouteGuard";
import WaitingListNavbar from "./WaitingListNavbar";
import GameStatusBar from "../GameStatusBar";
import { GAME_NAME } from "@/config/constants";
import { useLocation } from "react-router-dom";

interface CarnetLayoutProps {
  children: ReactNode;
}

const CarnetLayout = ({ children }: CarnetLayoutProps) => {
  const location = useLocation();
  const isCarnetPage = location.pathname === '/carnet';

  return (
    <RouteGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <GameStatusBar />
        <WaitingListNavbar />
        {!isCarnetPage && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 flex items-center justify-between text-sm">
            <span className="text-yellow-800 font-medium">
              Modo Carnet de Manager — completa todas las pruebas para acceder al juego completo
            </span>
            <Link
              to="/carnet"
              className="text-yellow-700 hover:text-yellow-900 font-semibold underline underline-offset-2 flex items-center gap-1"
            >
              ← Volver al Carnet
            </Link>
          </div>
        )}
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

export default CarnetLayout;
