
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Crown } from "lucide-react";
import { GAME_NAME } from "@/config/constants";

const Help = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Help with {GAME_NAME}
          </h1>
        </div>

        <div className="space-y-6">
          {/* Forums Section */}
          <Card className="border-l-4 border-l-teamsoccer-green">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-teamsoccer-green flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Forums
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                In the{" "}
                <Link 
                  to="/forums" 
                  className="text-teamsoccer-green hover:underline font-medium"
                >
                  {GAME_NAME} forums
                </Link>
                , there is a special forum for all sorts of game-related questions.
              </p>
            </CardContent>
          </Card>

          {/* Staff Section */}
          <Card className="border-l-4 border-l-teamsoccer-green">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-teamsoccer-green flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our volunteer Staff help keep {GAME_NAME} a fair and friendly game. Visit the{" "}
                <span className="text-teamsoccer-green font-medium">Staff pages</span>{" "}
                to learn more about what Staff do, and to report suspected cheating cases.
              </p>
            </CardContent>
          </Card>

          {/* About Premium Section */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-yellow-600 flex items-center gap-2">
                <Crown className="h-5 w-5" />
                About Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Read more about the extra features the{" "}
                <Link 
                  to="/shop" 
                  className="text-yellow-600 hover:underline font-medium"
                >
                  {GAME_NAME} Premium
                </Link>{" "}
                package contains. Premium makes {GAME_NAME} more interesting and fun to play, 
                at the same time as you help the {GAME_NAME} team to develop the game further.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Help;
