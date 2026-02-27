import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Users, Flag as FlagIcon, Calendar, Mail, Shield, Send, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useManagerStatus } from "@/hooks/useManagerStatus";
import { Flag } from "@/components/ui/flag";
import { NewMessageDialog } from "@/components/messages/NewMessageDialog";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { useAvatarConfig } from "@/hooks/useAvatarConfig";

interface ManagerProfileProps {
  managerProfile: {
    username: string;
    email: string;
    is_admin: number;
    user_id: number;
    country_id: number;
    country_name?: string;
    is_premium?: number;
    premium_expires_at?: string;
    status?: string;
    created_at: string;
    teams?: {
      name: string;
      team_id: number;
      created_at: string;
      is_bot: number;
      club_logo?: string;
    }[];
  };
  isOwnProfile: boolean;
}

export function ManagerProfile({ managerProfile, isOwnProfile }: ManagerProfileProps) {
  const { is_online, last_seen } = useManagerStatus(managerProfile.user_id);
  const { manager } = useAuth();
  const { avatarConfig } = useAvatarConfig(managerProfile.user_id);
  const navigate = useNavigate();
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAdminPrefix = (isAdmin: number) => {
    switch (isAdmin) {
      case 4: return 'DEV-';
      case 3: return 'STAFF-';
      case 2: return 'ADMIN-';
      case 1: return 'MOD-';
      default: return '';
    }
  };

  const getAdminBadge = (isAdmin: number) => {
    switch (isAdmin) {
      case 4: 
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
            <Shield className="h-3 w-3 mr-1" />
            DEV
          </Badge>
        );
      case 3: 
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            STAFF
          </Badge>
        );
      case 2: 
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
            <Crown className="h-3 w-3 mr-1" />
            ADMIN
          </Badge>
        );
      case 1: 
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Shield className="h-3 w-3 mr-1" />
            MOD
          </Badge>
        );
      default: return null;
    }
  };

  const displayUsername = `${getAdminPrefix(managerProfile.is_admin)}${managerProfile.username}`;

  const handleEditAvatar = () => {
    navigate(`/manager/${managerProfile.user_id}/avatar`);
  };

  return (
    <div className="space-y-6">
      {/* Manager Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <AvatarDisplay config={avatarConfig} size="lg" />
              
              {/* Online Status Indicator */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                is_online ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              
              {/* Edit Avatar Button - only show for own profile */}
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditAvatar}
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 mt-4 text-xs px-2 py-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            <div className="flex-1 mt-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{displayUsername}</h2>
                <span className="text-sm text-gray-500">#{managerProfile.user_id}</span>
                {getAdminBadge(managerProfile.is_admin)}
                {managerProfile.is_premium === 1 && (
                  <Badge variant="default" className="bg-purple-600">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
                {managerProfile.status === 'waiting_list' && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Waiting List
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  {managerProfile.country_id ? (
                    <Flag countryId={managerProfile.country_id} className="max-w-[28px] max-h-[20px]" />
                  ) : (
                    <FlagIcon className="h-4 w-4" />
                  )}
                  {managerProfile.country_name || `Country ID: ${managerProfile.country_id}`}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(managerProfile.created_at)}
                </div>
                {isOwnProfile && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {managerProfile.email}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  {is_online ? (
                    <span className="text-green-600 font-medium">● Online now</span>
                  ) : (
                    <span className="text-gray-500">
                      Last seen: {last_seen || 'Unknown'}
                    </span>
                  )}
                </div>
                
                {/* Send Message Button - only show if not own profile and user is authenticated */}
                {!isOwnProfile && manager && (
                  <NewMessageDialog
                    recipientId={managerProfile.user_id}
                    recipientName={managerProfile.username}
                    trigger={
                      <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded-md hover:bg-blue-50 transition-colors">
                        <Send className="h-4 w-4" />
                        Send Message
                      </button>
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager Details Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Premium Status */}
        {managerProfile.is_premium === 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-4 w-4 text-yellow-600" />
                Premium Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="default" className="bg-yellow-600">Active</Badge>
              </div>
              {managerProfile.premium_expires_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Expires:</span>
                  <span className="text-sm font-medium">
                    {formatDate(managerProfile.premium_expires_at)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Team Information */}
        {managerProfile.teams && managerProfile.teams.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              {managerProfile.teams.map((team) => (
                <div key={team.team_id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {team.club_logo && (
                      <img 
                        src={team.club_logo} 
                        alt={`${team.name} logo`}
                        className="w-6 h-6 rounded"
                      />
                    )}
                    <Link 
                      to={`/team/${team.team_id}`} 
                      className="text-green-700 hover:underline font-medium"
                    >
                      {team.name}
                    </Link>
                    {team.is_bot === 1 && (
                      <Badge variant="outline" className="text-xs">
                        Bot
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(team.created_at)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Account Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Manager ID:</span>
              <span className="text-sm font-medium">#{managerProfile.user_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={managerProfile.status === 'waiting_list' ? 'outline' : 'default'}>
                {managerProfile.status === 'waiting_list' ? 'Waiting List' : 'Active'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role:</span>
              <span className="text-sm font-medium">
                {managerProfile.is_admin >= 1 ? 
                  (managerProfile.is_admin === 4 ? 'Developer' :
                   managerProfile.is_admin === 3 ? 'Staff' :
                   managerProfile.is_admin === 2 ? 'Administrator' : 'Moderator') : 
                  'Manager'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
