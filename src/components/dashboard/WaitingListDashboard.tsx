
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Star, Users, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format, differenceInDays } from "date-fns";

export const WaitingListDashboard = () => {
  const { manager, isPremium } = useAuth();

  const getPremiumStatus = () => {
    if (!manager?.premium_expires_at) {
      return null;
    }

    const expiryDate = new Date(manager.premium_expires_at);
    const daysRemaining = differenceInDays(expiryDate, new Date());
    
    return {
      expiryDate,
      daysRemaining: Math.max(0, daysRemaining),
      isActive: daysRemaining > 0
    };
  };

  const premiumStatus = getPremiumStatus();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {manager?.username}!</h1>
        <p className="text-gray-600 mt-2">Your manager account is currently on the waiting list for league assignment.</p>
      </div>

      {/* Premium Status Card */}
      {premiumStatus && (
        <Card className={`mb-6 ${premiumStatus.isActive ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className={`h-5 w-5 ${premiumStatus.isActive ? 'text-yellow-500' : 'text-gray-400'}`} />
              Premium Access Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {premiumStatus.isActive ? (
              <div>
                <p className="text-green-700 font-medium mb-2">
                  🎉 You have premium access!
                </p>
                <p className="text-sm text-gray-600">
                  Your premium access expires on {format(premiumStatus.expiryDate, 'MMMM d, yyyy')}
                  {premiumStatus.daysRemaining > 0 && (
                    <span className="font-medium text-yellow-700">
                      {" "}({premiumStatus.daysRemaining} days remaining)
                    </span>
                  )}
                </p>
                <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Premium features include advanced statistics, priority support, and exclusive content!
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                Your premium access has expired. Consider upgrading to unlock premium features!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Waiting List Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Waiting List Status
            </CardTitle>
            <CardDescription>
              Current position in the league assignment queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-600">Active</p>
              <p className="text-sm text-gray-600">
                You are on the waiting list for league assignment. League assignments are processed regularly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your manager profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Manager Name</p>
                <p className="font-medium">{manager?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{manager?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Waiting List
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-500" />
              What's Next?
            </CardTitle>
            <CardDescription>
              Steps to get started in the game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Account Created</p>
                  <p className="text-xs text-gray-600">Your manager account is active</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                <div>
                  <p className="text-sm font-medium">League Assignment Pending</p>
                  <p className="text-xs text-gray-600">Waiting for placement in a league</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Team Management</p>
                  <p className="text-xs text-gray-600">Manage your team once assigned</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            While you wait for league assignment, here's what you can expect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Welcome to the game! Your account has been created and you're now on the waiting list for league assignment. 
              Here's what happens next:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>League assignments are processed automatically on a regular basis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>You'll be placed in an appropriate league based on your selected country</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>Once assigned, you'll be able to manage your team, players, and compete in matches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>You'll receive notifications when your league assignment is complete</span>
              </li>
            </ul>
            {premiumStatus?.isActive && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium">
                  🌟 Premium Benefits: As a premium member, you'll have access to advanced team statistics, 
                  priority customer support, and exclusive features once your league assignment is complete!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
