import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/services/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { GAME_NAME, GAME_LOGO } from "@/config/constants";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthenticationResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    username: string;
  };
  manager?: {
    user_id: number;
    username: string;
    email: string;
    is_admin: number;
    status?: string;
    is_premium?: number;
    premium_expires_at?: string;
  };
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiPost<AuthenticationResponse, { email: string; password: string }>(
        "/login",
        { email, password }
      );

      if (!response.success || !response.manager) {
        toast({
          title: t('auth.signInError') || 'Login failed',
          description: 'Manager not found',
        });
        setLoading(false);
        return;
      }

      signIn(response.manager);
      setLoading(false);
      if (response.manager.status === 'carnet_pending' && response.manager.is_admin < 10) {
        navigate('/carnet');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast({
        title: t('auth.signInError') || 'Login failed',
        description: err.message || 'Unknown error',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1">
              <img src={GAME_LOGO} alt={GAME_NAME} className="h-full w-auto" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t('landing.signIn')}</CardTitle>
          <CardDescription>
            {t('auth.signInDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="manager@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="mt-2">
                {loading ? t('auth.signingIn') : t('landing.signIn')}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.noAccount')}{" "}
            <Link to="/register" className="text-primary hover:underline">
              {t('auth.createAccount')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
