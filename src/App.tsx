import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Layout from "./components/layout/Layout";
import ForumOnlyLayout from "./components/layout/ForumOnlyLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import Series from "./pages/Series";
import Stadium from "./pages/Stadium";
import MatchViewer from "./pages/MatchViewer";
import TransferMarket from "./pages/transfer-market/TransferMarketPage";
import BidsPage from "./pages/transfer-market/BidsPage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import CreateTeam from "./pages/CreateTeam";
import NotFound from "./pages/NotFound";
import TeamView from "./pages/TeamView";
import PlayerView from "./pages/PlayerView";
import Training from "./pages/Training";
import TrainingManualPage from "./pages/training/TrainingManualPage";
import Manager from "./pages/Manager";
import ManagerAvatarPage from "./pages/manager/ManagerAvatarPage";
import SeriesFixtures from "./pages/series/SeriesFixtures";
import { useState } from "react";
import Finances from "./pages/Finances";
import MatchView from "./pages/MatchView";
import LineupPage from "./pages/match/LineupPage";
import ForumLayout from "./pages/forums/ForumLayout";
import ForumListPage from "./pages/forums/ForumListPage";
import ForumPage from "./pages/forums/ForumPage";
import ThreadPage from "./pages/forums/ThreadPage";
import NewThreadPage from "./pages/forums/NewThreadPage";
import Messages from "./pages/Messages";
import Challenges from "./pages/Challenges";
import RoomsPage from "./pages/groups/RoomsPage";
import CreateRoomPage from "./pages/groups/CreateRoomPage";
import RoomDetailsPage from "./pages/groups/RoomDetailsPage";
import World from "./pages/World";
import League from "./pages/League";
import GuestbookPage from "./pages/team/GuestbookPage";
import FlagCollection from "./pages/team/FlagCollection";
import TeamWorldMap from "./pages/team/TeamWorldMap";
import Shop from "./pages/Shop";
import PaymentSuccess from "./pages/PaymentSuccess";
import CookieConsent from "./components/CookieConsent";
import AdminArea from "./pages/AdminArea";
import WaitlistManagers from "./pages/admin/WaitlistManagers";
import NewsManagement from "./pages/admin/NewsManagement";
import ManagerAdminTool from "./pages/admin/ManagerAdminTool";
import TeamAdminTool from "./pages/admin/TeamAdminTool";
import PlayerAdminTool from "./pages/admin/PlayerAdminTool";
import OnlineManagers from "./pages/admin/OnlineManagers";
import Help from "./pages/Help";
import MotorJuego from "./pages/ayuda/motor-juego";
import Community from "./pages/Community";
import AccessDenied from "./pages/AccessDenied";
import PlayerImageGallery from "./pages/admin/PlayerImageGallery";
import CarnetDeManager from "./pages/CarnetDeManager";
import CarnetLayout from "./components/layout/CarnetLayout";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LanguageProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/access-denied" element={<AccessDenied />} />
                <Route path="/create-team" element={<CreateTeam />} />

                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/carnet" element={<CarnetLayout><CarnetDeManager /></CarnetLayout>} />
                <Route path="/world" element={<Layout><World /></Layout>} />
                <Route path="/team/:teamId" element={<Layout><TeamView /></Layout>} />
                <Route path="/team/:teamId/players" element={<Layout><Players /></Layout>} />
                <Route path="/players/:playerId" element={<Layout><PlayerView /></Layout>} />
                <Route path="/guestbook/:teamId" element={<Layout><GuestbookPage /></Layout>} />
                <Route path="/flags/:teamId" element={<Layout><FlagCollection /></Layout>} />
                <Route path="/team/:teamId/world-map" element={<Layout><TeamWorldMap /></Layout>} />

                <Route path="/matches" element={<Layout><Matches /></Layout>} />
                <Route path="/matches/:teamId" element={<Layout><Matches /></Layout>} />
                <Route path="/match/:matchId" element={<Layout><MatchView /></Layout>} />
                <Route path="/match/:matchId/lineup" element={<Layout><LineupPage /></Layout>} />
                <Route path="/match-viewer/:matchId" element={<MatchViewer />} />

                <Route path="/series/:seriesId" element={<Layout><Series /></Layout>} />
                <Route path="/series/:seriesId/fixtures" element={<Layout><SeriesFixtures /></Layout>} />
                <Route path="/stadium/:stadiumId" element={<Layout><Stadium /></Layout>} />
                <Route path="/transfer-market" element={<Layout><TransferMarket /></Layout>} />
                <Route path="/bids/:teamId" element={<Layout><BidsPage /></Layout>} />
                <Route path="/training" element={<Layout><Training /></Layout>} />
                <Route path="/training/manual" element={<Layout><TrainingManualPage /></Layout>} />
                <Route path="/manager/:managerId" element={<Layout><Manager /></Layout>} />
                <Route path="/manager/:managerId/avatar" element={<Layout><ManagerAvatarPage /></Layout>} />

                <Route path="/finances/:teamId" element={<Layout><Finances /></Layout>} />

                <Route path="/forums" element={<ForumOnlyLayout><ForumLayout><ForumListPage /></ForumLayout></ForumOnlyLayout>} />
                <Route path="/forum/:forumId" element={<ForumOnlyLayout><ForumLayout><ForumPage /></ForumLayout></ForumOnlyLayout>} />
                <Route path="/thread/:threadId" element={<ForumOnlyLayout><ForumLayout><ThreadPage /></ForumLayout></ForumOnlyLayout>} />
                <Route path="/forum/:forumId/new-thread" element={<ForumOnlyLayout><ForumLayout><NewThreadPage /></ForumLayout></ForumOnlyLayout>} />

                <Route path="/messages" element={<Layout><Messages /></Layout>} />

                <Route path="/challenges/:teamId" element={<Layout><Challenges /></Layout>} />

                <Route path="/rooms" element={<Layout><RoomsPage /></Layout>} />
                <Route path="/rooms/create" element={<Layout><CreateRoomPage /></Layout>} />
                <Route path="/rooms/:groupId" element={<Layout><RoomDetailsPage /></Layout>} />

                <Route path="/league/:leagueId" element={<Layout><League /></Layout>} />

                <Route path="/community" element={<Layout><Community /></Layout>} />

                <Route path="/help" element={<Layout><Help /></Layout>} />
                <Route path="/ayuda/motor-juego" element={<Layout><MotorJuego /></Layout>} />

                <Route path="/admin" element={<Layout><AdminArea /></Layout>} />
                <Route path="/admin/online-managers" element={<Layout><OnlineManagers /></Layout>} />
                <Route path="/admin/waitlist" element={<Layout><WaitlistManagers /></Layout>} />
                <Route path="/admin/news" element={<Layout><NewsManagement /></Layout>} />
                <Route path="/admin/managers" element={<Layout><ManagerAdminTool /></Layout>} />
                <Route path="/admin/teams" element={<Layout><TeamAdminTool /></Layout>} />
                <Route path="/admin/players" element={<Layout><PlayerAdminTool /></Layout>} />
                <Route path="/admin/PlayerImageGallery" element={<Layout><PlayerImageGallery /></Layout>} />

                <Route path="/shop" element={<Layout><Shop /></Layout>} />
                <Route path="/payment-success" element={<Layout><PaymentSuccess /></Layout>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieConsent />
            </AuthProvider>
          </LanguageProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
