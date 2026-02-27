import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GAME_NAME, GAME_LOGO } from "@/config/constants";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthenticationResponse {
  success: boolean;
  message: string;
  manager?: {
    user_id: number;
    username: string;
    email: string;
    is_admin: number;
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
      // Autenticación real con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user) {
        toast({
          title: t('auth.signInError') || 'Login failed',
          description: error?.message || 'Invalid credentials',
        });
        setLoading(false);
        return;
      }
      // Obtener datos del manager
      const { data: managerData, error: managerError } = await supabase
        .from('managers')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();
      if (managerError || !managerData) {
        toast({
          title: t('auth.signInError') || 'Login failed',
          description: managerError?.message || 'Manager not found',
        });
        setLoading(false);
        return;
      }
      signIn(managerData);
      setLoading(false);
      navigate('/dashboard');
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
