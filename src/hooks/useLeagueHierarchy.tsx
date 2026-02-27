
import { useState, useEffect } from "react";

export type SeriesInfo = {
  series_id: number;
  league_id: number;
  division: number;
  group_number: number;
  season: number;
  parent_series_id: number | null;
  division_level: number;
};

export const useLeagueHierarchy = (currentSeriesId: string | undefined) => {
  const [currentSeries, setCurrentSeries] = useState<SeriesInfo | null>(null);
  const [higherSeries, setHigherSeries] = useState<SeriesInfo | null>(null);
  const [lowerSeries, setLowerSeries] = useState<SeriesInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      if (!currentSeriesId) {
        setCurrentSeries(null);
        setHigherSeries(null);
        setLowerSeries(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Llama a la API Express para obtener la jerarquía de series
        const response = await fetch(`/api/series/${currentSeriesId}/hierarchy`);
        if (!response.ok) throw new Error("No se pudo obtener la jerarquía de series");
        const data = await response.json();
        setCurrentSeries(data.currentSeries || null);
        setHigherSeries(data.higherSeries || null);
        setLowerSeries(data.lowerSeries || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener jerarquía de series");
        setCurrentSeries(null);
        setHigherSeries(null);
        setLowerSeries(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeries();
  }, [currentSeriesId]);

  return { currentSeries, higherSeries, lowerSeries, isLoading, error };
};
