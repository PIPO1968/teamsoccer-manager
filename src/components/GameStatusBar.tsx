
import { Clock, Globe, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { GAME_LOGO } from "@/config/constants";
import { useCurrentSeason } from "@/hooks/useCurrentSeason";
import { useOnlinePlayers } from "@/hooks/useOnlinePlayers";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, languageNames, Language } from "@/contexts/LanguageContext";

const GameStatusBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { language, setLanguage, t } = useLanguage();
  const { seasonInfo, isLoading: seasonLoading } = useCurrentSeason();
  const { onlinePlayers, isLoading: playersLoading } = useOnlinePlayers();
  const { manager } = useAuth();
  const location = useLocation();
  
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-teamsoccer-green-dark text-white">
      <div className="container mx-auto px-4">
        {/* Main Bar */}
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center">
            <img 
              src={GAME_LOGO} 
              alt="Game Logo" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Empty center space */}
          <div className="flex-1"></div>
          
          <div className="flex items-center space-x-6">
            {/* Online Players and Season Info */}
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>
                {!playersLoading && `${onlinePlayers.toLocaleString()} online`}
                {!seasonLoading && seasonInfo && (
                  <>, Season {seasonInfo.current_season}, Week {seasonInfo.current_week}</>
                )}
              </span>
            </div>
            
            {/* Current Time */}
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>
                {currentTime.toLocaleString(language, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })}
              </span>
            </div>

            {/* Language Selector - Only show on landing page */}
            {isLandingPage && (
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Choose language:</span>
                <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                  <SelectTrigger className="w-[130px] bg-transparent border-teamsoccer-green hover:bg-teamsoccer-green text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languageNames).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStatusBar;
