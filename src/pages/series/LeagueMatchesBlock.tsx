import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "@/services/apiClient";

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

export default function LeagueMatchesBlock({ seriesId }: { seriesId: string }) {
    const [matches, setMatches] = useState<MatchRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        apiFetch<{ matches: MatchRow[] }>(`/series/${seriesId}/matches?season=1`)
            .then((data) => {
                setMatches(data.matches || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [seriesId]);

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Partidos de liga (1ª temporada)</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                {loading ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">Cargando partidos...</div>
                ) : matches.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">No hay partidos registrados</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="px-2 py-1 text-left">Fecha</th>
                                    <th className="px-2 py-1 text-left">Local</th>
                                    <th className="px-2 py-1 text-left">Visitante</th>
                                    <th className="px-2 py-1 text-center">Marcador</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((m) => (
                                    <tr key={m.match_id}>
                                        <td className="px-2 py-1 whitespace-nowrap">{new Date(m.match_date).toLocaleDateString()}</td>
                                        <td className="px-2 py-1">
                                            <Link to={`/team/${m.home_team_id}`} className="hover:underline">
                                                {m.home_team_name}
                                            </Link>
                                        </td>
                                        <td className="px-2 py-1">
                                            <Link to={`/team/${m.away_team_id}`} className="hover:underline">
                                                {m.away_team_name}
                                            </Link>
                                        </td>
                                        <td className="px-2 py-1 text-center font-bold">
                                            {typeof m.home_score === "number" && typeof m.away_score === "number"
                                                ? `${m.home_score} - ${m.away_score}`
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
