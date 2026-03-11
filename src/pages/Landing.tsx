
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Gamepad2, MessageSquare, Goal } from "lucide-react";
import { Card } from "@/components/ui/card";
import GameStatusBar from "@/components/GameStatusBar";
import { GAME_NAME } from "@/config/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWorldStats } from "@/hooks/useWorldStats";

const Landing = () => {
  const { manager } = useAuth();
  const { t } = useLanguage();
  const { stats, isLoading } = useWorldStats();

  return (
    <div className="min-h-screen bg-teamsoccer-green">
      <GameStatusBar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-[300px,2fr] gap-6">
          {/* Get Started Section */}
          <Card className="bg-white p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-16 h-16 text-teamsoccer-green" />
              </div>
              <h2 className="text-xl font-bold mb-2">{t('landing.getTeam')}</h2>
              <p className="text-gray-600 mb-4">
                {t('landing.getTeamDesc')}
              </p>
              <div className="flex space-x-2 w-full">
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full bg-white text-teamsoccer-green hover:bg-gray-100">
                    {t('landing.signIn')}
                  </Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button className="w-full bg-teamsoccer-green hover:bg-teamsoccer-green-dark">
                    {t('landing.signUp')}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Main Feature Section with Discord */}
          <div className="space-y-6">
            <Card className="bg-white p-6">
              <h2 className="text-2xl font-bold mb-6 text-teamsoccer-green">
                {GAME_NAME} {t('landing.title')}
              </h2>
              <div className="aspect-video bg-gradient-to-b from-sky-400 to-sky-300 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                <img
                  src="/teamsoccer-assets/Football Manager Game.png"
                  alt="Football Manager Game"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                {/* Feature Cards */}
                <FeatureCard
                  title={t('landing.buildTrain')}
                  description={t('landing.buildTrainDesc')}
                  icon={Users}
                />
                <FeatureCard
                  title={t('landing.compete')}
                  description={t('landing.competeDesc')}
                  icon={Trophy}
                />
                <FeatureCard
                  title={t('landing.matchExp')}
                  description={t('landing.matchExpDesc')}
                  icon={Gamepad2}
                />
                <FeatureCard
                  title={t('landing.community')}
                  description={t('landing.communityDesc')}
                  icon={MessageSquare}
                />
              </div>
            </Card>

            {/* Discord Community Section */}
            <Card className="bg-gray-800 p-6 text-white">
              <h3 className="text-lg font-bold mb-4 text-gray-300">{t('landing.discordTitle')}</h3>

              {/* Discord Widget */}
              <div className="flex justify-center">
                <iframe
                  src="https://discord.com/widget?id=1376202436632514681&theme=dark"
                  width="350"
                  height="500"
                  allowTransparency={true}
                  frameBorder="0"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  className="rounded-lg"
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Stats Bar - Updated with real data */}
        <div className="mt-8 bg-white rounded-lg p-6 grid grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <StatItem number="..." label="Regions" />
              <StatItem number="..." label="Active Teams" />
              <StatItem number="..." label="Managers in waiting list" />
              <StatItem number="..." label="Leagues" />
            </>
          ) : stats ? (
            <>
              <StatItem number={stats.totalRegions} label="Regions" />
              <StatItem number={stats.totalTeams} label="Active Teams" />
              <StatItem number={stats.totalWaitingManagers} label="Managers in waiting list" />
              <StatItem number={stats.totalLeagues} label="Leagues" />
            </>
          ) : (
            <>
              <StatItem number="0" label="Regions" />
              <StatItem number="0" label="Active Teams" />
              <StatItem number="0" label="Managers in waiting list" />
              <StatItem number="0" label="Leagues" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description, icon: Icon }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0">
      <Icon className="w-8 h-8 text-teamsoccer-green" />
    </div>
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const StatItem = ({ number, label }) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-teamsoccer-green">{number}</div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

export default Landing;
