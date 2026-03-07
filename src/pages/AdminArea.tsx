import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Shield, Newspaper, UserCog, Building, User, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { apiFetch } from "@/services/apiClient";
import { AdminBadge } from "@/components/admin/OnlineManagerBadges";

interface OnlineManager {
  user_id: number;
  username: string;
  is_admin: number;
  country_name?: string;
}

const AdminArea = () => {
  const { manager } = useAuth();
  const [onlineManagers, setOnlineManagers] = useState<OnlineManager[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await apiFetch<{ success: boolean; managers: OnlineManager[] }>('/admin/online-managers');
        setOnlineManagers(data.managers ?? []);
      } catch {
        setOnlineManagers([]);
      }
    };
    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Check if user has required admin level
  if (!manager?.is_admin || manager.is_admin <= 3) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Admin Area</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Galería de Imágenes de Jugadores */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Galería de Imágenes de Jugadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Visualiza todas las imágenes de jugadores por país y rasgo
            </p>
            <Link
              to="/admin/PlayerImageGallery"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Ver Galería de Imágenes
            </Link>
          </CardContent>
        </Card>
        {/* Online Managers - Available for staff level 4+ */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Online Managers
              </div>
              <span className="text-sm font-normal bg-green-100 text-green-700 rounded-full px-2 py-0.5">
                {onlineManagers.length} en línea
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {onlineManagers.length === 0 ? (
              <p className="text-sm text-gray-500 mb-4">No hay managers conectados ahora mismo</p>
            ) : (
              <ul className="space-y-1 mb-4">
                {onlineManagers.map(m => (
                  <li key={m.user_id} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    <Link to={`/manager/${m.user_id}`} className="font-medium text-blue-600 hover:underline">
                      {m.username}
                    </Link>
                    <AdminBadge adminLevel={m.is_admin} />
                    {m.country_name && <span className="text-gray-400 text-xs">{m.country_name}</span>}
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/admin/online-managers"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Ver detalle completo
            </Link>
          </CardContent>
        </Card>

        {/* Waitlist Management - Available for admin level 4+ */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Waitlist Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage managers and waitlist applications
            </p>
            <Link
              to="/admin/waitlist"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              See Waitlist Managers
            </Link>
          </CardContent>
        </Card>

        {/* Community News - Available for admin level 4+ */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Community News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Create and manage community news articles
            </p>
            <Link
              to="/admin/news"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Manage News
            </Link>
          </CardContent>
        </Card>

        {/* Advanced Admin Tools - Available for admin level 4+ */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Manager Admin Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Edit manager details, premium status, and admin levels
            </p>
            <Link
              to="/admin/managers"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Manage Managers
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Team Admin Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Edit team details, finances, and league assignments
            </p>
            <Link
              to="/admin/teams"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Manage Teams
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Player Admin Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Edit player attributes, create new players, and manage ownership
            </p>
            <Link
              to="/admin/players"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Manage Players
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminArea;
