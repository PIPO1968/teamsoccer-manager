import { useEffect, useState } from "react";

export type FixtureBlock = {
    type: "league" | "friendly";
    round?: number;
    date: string;
    matches: Array<{
        match_id: number;
        home_team_id: number;
        home_team_name: string;
        away_team_id: number;
        away_team_name: string;
        match_date: string;
        status: string;
        home_score: number | null;
        away_score: number | null;
    }>;
};

export function useSeriesFixtures(seriesId?: string) {
    const [fixtures, setFixtures] = useState<FixtureBlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!seriesId) return;
        setIsLoading(true);
        setError(null);
        fetch(`/series/${seriesId}/fixtures`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setFixtures(data.fixtures);
                } else {
                    setError("No se pudieron cargar los fixtures");
                }
            })
            .catch(() => setError("Error de red al cargar fixtures"))
            .finally(() => setIsLoading(false));
    }, [seriesId]);

    return { fixtures, isLoading, error };
}
