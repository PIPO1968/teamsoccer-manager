import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shield, Bot } from "lucide-react";
import { apiFetch } from "@/services/apiClient";

interface PlayerStat {
    player_id: number;
    first_name: string;
    last_name: string;
    position: string;
    goals?: number;
    assists?: number;
    team_id: number;
    team_name: string;
    team_logo: string | null;
}

interface TeamConceded {
    team_id: number;
    team_name: string;
    team_logo: string | null;
    goals_against: number;
    played: number;
}

interface MatchRow {
    match_id: number;
    home_team_id: number;
    away_team_id: number;
    home_team_name: string;
    away_team_name: string;
    home_team_logo: string | null;
    away_team_logo: string | null;
    home_score?: number;
    away_score?: number;
    match_date: string;
}

interface SeriesStats {
    topScorers: PlayerStat[];
    topAssists: PlayerStat[];
    fewestConceded: TeamConceded[];
    playedMatches: MatchRow[];
    upcomingMatches: MatchRow[];
}

const TeamBadge = ({ logo, name, isBot }: { logo: string | null; name: string; isBot?: boolean }) => {
    if (isBot) return (
        <div className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
            <Bot className="w-3 h-3 text-white" />
        </div>
    );
    if (logo) return <img src={logo} alt={name} className="w-5 h-5 rounded-full object-contain flex-shrink-0" />;
    return (
        <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-3 h-3 text-white" />
        </div>
    );
};

export default function SeriesStatsBlock({ seriesId }: { seriesId: string }) {
    const [stats, setStats] = useState<SeriesStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        apiFetch<SeriesStats & { success: boolean }>(`/series/${seriesId}/stats`)
            .then(d => { setStats(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, [seriesId]);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                {loading ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">Cargando...</div>
                ) : !stats ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">Sin datos disponibles</div>
                ) : (
                    <Tabs defaultValue="scorers">
                        <TabsList className="w-full h-auto flex-wrap gap-1 mb-3">
                            <TabsTrigger value="scorers" className="text-xs px-2 py-1">Goleadores</TabsTrigger>
                            <TabsTrigger value="assists" className="text-xs px-2 py-1">Asistencias</TabsTrigger>
                            <TabsTrigger value="conceded" className="text-xs px-2 py-1">Menos goles</TabsTrigger>
                            <TabsTrigger value="upcoming" className="text-xs px-2 py-1">Próximos</TabsTrigger>
                            <TabsTrigger value="played" className="text-xs px-2 py-1">Jugados</TabsTrigger>
                        </TabsList>

                        {/* Goleadores */}
                        <TabsContent value="scorers" className="mt-0">
                            {stats.topScorers.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-3">Sin goles registrados</p>
                            ) : (
                                <div className="space-y-1">
                                    {stats.topScorers.map((p, i) => (
                                        <div key={p.player_id} className="flex items-center gap-2 text-xs py-1 border-b last:border-0">
                                            <span className="w-4 text-muted-foreground font-mono">{i + 1}</span>
                                            <TeamBadge logo={p.team_logo} name={p.team_name} />
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/players/${p.player_id}`} className="font-medium hover:underline truncate block">
                                                    {p.first_name} {p.last_name}
                                                </Link>
                                                <span className="text-muted-foreground truncate block">{p.team_name}</span>
                                            </div>
                                            <span className="font-bold text-emerald-600 w-5 text-right">{p.goals}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Asistencias */}
                        <TabsContent value="assists" className="mt-0">
                            {stats.topAssists.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-3">Sin asistencias registradas</p>
                            ) : (
                                <div className="space-y-1">
                                    {stats.topAssists.map((p, i) => (
                                        <div key={p.player_id} className="flex items-center gap-2 text-xs py-1 border-b last:border-0">
                                            <span className="w-4 text-muted-foreground font-mono">{i + 1}</span>
                                            <TeamBadge logo={p.team_logo} name={p.team_name} />
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/players/${p.player_id}`} className="font-medium hover:underline truncate block">
                                                    {p.first_name} {p.last_name}
                                                </Link>
                                                <span className="text-muted-foreground truncate block">{p.team_name}</span>
                                            </div>
                                            <span className="font-bold text-blue-600 w-5 text-right">{p.assists}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Menos goles encajados */}
                        <TabsContent value="conceded" className="mt-0">
                            <div className="space-y-1">
                                {stats.fewestConceded.map((t, i) => (
                                    <div key={t.team_id} className="flex items-center gap-2 text-xs py-1 border-b last:border-0">
                                        <span className="w-4 text-muted-foreground font-mono">{i + 1}</span>
                                        <TeamBadge logo={t.team_logo} name={t.team_name} />
                                        <Link to={`/team/${t.team_id}`} className="flex-1 font-medium hover:underline truncate">
                                            {t.team_name}
                                        </Link>
                                        <span className="text-muted-foreground mr-1">{t.played}PJ</span>
                                        <span className="font-bold text-orange-600 w-5 text-right">{t.goals_against}</span>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Próximos partidos */}
                        <TabsContent value="upcoming" className="mt-0">
                            {stats.upcomingMatches.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-3">No hay partidos programados</p>
                            ) : (
                                <div className="space-y-1">
                                    {stats.upcomingMatches.map(m => (
                                        <Link
                                            key={m.match_id}
                                            to={`/match/${m.match_id}`}
                                            className="flex items-center gap-1 text-xs py-1.5 px-1 hover:bg-muted rounded border-b last:border-0"
                                        >
                                            <div className="flex items-center gap-1 flex-1 min-w-0 justify-between">
                                                <span className="truncate text-right flex-1">{m.home_team_name}</span>
                                                <span className="text-muted-foreground px-1 flex-shrink-0">vs</span>
                                                <span className="truncate flex-1">{m.away_team_name}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* Partidos jugados */}
                        <TabsContent value="played" className="mt-0">
                            {stats.playedMatches.length === 0 ? (
                                <p className="text-xs text-muted-foreground text-center py-3">Sin partidos jugados</p>
                            ) : (
                                <div className="space-y-1">
                                    {stats.playedMatches.map(m => (
                                        <Link
                                            key={m.match_id}
                                            to={`/match/${m.match_id}`}
                                            className="flex items-center gap-1 text-xs py-1.5 px-1 hover:bg-muted rounded border-b last:border-0"
                                        >
                                            <div className="flex items-center gap-1 flex-1 min-w-0 justify-between">
                                                <span className="truncate text-right flex-1">{m.home_team_name}</span>
                                                <span className="font-bold px-1 flex-shrink-0 tabular-nums">
                                                    {m.home_score ?? 0} - {m.away_score ?? 0}
                                                </span>
                                                <span className="truncate flex-1">{m.away_team_name}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
}
